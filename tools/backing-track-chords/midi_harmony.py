"""Offline MIDI decoding, musical evidence, and deterministic segmentation."""
from collections import defaultdict, deque
from dataclasses import dataclass
from pathlib import Path
import subprocess
import tempfile
import json

import mido
import numpy as np


@dataclass(frozen=True)
class Note:
    start: float
    end: float
    pitch: int
    velocity: int


def sanitize_keys(data: bytes) -> tuple[bytes, int]:
    """Walk SMF events (never byte-pattern replace inside arbitrary payloads).

    Invalid key signatures become opaque sequencer-specific metadata with
    exactly the same payload length/delta time. All other bytes are preserved.
    """
    result = bytearray(data)
    if data[:4] != b'MThd' or len(data) < 14:
        raise ValueError('Not a Standard MIDI File')
    position = 8 + int.from_bytes(data[4:8], 'big')
    repairs = 0

    def vlq(pos, end):
        value = 0
        for _ in range(4):
            if pos >= end:
                raise ValueError('Truncated MIDI VLQ')
            byte = data[pos]
            pos += 1
            value = (value << 7) | (byte & 127)
            if byte < 128:
                return value, pos
        raise ValueError('Invalid MIDI VLQ')

    while position < len(data):
        if position + 8 > len(data):
            raise ValueError('Truncated MIDI chunk')
        length = int.from_bytes(data[position + 4:position + 8], 'big')
        end = position + 8 + length
        if end > len(data):
            raise ValueError('Truncated MIDI track')
        if data[position:position + 4] == b'MTrk':
            pos, running = position + 8, None
            while pos < end:
                _, pos = vlq(pos, end)
                if pos >= end:
                    raise ValueError('Missing MIDI event')
                status = data[pos]
                if status >= 128:
                    pos += 1
                    if status < 240:
                        running = status
                elif running is not None:
                    status = running
                else:
                    raise ValueError('Invalid running status')
                if status == 255:
                    if pos >= end:
                        raise ValueError('Missing MIDI metadata type')
                    kind_pos = pos
                    kind = data[pos]
                    size, pos = vlq(pos + 1, end)
                    if pos + size > end:
                        raise ValueError('Truncated MIDI metadata')
                    if kind == 89:
                        valid = size == 2 and (data[pos] <= 7 or data[pos] >= 249) and data[pos + 1] <= 1
                        if not valid:
                            result[kind_pos] = 127
                            repairs += 1
                    pos += size
                elif status in (240, 247):
                    size, pos = vlq(pos, end)
                    pos += size
                    running = None
                elif 128 <= status < 240:
                    pos += 1 if status >> 4 in (12, 13) else 2
                else:
                    raise ValueError(f'Unsupported MIDI status {status}')
                if pos > end:
                    raise ValueError('Truncated MIDI event')
        position = end
    return bytes(result), repairs


def read_midi(path: Path):
    data, repairs = sanitize_keys(path.read_bytes())
    if repairs:
        with tempfile.TemporaryDirectory(prefix='fretlab-midi-') as directory:
            copy = Path(directory) / 'sanitized.mid'
            copy.write_bytes(data)
            midi = mido.MidiFile(copy)
    else:
        midi = mido.MidiFile(path)
    if midi.type == 2 or midi.ticks_per_beat <= 0:
        raise ValueError('Only synchronous PPQ MIDI types 0 and 1 are supported')
    # Explicit tempo integration; a tempo event applies after its own delta.
    now, tempo = 0.0, 500000
    active = defaultdict(deque)
    sustained = defaultdict(list)
    pedal = defaultdict(bool)
    notes = []

    def finish(channel, pitch, start_velocity):
        start, velocity = start_velocity
        if now > start:
            notes.append(Note(start, now, pitch, velocity))

    for message in mido.merge_tracks(midi.tracks):
        now += mido.tick2second(message.time, midi.ticks_per_beat, tempo)
        if message.type == 'set_tempo':
            if message.tempo <= 0:
                raise ValueError('MIDI tempo must be positive')
            tempo = message.tempo
        elif message.type in ('note_on', 'note_off') and message.channel != 9:
            key = message.channel, message.note
            if message.type == 'note_on' and message.velocity > 0:
                active[key].append((now, message.velocity))
            elif active[key]:
                item = active[key].popleft()
                if pedal[message.channel]:
                    sustained[message.channel].append((message.note, item))
                else:
                    finish(message.channel, message.note, item)
        elif message.type == 'control_change' and message.control == 64:
            pedal[message.channel] = message.value >= 64
            if not pedal[message.channel]:
                for pitch, item in sustained.pop(message.channel, []):
                    finish(message.channel, pitch, item)
    for (channel, pitch), items in active.items():
        for item in items:
            finish(channel, pitch, item)
    for channel, items in sustained.items():
        for pitch, item in items:
            finish(channel, pitch, item)
    if not notes or now <= 0:
        raise ValueError(f'No pitched notes in {path}')
    return sorted(notes, key=lambda n: (n.start, n.pitch, n.end)), now, repairs


