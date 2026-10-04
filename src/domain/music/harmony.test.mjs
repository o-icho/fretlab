import test from "node:test";
import assert from "node:assert/strict";
import { createKey, diatonicChord, chordInKey, chordFromSymbol, buildHarmonyChord, romanDegree } from "./harmony.ts";
import { ROOTS } from "./catalog.ts";

for (const [root, mode, names, romans] of [
  ["C", "major", ["C", "Dm", "Em", "F", "G", "Am", "Bdim"], ["I", "ii", "iii", "IV", "V", "vi", "vii°"]],
  ["A", "minor", ["Am", "Bdim", "C", "Dm", "Em", "F", "G"], ["i", "ii°", "III", "iv", "v", "VI", "VII"]],
  ["D", "major", ["D", "Em", "F#m", "G", "A", "Bm", "C#dim"], ["I", "ii", "iii", "IV", "V", "vi", "vii°"]],
  ["F#", "minor", ["F#m", "G#dim", "A", "Bm", "C#m", "D", "E"], ["i", "ii°", "III", "iv", "v", "VI", "VII"]],
  ["Bb", "major", ["Bb", "Cm", "Dm", "Eb", "F", "Gm", "Adim"], ["I", "ii", "iii", "IV", "V", "vi", "vii°"]],
  ["E", "major", ["E", "F#m", "G#m", "A", "B", "C#m", "D#dim"], ["I", "ii", "iii", "IV", "V", "vi", "vii°"]],
]) test(`${root} ${mode}: verified diatonic triads and degrees`, () => {
  const key = createKey(root, mode);
  const chords = [1, 2, 3, 4, 5, 6, 7].map(degree => diatonicChord(key, degree));
  assert.deepEqual(chords.map(chord => chord.symbol), names);
  assert.deepEqual(chords.map(chord => chordInKey(key, chord).roman), romans);
  assert.ok(chords.every(chord => chordInKey(key, chord).isDiatonic));
});

test("seventh harmonization distinguishes major, minor, dominant and half-diminished", () => {
  const major = createKey("C", "major");
  const minor = createKey("A", "minor");
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map(d => diatonicChord(major, d, true).symbol), ["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5"]);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map(d => diatonicChord(minor, d, true).symbol), ["Am7", "Bm7b5", "Cmaj7", "Dm7", "Em7", "Fmaj7", "G7"]);
  assert.equal(romanDegree(7, "m7b5"), "viiø7");
  assert.equal(romanDegree(2, "m7b5"), "iiø7");
});

test("harmonization preserves contextual E# and B# spelling", () => {
  assert.equal(diatonicChord(createKey("F#", "major"), 7).symbol, "E#dim");
  assert.equal(diatonicChord(createKey("C#", "major"), 7).symbol, "B#dim");
  for (const root of ROOTS) for (const mode of ["major", "minor"]) {
    const key = createKey(root, mode);
    for (const degree of [1, 2, 3, 4, 5, 6, 7]) for (const seventh of [false, true]) {
      assert.equal(chordInKey(key, diatonicChord(key, degree, seventh)).isDiatonic, true);
    }
  }
});

test("manual chromatic chords, slash bass and unknown extensions are represented honestly", () => {
  const key = createKey("C", "major");
  assert.equal(chordInKey(key, chordFromSymbol("C/E")).isDiatonic, true);
  assert.equal(chordInKey(key, chordFromSymbol("C/F#")).isDiatonic, false);
  assert.equal(chordInKey(key, chordFromSymbol("F#m")).isDiatonic, false);
  assert.equal(chordInKey(key, chordFromSymbol("Cadd9")).isDiatonic, null);
  assert.equal(chordFromSymbol(" am ").symbol, "Am");
  assert.equal(chordFromSymbol("Cmin7").quality, "m7");
  for (const input of ["Hello", "Amigo", "H7", "<script>"]) assert.equal(chordFromSymbol(input), null);
  assert.throws(() => createKey("C", "bad"), RangeError);
  assert.throws(() => diatonicChord(key, 8), RangeError);
  assert.throws(() => buildHarmonyChord("C", "bad"), RangeError);
});
