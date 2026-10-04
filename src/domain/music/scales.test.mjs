import test from "node:test";
import assert from "node:assert/strict";
import { generateScale, SCALE_DEFINITIONS } from "./scales.ts";
import { ROOTS } from "./catalog.ts";
import { parseNote, pitchClass, transposeNote } from "./pitch.ts";
import { TUNINGS, STANDARD_TUNING, tuningNotes } from "./tuning.ts";
import { mapScaleToFretboard } from "./fretboard.ts";

for (const [root, id, expected] of [
  ["C", "major", "C D E F G A B"],
  ["A", "natural-minor", "A B C D E F G"],
  ["C", "major-pentatonic", "C D E G A"],
  ["A", "minor-pentatonic", "A C D E G"],
  ["A", "minor-blues", "A C D Eb E G"],
  ["D", "dorian", "D E F G A B C"],
  ["G", "mixolydian", "G A B C D E F"],
]) test(`${root} ${id} has the verified notes and root`, () => {
  const scale = generateScale(root, id);
  assert.equal(scale.notes.map((note) => note.name).join(" "), expected);
  assert.equal(scale.notes.filter((note) => note.isRoot).length, 1);
  assert.equal(scale.notes[0].pitchClass, parseNote(root).pitchClass);
  assert.equal(scale.notes[0].interval.label, "1");
});

test("auto spelling follows diatonic degrees, not a global chromatic preference", () => {
  assert.equal(generateScale("F#", "major").notes.map(n => n.name).join(" "), "F# G# A# B C# D# E#");
  assert.equal(generateScale("Db", "major").notes.map(n => n.name).join(" "), "Db Eb F Gb Ab Bb C");
  assert.equal(generateScale("C#", "major").notes.map(n => n.name).join(" "), "C# D# E# F# G# A# B#");
  assert.equal(generateScale("Bb", "natural-minor").notes.map(n => n.name).join(" "), "Bb C Db Eb F Gb Ab");
  assert.equal(generateScale("D#", "major").root.name, "Eb");
  assert.equal(generateScale("D#", "major").requestedRoot, "D#");
  assert.equal(generateScale("Eb", "minor-blues").root.name, "D#");
});

test("explicit sharps/flats alter spelling without changing musical pitches", () => {
  const sharps = generateScale("Bb", "major", "sharps");
  const flats = generateScale("Bb", "major", "flats");
  assert.equal(sharps.notes.map(n => n.name).join(" "), "A# C D D# F G A");
  assert.equal(flats.notes.map(n => n.name).join(" "), "Bb C D Eb F G A");
  assert.deepEqual(sharps.notes.map(n => n.pitchClass), flats.notes.map(n => n.pitchClass));
  assert.equal(generateScale("A", "minor-blues", "sharps").notes[3].name, "D#");
  assert.equal(generateScale("A", "minor-blues", "flats").notes[3].name, "Eb");
});

test("all roots and scales transpose canonically with valid independent spellings", () => {
  for (const definition of SCALE_DEFINITIONS) {
    assert.equal(new Set(definition.intervals.map(i => i.semitones)).size, definition.intervals.length);
    for (const root of ROOTS) {
      const scale = generateScale(root, definition.id);
      for (const [index, note] of scale.notes.entries()) {
        assert.equal(parseNote(note.name).pitchClass, note.pitchClass, `${root} ${definition.id} ${note.name}`);
        assert.equal(note.pitchClass, pitchClass(parseNote(root).pitchClass + definition.intervals[index].semitones));
      }
      for (const semitones of [-11, -2, 1, 2, 7, 12]) {
        const transposed = generateScale(transposeNote(root, semitones), definition.id);
        assert.deepEqual(transposed.notes.map(n => n.pitchClass), scale.notes.map(n => pitchClass(n.pitchClass + semitones)));
      }
    }
  }
});

