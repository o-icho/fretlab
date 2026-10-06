import io
from pathlib import Path
import tempfile
import unittest
from contextlib import redirect_stderr

import mido
import numpy as np

from midi_harmony import Note, sanitize_keys, read_midi, vocabulary, note_chroma, chord_scores, smooth, segments
from alignment import fit_affine, mapped_output, transform_ms, boundary_diagnostics
from extract_chords import main


class MidiTests(unittest.TestCase):
    def fixture(self):
        midi = mido.MidiFile(ticks_per_beat=480)
        midi.tracks.append(mido.MidiTrack([
            mido.MetaMessage('key_signature', key='C'),
            mido.MetaMessage('set_tempo', tempo=500000),
            mido.Message('note_on', note=60, velocity=80),
            mido.MetaMessage('set_tempo', tempo=1000000, time=480),
            mido.Message('note_off', note=60, time=480),
            mido.MetaMessage('end_of_track', time=480),
        ]))
        buffer = io.BytesIO()
        midi.save(file=buffer)
        return buffer.getvalue()

    def test_tempo_map_and_end_of_track(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'test.mid'
            path.write_bytes(self.fixture())
            notes, duration, repairs = read_midi(path)
            self.assertAlmostEqual(notes[0].end, 1.5)
            self.assertAlmostEqual(duration, 2.5)
            self.assertEqual(repairs, 0)

    def test_invalid_key_only_metadata_changes_source_unchanged(self):
        original = self.fixture().replace(b'\xff\x59\x02\x00\x00', b'\xff\x59\x02\x0f\x00')
        clean, count = sanitize_keys(original)
        self.assertEqual(count, 1)
        self.assertEqual(sum(a != b for a, b in zip(original, clean)), 1)
        self.assertEqual(sanitize_keys(clean), (clean, 0))
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'invalid.mid'
            path.write_bytes(original)
            notes, duration, repairs = read_midi(path)
            self.assertEqual(path.read_bytes(), original)
            self.assertAlmostEqual(notes[0].end, 1.5)
            self.assertAlmostEqual(duration, 2.5)
            self.assertEqual(repairs, 1)

    def test_valid_keys_untouched(self):
        for key in ('Cb', 'C#', 'Am', 'Abm'):
            midi = mido.MidiFile()
            midi.tracks.append(mido.MidiTrack([mido.MetaMessage('key_signature', key=key)]))
            buffer = io.BytesIO()
            midi.save(file=buffer)
            self.assertEqual(sanitize_keys(buffer.getvalue()), (buffer.getvalue(), 0))

    def test_key_like_bytes_in_sysex_not_replaced(self):
        data = self.fixture()
        # A sequencer payload can contain arbitrary bytes, including this pattern.
        event = b'\x00\xff\x7f\x05\xff\x59\x02\x0f\x00'
        size = int.from_bytes(data[18:22], 'big')
        data = data[:18] + (size + len(event)).to_bytes(4, 'big') + event + data[22:]
        self.assertEqual(sanitize_keys(data), (data, 0))

    def test_multitrack_tempo(self):
        midi = mido.MidiFile(ticks_per_beat=480)
        midi.tracks.append(mido.MidiTrack([mido.MetaMessage('set_tempo', tempo=1000000, time=480)]))
        midi.tracks.append(mido.MidiTrack([mido.Message('note_on', note=67, velocity=90),
                                          mido.Message('note_off', note=67, time=960)]))
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'multi.mid'
            midi.save(path)
            notes, duration, _ = read_midi(path)
            self.assertAlmostEqual(notes[0].end, 1.5)
            self.assertAlmostEqual(duration, 1.5)

    def test_overlap_velocity(self):
        result = note_chroma([Note(0.05, 0.15, 60, 127), Note(0, 0.1, 64, 64)], np.array([0, 0.1, 0.2]))
        np.testing.assert_allclose(result[:, 0], [0.5, 0.5])
        self.assertAlmostEqual(result[0, 4], 64 / 127)
        self.assertEqual(result[1, 4], 0)

    def test_sustain_and_zero_velocity_note_off(self):
        midi = mido.MidiFile(ticks_per_beat=480)
        midi.tracks.append(mido.MidiTrack([
            mido.Message('control_change', control=64, value=127),
            mido.Message('note_on', note=60, velocity=90),
            mido.Message('note_on', note=60, velocity=0, time=480),
            mido.Message('control_change', control=64, value=0, time=480),
        ]))
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'pedal.mid'
            midi.save(path)
            notes, _, _ = read_midi(path)
            self.assertEqual(len(notes), 1)
            self.assertEqual(notes[0].end, 1)

    def test_truncated_track_is_rejected(self):
        with self.assertRaises(ValueError):
            sanitize_keys(self.fixture()[:-1])


class HarmonyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.chords = vocabulary()

    def winner(self, harmony, bass=None, weight=0.65):
        bass = np.zeros((1, 12)) if bass is None else bass
        scores = chord_scores(harmony, bass, self.chords, weight)
        return self.chords[scores[0, :-1].argmax()]['symbol']

    def test_all_candidate_voicings(self):
        for chord in self.chords:
            values = np.zeros((1, 12))
            values[0, chord['pitches']] = 1
            self.assertEqual(self.winner(values), chord['symbol'])

    def test_bass_root_weight_is_strong_but_not_absolute(self):
        harmony = np.zeros((1, 12))
        harmony[0, [0, 4, 7, 9]] = 1  # C6 / Am7 ambiguity.
        bass = np.zeros((1, 12))
        bass[0, 0] = 1
        c_index = next(i for i, chord in enumerate(self.chords) if chord['symbol'] == 'C')
        before = chord_scores(harmony, bass, self.chords, 0)[0, c_index]
        after = chord_scores(harmony, bass, self.chords, 0.65)[0, c_index]
        self.assertAlmostEqual(after - before, 0.65)
        clear = np.zeros((1, 12))
        clear[0, [7, 11, 2, 5]] = 1
        self.assertEqual(self.winner(clear, bass), 'G7')

    def test_walking_bass_does_not_change_held_chord(self):
        harmony = np.zeros((40, 12))
        harmony[:, [7, 11, 2, 5]] = 1
        bass = np.eye(12)[np.tile([7, 9, 11, 0, 2, 4, 5, 6], 5)]
        scores = chord_scores(harmony, bass, self.chords)
        path = smooth(scores, 0.1)
        self.assertTrue(all(self.chords[i]['symbol'] == 'G7' for i in path))

    def test_smoothing_rejects_fill_preserves_short_confirmed_chord(self):
        scores = np.zeros((30, 2))
        scores[:, 0] = 2
        scores[5] = [0, 2]  # isolated 100 ms fill
        scores[15:20] = [0, 4]  # real half-second chord
        path = smooth(scores, 0.1, 0.65)
        self.assertEqual(path[5], 0)
        np.testing.assert_array_equal(path[15:20], 1)
        self.assertEqual(path[20], 0)

    def test_merging_never_crosses_another_chord_or_silence(self):
        candidates = [dict(symbol='C'), dict(symbol='G')]
        path = np.array([0, 0, 1, 0, 0, 2, 0])
        scores = np.eye(3)[path] * 3
        result = segments(path, scores, np.arange(8) * 0.1, candidates)
        self.assertEqual([r['symbol'] for r in result], ['C', 'G', 'C', 'C'])
        self.assertEqual([(r['midiStartMs'], r['midiEndMs']) for r in result],
                         [(0, 200), (200, 300), (300, 500), (600, 700)])

    def test_silence_is_not_a_chord(self):
        scores = chord_scores(np.zeros((30, 12)), np.zeros((30, 12)), self.chords)
        result = segments(smooth(scores, 0.1), scores, np.arange(31) * 0.1, self.chords)
        self.assertEqual(result, [])


class AlignmentTests(unittest.TestCase):
    def test_transform_and_coverage(self):
        candidate = [dict(symbol='G7', midiStartMs=0, midiEndMs=214127, confidence=0.9)]
        output = mapped_output(candidate, 214.127, 247.880, 1.0045, 0.150, 0.9)
        self.assertEqual(output['chordCoverageEndMs'], 215241)
        self.assertEqual(output['chords'][0]['startMs'], 150)
        self.assertEqual(output['chords'][0]['endMs'], 215241)
        self.assertEqual(transform_ms(9.332, 1.0045, 0.150), 9524)

    def test_no_extrapolation_clipping_and_negative_offset(self):
        candidate = [dict(symbol='C', midiStartMs=0, midiEndMs=999999, confidence=1)]
        output = mapped_output(candidate, 10, 100, 1.01, -0.1, 1)
        self.assertEqual(output['chords'][0]['startMs'], 0)
        self.assertEqual(output['chords'][0]['endMs'], 10000)
        shorter = mapped_output(candidate, 10, 5, 1.01, -0.1, 1)
        self.assertEqual(shorter['chords'][0]['endMs'], 5000)
        self.assertEqual(shorter['chordCoverageEndMs'], 10000)

    def test_affine_recovery_and_determinism(self):
        rng = np.random.default_rng(8)
        times = np.arange(0.05, 40, 0.1)
        # Nonrepeating chroma, smooth enough to interpolate without ambiguity.
        from scipy.ndimage import gaussian_filter1d
        chroma = gaussian_filter1d(rng.random((len(times), 12)), 3, axis=0)
        chroma = np.maximum(chroma - 0.4, 0)
        audio_times = np.arange(0, 44, 0.02)
        expected_scale, expected_offset = 1.023, 0.37
        audio = np.column_stack([np.interp((audio_times - expected_offset) / expected_scale,
                                          times, chroma[:, pc], left=0, right=0) for pc in range(12)])
        a = fit_affine(times, chroma, audio_times, audio, (0.98, 1.04), (-1, 1))
        b = fit_affine(times, chroma, audio_times, audio, (0.98, 1.04), (-1, 1))
        self.assertEqual(a, b)
        self.assertAlmostEqual(a[0], expected_scale, delta=0.0005)
        self.assertAlmostEqual(a[1], expected_offset, delta=0.02)
        self.assertGreater(a[2], 0.99)

    def test_no_audio_peak_is_reported_missing(self):
        candidate = [dict(symbol='C', midiStartMs=0, midiEndMs=1000, confidence=1),
                     dict(symbol='G', midiStartMs=1000, midiEndMs=2000, confidence=1)]
        times = np.arange(0, 3, 0.02)
        rows = boundary_diagnostics(candidate, 1, 0, times, np.ones((len(times), 12)))
        self.assertIsNone(rows[0]['nearestAudioChange'])
        self.assertIsNone(rows[0]['deltaMs'])

    def test_output_cannot_overwrite_source(self):
        with redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as error:
            main(['--harmony', 'source.mid', '--audio', 'audio.mp3', '--output', 'source.mid'])
        self.assertEqual(error.exception.code, 2)

    def test_audio_required_bass_optional(self):
        from unittest.mock import patch
        # Passing argument parsing with no bass reaches MIDI reading.
        with patch('extract_chords.read_midi', side_effect=ValueError('parsed without bass')):
            with self.assertRaisesRegex(ValueError, 'parsed without bass'):
                main(['--harmony', 'source.mid', '--audio', 'audio.mp3', '--output', 'analysis.json'])
        with redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as error:
            main(['--harmony', 'source.mid', '--output', 'analysis.json'])
        self.assertEqual(error.exception.code, 2)


if __name__ == '__main__':
    unittest.main()
