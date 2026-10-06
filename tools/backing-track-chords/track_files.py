"""Shared-directory contract for editorial analysis; no runtime dependency."""
from dataclasses import dataclass
import io
import json
import math
import os
from pathlib import Path
import re
import tempfile

IDENTIFIER = re.compile(r'^[a-z0-9][a-z0-9_-]*$')
BACKING = re.compile(r'^Backingtrack_([a-z0-9][a-z0-9_-]*)\.mp3$')
EXAMPLE = re.compile(r'^Example_([a-z0-9][a-z0-9_-]*)\.mp3$')
TRACK = re.compile(r'^Track_([a-z0-9][a-z0-9_-]*)\.json$')


@dataclass(frozen=True)
class TrackFiles:
    identifier: str
    folder: Path
    backing: Path
    example: Path
    output: Path

    @property
    def debug(self):
        return self.folder / '_analysis'


def resolve_track(root, identifier):
    if not IDENTIFIER.fullmatch(identifier):
        raise ValueError('Invalid track id: expected ^[a-z0-9][a-z0-9_-]*$ (no normalization)')
    root = Path(root).resolve(strict=True)
    requested = root / identifier
    folder = requested.resolve(strict=True)
    if not folder.is_dir() or folder.parent != root or folder.name != identifier:
        raise ValueError('Track folder must be a direct child of tracks-root with exactly the requested id')
    matches = {pattern: [] for pattern in (BACKING, EXAMPLE, TRACK)}
    for entry in sorted(folder.iterdir()):
        for pattern in matches:
            match = pattern.fullmatch(entry.name)
            if match:
                if not entry.is_file() or entry.is_symlink():
                    raise ValueError(f'Expected a regular file: {entry.name}')
                matches[pattern].append((entry, match[1]))
    for pattern in (BACKING, EXAMPLE, TRACK):
        if len(matches[pattern]) > 1:
            raise ValueError(f'Competing files: {", ".join(p.name for p, _ in matches[pattern])}')
        for entry, captured in matches[pattern]:
            if captured != identifier:
                raise ValueError(f'Folder/id mismatch: {entry.name} in {identifier}')
    expected = (folder / f'Backingtrack_{identifier}.mp3', folder / f'Example_{identifier}.mp3',
                folder / f'Track_{identifier}.json')
    for pattern, path in zip((BACKING, EXAMPLE), expected):
        if not matches[pattern]:
            raise ValueError(f'Missing required file: {path}')
    # Important on case-insensitive filesystems: a differently cased existing
    # JSON must not be silently overwritten through the canonical spelling.
    if expected[2].exists() and not matches[TRACK]:
        raise ValueError(f'Existing JSON does not have the exact canonical filename: {expected[2]}')
    return TrackFiles(identifier, folder, *expected)


def _number(value, label, positive=False, integer=False):
    if (isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value)
            or (positive and value <= 0) or (integer and not isinstance(value, int))):
        raise ValueError(f'Invalid {label}')