test("invalid roots, scale identifiers and notation are rejected", () => {
  assert.throws(() => generateScale("H", "major"), RangeError);
  assert.throws(() => generateScale("C", "unknown"), RangeError);
  assert.throws(() => generateScale("C", "major", "unknown"), RangeError);
});

test("tunings declare absolute pitches and retain their displayed spelling", () => {
  assert.deepEqual(tuningNotes(STANDARD_TUNING).map(n => `${n.note}${n.octave}`), ["E2", "A2", "D3", "G3", "B3", "E4"]);
  assert.deepEqual(tuningNotes(TUNINGS[1]).map(n => `${n.note}${n.octave}`), ["Eb2", "Ab2", "Db3", "Gb3", "Bb3", "Eb4"]);
  assert.deepEqual(tuningNotes(TUNINGS[2]).map(n => `${n.note}${n.octave}`), ["D2", "A2", "D3", "G3", "B3", "E4"]);
});

test("Standard E note/fret mapping preserves pitch, string order and roots", () => {
  const scale = generateScale("C", "major");
  const positions = mapScaleToFretboard(scale, STANDARD_TUNING, { start: 0, end: 12 });
  assert.deepEqual(positions.filter(p => p.fret === 0).map(p => p.scaleNote.name), ["E", "A", "D", "G", "B", "E"]);
  const lowC = positions.find(p => p.stringIndex === 0 && p.fret === 8);
  assert.equal(lowC.midi, 48);
  assert.equal(lowC.scaleNote.isRoot, true);
  const highC = positions.find(p => p.stringIndex === 5 && p.fret === 8);
  assert.equal(highC.midi, 72);
  for (const stringIndex of [0, 1, 2, 3, 4, 5]) {
    const open = positions.find(p => p.stringIndex === stringIndex && p.fret === 0);
    const octave = positions.find(p => p.stringIndex === stringIndex && p.fret === 12);
    assert.equal(open.pitchClass, octave.pitchClass);
    assert.equal(octave.midi - open.midi, 12);
  }
  for (const position of positions) assert.equal(position.scaleNote.isRoot, position.pitchClass === scale.root.pitchClass);
});

test("Drop D changes only the low string and flags its open root", () => {
  const scale = generateScale("D", "dorian");
  const standard = mapScaleToFretboard(scale, STANDARD_TUNING, { start: 0, end: 15 });
  const drop = mapScaleToFretboard(scale, TUNINGS[2], { start: 0, end: 15 });
  assert.deepEqual(drop.filter(p => p.stringIndex > 0), standard.filter(p => p.stringIndex > 0));
  const lowD = drop.find(p => p.stringIndex === 0 && p.fret === 0);
  assert.equal(lowD.midi, 38);
  assert.equal(lowD.scaleNote.name, "D");
  assert.equal(lowD.scaleNote.isRoot, true);
});

test("fret mapping supports explicit tunings, targeted zones and invalid input", () => {
  const scale = generateScale("A", "minor-pentatonic");
  const positions = mapScaleToFretboard(scale, STANDARD_TUNING, { start: 5, end: 9 });
  assert.ok(positions.length > 0);
  assert.ok(positions.every(p => p.fret >= 5 && p.fret <= 9));
  assert.equal(positions.find(p => p.stringIndex === 0 && p.fret === 5).scaleNote.isRoot, true);
  const custom = { id: "custom", name: "Custom", strings: [36, 43, 48, 53, 57, 62], notation: "sharps" };
  assert.ok(mapScaleToFretboard(scale, custom, { start: 0, end: 15 }).length > 0);
  for (const range of [{ start: -1, end: 5 }, { start: 5, end: 4 }, { start: 1.5, end: 5 }, { start: 0, end: 25 }]) {
    assert.throws(() => mapScaleToFretboard(scale, STANDARD_TUNING, range), RangeError);
  }
  assert.throws(() => mapScaleToFretboard(scale, { ...custom, strings: [] }, { start: 0, end: 5 }), RangeError);
});