def vocabulary(qualities=('major', 'minor', '7', 'm7')):
    bridge = Path(__file__).with_name('export-vocabulary.mjs')
    output = subprocess.check_output(['node', str(bridge), *qualities], text=True)
    return json.loads(output)


def note_chroma(notes, edges):
    values = np.zeros((len(edges) - 1, 12))
    for note in notes:
        first = max(0, np.searchsorted(edges, note.start, side='right') - 1)
        last = min(len(values), np.searchsorted(edges, note.end, side='left'))
        if first >= last:
            continue
        overlap = np.maximum(0, np.minimum(edges[first + 1:last + 1], note.end)
                             - np.maximum(edges[first:last], note.start))
        values[first:last, note.pitch % 12] += overlap * note.velocity / 127
    return values / np.diff(edges)[:, None]


def chord_scores(harmony, bass, candidates, bass_weight=0.65):
    """Evidence for chord tones, missing tones, outside notes, separate bass root.

    Bass is bounded, so a passing bass note cannot overrule a clear voicing.
    Confidence derived later is a score margin, not a calibrated probability.
    """
    strength = harmony / np.maximum(harmony.max(axis=1, keepdims=True), 1e-12)
    mass = harmony / np.maximum(harmony.sum(axis=1, keepdims=True), 1e-12)
    bass_mass = bass / np.maximum(bass.sum(axis=1, keepdims=True), 1e-12)
    scores = np.empty((len(harmony), len(candidates) + 1))
    for index, chord in enumerate(candidates):
        pitches = chord['pitches']
        # Third/seventh characterize quality; fifth is weaker evidence.
        weights = np.array([1.0 if x == 0 else 0.65 if x == 7 else 1.2 for x in chord['intervals']])
        present = strength[:, pitches]
        score = (present * weights).sum(axis=1) / weights.sum() * 2.8
        score -= (1 - mass[:, pitches].sum(axis=1)) * 2.2
        score -= ((1 - present) * weights).sum(axis=1) / weights.sum() * 0.6
        score += bass_weight * bass_mass[:, chord['root']]
        scores[:, index] = score
    # Silence has its own state; no invented chord through silent gaps.
    silent = harmony.sum(axis=1) < 1e-8
    scores[silent, :-1] = -3
    scores[:, -1] = np.where(silent, 1.0, -3.0)
    return scores


def smooth(scores, step, change_penalty=0.65):
    """Viterbi with a cost per change and time-integrated emissions."""
    costs = scores[0] * step
    parents = np.zeros(scores.shape, dtype=np.int32)
    for index in range(1, len(scores)):
        best = int(costs.argmax())
        switch = costs[best] - change_penalty
        parents[index] = np.where(costs >= switch, np.arange(len(costs)), best)
        costs = np.maximum(costs, switch) + scores[index] * step
    path = np.empty(len(scores), dtype=np.int32)
    path[-1] = costs.argmax()
    for index in range(len(scores) - 1, 0, -1):
        path[index - 1] = parents[index, path[index]]
    return path


def segments(path, scores, edges, candidates):
    result = []
    first = 0
    for end in range(1, len(path) + 1):
        if end < len(path) and path[end] == path[first]:
            continue
        state = path[first]
        if state < len(candidates):
            alternatives = np.delete(scores[first:end], state, axis=1).max(axis=1)
            margin = np.mean(scores[first:end, state] - alternatives)
            confidence = float(np.clip(0.5 + margin / 2, 0, 1))
            result.append(dict(symbol=candidates[state]['symbol'], midiStartMs=round(edges[first] * 1000),
                               midiEndMs=round(edges[end] * 1000), confidence=round(confidence, 4)))
        first = end
    return result
