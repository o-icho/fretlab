import contextlib
import copy
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import numpy as np

from extract_chords import main
from midi_harmony import Note
from track_files import (IDENTIFIER, BACKING, EXAMPLE, TRACK, resolve_track, load_existing,
                         editorial_fields, build_track, atomic_write_track, validate_track, midi_bpm)


class TrackFilesTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.folder = self.root / 'track-1'
        self.folder.mkdir()
        for name in ('Backingtrack_track-1.mp3', 'Example_track-1.mp3'):
            (self.folder / name).write_bytes(b'fixture; audio analysis mocked in orchestration tests')
        self.files = resolve_track(self.root, 'track-1')
        self.result = dict(alignment=dict(scale=1.01, offsetMs=100, meanSimilarity=0.9,
                                         midiDurationMs=1000, audioDurationMs=3000, audioCoverageEndMs=1110),
                           chordCoverageEndMs=1110,
                           chords=[dict(symbol='G', startMs=100, endMs=1110, source='midi', confidence=0.8)],
                           analysis=dict(warnings=[]))
        self.metadata = dict(title='Editorial title', style='blues', key='G', bpm=115,
                             notes='Keep this', tags=['editorial'], custom={'nested': True})
        self.track = build_track('track-1', self.metadata, self.result)

    def test_regexes_exact(self):
        for pattern, prefix, suffix in ((BACKING, 'Backingtrack', 'mp3'), (EXAMPLE, 'Example', 'mp3'), (TRACK, 'Track', 'json')):
            self.assertEqual(pattern.fullmatch(f'{prefix}_track-1.{suffix}')[1], 'track-1')
            for name in (f'{prefix}_Track.{suffix}', f'{prefix}_é.{suffix}', f'{prefix}_a b.{suffix}',
                         f'{prefix}_track-1.{suffix}\n', f'{prefix.lower()}_track-1.{suffix}', f'{prefix}_a.{suffix.upper()}'):
                self.assertIsNone(pattern.fullmatch(name), name)

    def test_identifier_no_normalization(self):
        for identifier in ('../track-1', 'a/b', 'a\\b', ' A ', 'été', 'A', '-a', 'a\n', ''):
            with self.subTest(identifier=identifier), self.assertRaises(ValueError):
                resolve_track(self.root, identifier)
        for identifier in ('a', '0', 'a_b-1'):
            self.assertIsNotNone(IDENTIFIER.fullmatch(identifier))

    def test_resolution(self):
        self.assertEqual(self.files.output, self.folder / 'Track_track-1.json')
        self.assertEqual(self.files.debug, self.folder / '_analysis')
        with self.assertRaises(FileNotFoundError):
            resolve_track(self.root, 'absent')

    def test_missing_backing(self):
        self.files.backing.unlink()
        with self.assertRaisesRegex(ValueError, 'Missing required file'):
            resolve_track(self.root, 'track-1')

    def test_missing_example(self):
        self.files.example.unlink()
        with self.assertRaisesRegex(ValueError, 'Example_'):
            resolve_track(self.root, 'track-1')

    def test_folder_file_mismatch(self):
        for path, wrong in ((self.files.backing, 'Backingtrack_other.mp3'),
                            (self.files.example, 'Example_other.mp3')):
            path.rename(self.folder / wrong)
            with self.assertRaisesRegex(ValueError, 'mismatch'):
                resolve_track(self.root, 'track-1')
            (self.folder / wrong).rename(path)
        (self.folder / 'Track_other.json').write_text('{}')
        with self.assertRaisesRegex(ValueError, 'mismatch'):
            resolve_track(self.root, 'track-1')

    def test_competing_backing_files(self):
        (self.folder / 'Backingtrack_other.mp3').write_bytes(b'other')
        with self.assertRaisesRegex(ValueError, 'Competing files'):
            resolve_track(self.root, 'track-1')

    def test_unknown_files_and_debug_ignored(self):
        for name in ('Keyboard.mid', 'cover.png', 'Backingtrack_Invalid Name.mp3', 'notes.txt'):
            (self.folder / name).write_bytes(b'unknown')
        self.files.debug.mkdir()
        (self.files.debug / 'Backingtrack_other.mp3').write_bytes(b'ignored nested file')
        self.assertEqual(resolve_track(self.root, 'track-1'), self.files)

    def test_editorial_metadata_preserved_timeline_replaced(self):
        atomic_write_track(self.files.output, self.track, 'track-1')
        existing = load_existing(self.files.output, 'track-1')
        updated_result = copy.deepcopy(self.result)
        updated_result['chords'][0]['symbol'] = 'C'
        metadata = editorial_fields(existing, dict(title=None, style=None, key=None, bpm=None))
        updated = build_track('track-1', metadata, updated_result)
        for key, value in self.metadata.items():
            self.assertEqual(updated[key], value)
        self.assertEqual(updated['chordTimeline'][0]['symbol'], 'C')
        override = editorial_fields(existing, dict(title='New title', bpm=120, key='C'))
        self.assertEqual(override['title'], 'New title')
        self.assertEqual(override['bpm'], 120)
        self.assertEqual(override['notes'], self.metadata['notes'])

    def test_new_track_requires_metadata_and_bpm_fallback(self):
        with self.assertRaisesRegex(ValueError, '--title'):
            editorial_fields(None, {})
        metadata = editorial_fields(None, dict(title='Title', style='jazz', key='D'))
        self.assertEqual(build_track('track-1', metadata, self.result, 119.5)['bpm'], 119.5)

    def test_invalid_existing_json_never_replaced(self):
        for text in ('{', '{}', '{"id":"track-1","id":"other"}', 'NaN'):
            self.files.output.write_text(text, encoding='utf-8')
            with self.assertRaises(ValueError):
                load_existing(self.files.output, 'track-1')
            self.assertEqual(self.files.output.read_text(), text)
        wrong = dict(self.track, id='other')
        self.files.output.write_text(json.dumps(wrong))
        with self.assertRaisesRegex(ValueError, 'id'):
            load_existing(self.files.output, 'track-1')

    def test_atomic_write_readback_and_replace_failure(self):
        atomic_write_track(self.files.output, self.track, 'track-1')
        original = self.files.output.read_bytes()
        changed = dict(self.track, title='Updated')
        with patch('track_files.os.replace', side_effect=OSError('simulated failure')):
            with self.assertRaises(OSError):
                atomic_write_track(self.files.output, changed, 'track-1')
        self.assertEqual(self.files.output.read_bytes(), original)
        self.assertEqual(list(self.folder.glob('*.tmp')), [])
        atomic_write_track(self.files.output, changed, 'track-1')
        self.assertEqual(load_existing(self.files.output, 'track-1')['title'], 'Updated')

    def test_failed_validation_keeps_old_json(self):
        atomic_write_track(self.files.output, self.track, 'track-1')
        original = self.files.output.read_bytes()
        bad = copy.deepcopy(self.track)
        bad['chordTimeline'][0]['endMs'] = 2000
        with self.assertRaisesRegex(ValueError, 'coverage'):
            atomic_write_track(self.files.output, bad, 'track-1')
        self.assertEqual(self.files.output.read_bytes(), original)

    def test_coverage_not_raw_midi_or_full_audio(self):
        validate_track(self.track, 'track-1')
        for end in (1000, 3000):
            bad = dict(self.track, chordCoverageEndMs=end)
            with self.assertRaisesRegex(ValueError, 'Coverage'):
                validate_track(bad, 'track-1')

    def test_bpm_time_map_fallback(self):
        import mido
        midi = mido.MidiFile(ticks_per_beat=480)
        midi.tracks.append(mido.MidiTrack([mido.MetaMessage('set_tempo', tempo=500000),
                                          mido.MetaMessage('set_tempo', tempo=1000000, time=480),
                                          mido.MetaMessage('end_of_track', time=960)]))
        path = self.folder / 'tempo.mid'
        midi.save(path)
        self.assertEqual(midi_bpm(path, 1), 60)
        self.assertEqual(midi_bpm(path, 1.01), 59.406)

    def test_cli_integration_preserves_metadata_without_touching_audio(self):
        midi = self.folder / 'keyboard.mid'
        midi.write_bytes(b'MIDI read mocked')
        original_audio = {p: p.read_bytes() for p in (self.files.backing, self.files.example)}
        args = ['--track-id', 'track-1', '--tracks-root', str(self.root), '--harmony', str(midi), '--no-plot']
        atomic_write_track(self.files.output, self.track, 'track-1')
        with patch('extract_chords.read_midi', return_value=([Note(0, 1, 67, 100)], 1, 0)), \
             patch('extract_chords.audio_chroma', return_value=(np.arange(0, 3, 0.05), np.ones((60, 12)), 3)), \
             patch('extract_chords.fit_affine', return_value=(1.01, 0.1, 0.9)), contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(main(args), 0)
        final = load_existing(self.files.output, 'track-1')
        for key, value in self.metadata.items():
            self.assertEqual(final[key], value)
        self.assertEqual(final['chordCoverageEndMs'], 1110)
        self.assertTrue((self.files.debug / 'debug.csv').exists())
        self.assertFalse((self.folder / 'debug.csv').exists())
        self.assertTrue(all(event['endMs'] <= 1110 for event in final['chordTimeline']))
        for path, data in original_audio.items():
            self.assertEqual(path.read_bytes(), data)


if __name__ == '__main__':
    unittest.main()