def validate_track(value, identifier):
    if not isinstance(value, dict) or type(value.get('schemaVersion')) is not int or value['schemaVersion'] != 1:
        raise ValueError('Expected Track schemaVersion 1')
    if value.get('id') != identifier:
        raise ValueError('JSON id does not match folder/requested track id')
    for field in ('title', 'style', 'key'):
        if not isinstance(value.get(field), str) or not value[field].strip():
            raise ValueError(f'Missing or invalid editorial field: {field}')
    _number(value.get('bpm'), 'bpm', positive=True)
    for field in ('durationMs', 'chordCoverageEndMs'):
        _number(value.get(field), field, positive=True, integer=True)
    analysis = value.get('analysis')
    if not isinstance(analysis, dict):
        raise ValueError('Invalid analysis')
    for field in ('scale', 'offsetMs', 'meanSimilarity', 'midiDurationMs', 'audioDurationMs'):
        _number(analysis.get(field), f'analysis.{field}', positive=field in ('scale', 'midiDurationMs', 'audioDurationMs'))
    if not 0 <= analysis['meanSimilarity'] <= 1.000001:
        raise ValueError('Invalid meanSimilarity')
    if analysis['audioDurationMs'] != value['durationMs']:
        raise ValueError('Audio duration mismatch')
    # midiDurationMs is already rounded by the unchanged analysis engine.
    coverage = analysis['scale'] * analysis['midiDurationMs'] + analysis['offsetMs']
    if abs(value['chordCoverageEndMs'] - coverage) > 1 + analysis['scale']:
        raise ValueError('Coverage must be the transformed MIDI end')
    timeline = value.get('chordTimeline')
    if not isinstance(timeline, list):
        raise ValueError('Invalid chordTimeline')
    previous_end = 0
    for event in timeline:
        if not isinstance(event, dict) or not isinstance(event.get('symbol'), str) or not event['symbol'].strip():
            raise ValueError('Invalid chord event')
        for field in ('startMs', 'endMs'):
            _number(event.get(field), field, integer=True)
        if not previous_end <= event['startMs'] < event['endMs'] <= min(value['durationMs'], value['chordCoverageEndMs']):
            raise ValueError('Timeline overlaps, is unordered or exceeds audio/MIDI coverage')
        if 'confidence' in event:
            _number(event['confidence'], 'confidence')
            if not 0 <= event['confidence'] <= 1:
                raise ValueError('Invalid confidence')
        previous_end = event['endMs']


def _pairs(pairs):
    value = {}
    for key, item in pairs:
        if key in value:
            raise ValueError(f'Duplicate JSON key: {key}')
        value[key] = item
    return value


def load_existing(path, identifier):
    if not path.exists():
        return None
    value = json.loads(path.read_text(encoding='utf-8'), object_pairs_hook=_pairs,
                       parse_constant=lambda token: (_ for _ in ()).throw(ValueError(f'Invalid JSON number: {token}')))
    validate_track(value, identifier)
    return value


def editorial_fields(existing, overrides):
    metadata = dict(existing or {})
    metadata.update({key: value for key, value in overrides.items() if value is not None})
    for field in ('title', 'style', 'key'):
        if not isinstance(metadata.get(field), str) or not metadata[field].strip():
            raise ValueError(f'New track requires --{field} (or an existing valid Track JSON)')
    if 'bpm' in metadata:
        _number(metadata['bpm'], 'bpm', positive=True)
    return metadata


def midi_bpm(path, scale):
    """Representative MIDI tempo, duration-weighted median, mapped to audio.

    Only a metadata fallback: it never changes MIDI event conversion/alignment.
    """
    import mido
    from midi_harmony import sanitize_keys
    data, _ = sanitize_keys(path.read_bytes())
    midi = mido.MidiFile(file=io.BytesIO(data))
    tempo, spans = 500000, []
    for message in mido.merge_tracks(midi.tracks):
        seconds = mido.tick2second(message.time, midi.ticks_per_beat, tempo)
        if seconds > 0:
            spans.append((60000000 / tempo / scale, seconds))
        if message.type == 'set_tempo':
            tempo = message.tempo
    midpoint = sum(seconds for _, seconds in spans) / 2
    accumulated = 0
    for bpm, seconds in sorted(spans):
        accumulated += seconds
        if accumulated >= midpoint:
            return round(bpm, 3)
    raise ValueError('Cannot estimate representative MIDI BPM; provide --bpm')


def build_track(identifier, metadata, result, estimated_bpm=None):
    track = dict(metadata)
    if 'bpm' not in track:
        track['bpm'] = estimated_bpm
    track.update(schemaVersion=1, id=identifier, durationMs=result['alignment']['audioDurationMs'],
                 chordCoverageEndMs=result['chordCoverageEndMs'], chordTimeline=result['chords'],
                 analysis={**result.get('analysis', {}), **result['alignment']})
    validate_track(track, identifier)
    return track


def atomic_write_track(path, value, identifier):
    """Same-directory temp + validation/read-back + fsync + os.replace.

    A failed serialization, validation or replacement preserves the old file.
    """
    validate_track(value, identifier)
    encoded = json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', newline='\n', dir=path.parent,
                                         prefix=f'.{path.name}.', suffix='.tmp', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(encoded)
            stream.flush()
            os.fsync(stream.fileno())
        load_existing(temporary, identifier)
        os.replace(temporary, path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
