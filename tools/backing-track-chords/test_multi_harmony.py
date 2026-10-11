import unittest
from pathlib import Path
from unittest.mock import patch
from extract_chords import read_harmony_sources
from midi_harmony import Note

class MultiHarmonyTests(unittest.TestCase):
    def test_combines_seconds_and_keeps_primary_coverage(self):
        a=Note(1,2,60,90)
        b=Note(3,4,67,80)
        with patch('extract_chords.read_midi',side_effect=[([a],5,1),([b],8,2)]):
            notes,duration,repairs=read_harmony_sources(Path('keyboard.mid'),[Path('guitar.mid')])
        self.assertEqual(notes,[a,b])
        self.assertEqual(duration,5)
        self.assertEqual(repairs,3)

    def test_duplicate_input_rejected(self):
        with self.assertRaisesRegex(ValueError,'Duplicate'):
            read_harmony_sources(Path('keyboard.mid'),[Path('keyboard.mid')])

    def test_single_source_unchanged(self):
        with patch('extract_chords.read_midi',return_value=([],4,0)):
            self.assertEqual(read_harmony_sources(Path('keyboard.mid'),[]),([],4,0))
