import test from "node:test";
import assert from "node:assert/strict";
import { parseNote, pitchClass, transposeNote, SHARP_NOTES, FLAT_NOTES } from "./pitch.ts";
import { parseChord, transposeChord } from "./chords.ts";
import { parseChordName } from "./query.ts";
import { ROOTS, ROOT_PITCH, QUALITIES, QUALITY_SUFFIXES } from "./catalog.ts";

test("canonical pitches preserve enharmonic spelling separately", () => {
  assert.equal(parseNote("C#").pitchClass, parseNote("Db").pitchClass);
  assert.notDeepEqual(parseNote("C#").spelling, parseNote("Db").spelling);
  for (let i = 0; i < 12; i++) {
    assert.equal(parseNote(SHARP_NOTES[i]).pitchClass, i);
    assert.equal(parseNote(FLAT_NOTES[i]).pitchClass, i);
    assert.equal(transposeNote(SHARP_NOTES[i], -12), SHARP_NOTES[i]);
  }
  assert.equal(parseNote("Cb").pitchClass, 11);
  assert.equal(parseNote("B#").pitchClass, 0);
  assert.equal(parseNote("E♯").pitchClass, 5);
  assert.equal(parseNote("H"), null);
  assert.equal(parseNote("C##"), null);
  assert.equal(pitchClass(-1), 11);
  for (const value of [NaN, Infinity, 1.5]) assert.throws(() => pitchClass(value), RangeError);
});

test("strict chord parsing preserves suffix and slash bass", () => {
  const chord = parseChord("Dbmaj7/Ab");
  assert.equal(chord.root.pitchClass, 1);
  assert.equal(chord.root.name, "Db");
  assert.equal(chord.bass.pitchClass, 8);
  assert.equal(chord.suffix, "maj7");
  assert.equal(transposeChord("C/E", 2), "D/F#");
  assert.equal(transposeChord("G/B", -2), "F/A");
  assert.equal(transposeChord("C7(b9)", 2), "D7(b9)");
  for (const word of ["Amigo", "Hello", "Cmajestic"]) assert.equal(parseChord(word), null);
});

test("dictionary catalog and transposer use the same canonical chord pitches", () => {
  for (const root of ROOTS) for (const quality of QUALITIES) {
    const name = root + QUALITY_SUFFIXES[quality];
    const query = parseChordName(name);
    assert.equal(query.quality, quality);
    assert.equal(parseChord(query.name).root.pitchClass, ROOT_PITCH[root]);
    assert.equal(parseChord(transposeChord(name, 12)).root.pitchClass, ROOT_PITCH[root]);
  }
  assert.equal(parseChordName("c MAJ7").name, "Cmaj7");
  assert.equal(parseChordName("CM").quality, "major");
  assert.equal(parseChordName("Cm").quality, "minor");
  assert.equal(parseChordName("C/E"), null); // No unsupported guitar fingering is invented.
});
