import test from "node:test";
import assert from "node:assert/strict";
import {
  transposeNote,
  transposeChord,
  transposeText,
  isChord,
  SHARP_NOTES,
  FLAT_NOTES,
} from "./music.ts";

for (const [input, shift, expected, preference = "sharps"] of [
  ["C", 2, "D"],
  ["B", 1, "C"],
  ["Bb", 2, "C"],
  ["F#", 1, "G"],
  ["Db", 1, "D", "sharps"],
  ["C#", 1, "D", "flats"],
  ["C", -1, "B"],
  ["C", 1, "Db", "flats"],
  ["E♭", 2, "F"],
  ["B#", 0, "C"],
])
  test(`note ${input} ${shift} (${preference}) = ${expected}`, () =>
    assert.equal(transposeNote(input, shift, preference), expected));

for (const [input, shift, expected] of [
  ["Cmaj7", 2, "Dmaj7"],
  ["Am", 2, "Bm"],
  ["Am7", 2, "Bm7"],
  ["F#m7", 1, "Gm7"],
  ["C/E", 2, "D/F#"],
  ["G/B", -2, "F/A"],
  ["Bbmaj7", 2, "Cmaj7"],
  ["C7(b9)", 2, "D7(b9)"],
  ["Cmaj7/Gb", -1, "Bmaj7/F"],
])
  test(`chord ${input} ${shift} = ${expected}`, () =>
    assert.equal(transposeChord(input, shift), expected));

test("all required suffixes survive transposition exactly", () => {
  for (const suffix of [
    "",
    "m",
    "7",
    "m7",
    "maj7",
    "min7",
    "sus2",
    "sus4",
    "dim",
    "aug",
    "add9",
    "6",
    "9",
    "11",
    "13",
    "5",
    "7sus4",
    "m7b5",
    "7(b9,#11)",
  ]) {
    assert.equal(transposeChord(`C${suffix}`, 2), `D${suffix}`);
  }
  for (const chord of [
    "C#",
    "Db",
    "C#m",
    "Dbm",
    "F#m7",
    "Bbmaj7",
    "Eb7",
    "G/B",
  ])
    assert.ok(isChord(chord), chord);
});

test("all twelve pitches wrap correctly, both directions and spellings", () => {
  for (let pitch = 0; pitch < 12; pitch++)
    for (let shift = -11; shift <= 11; shift++) {
      const expected = (((pitch + shift) % 12) + 12) % 12;
      assert.equal(
        transposeNote(SHARP_NOTES[pitch], shift),
        SHARP_NOTES[expected],
      );
      assert.equal(
        transposeNote(FLAT_NOTES[pitch], shift, "flats"),
        FLAT_NOTES[expected],
      );
      assert.equal(
        transposeNote(transposeNote(SHARP_NOTES[pitch], shift), -shift),
        SHARP_NOTES[pitch],
      );
    }
});

test("mixed lyrics and chord lines: requested example", () => {
  assert.equal(
    transposeText("Am       F\nHello darkness\n\nC        G\nmy old friend", 2),
    "Bm       G\nHello darkness\n\nD        A\nmy old friend",
  );
});
test("lyrics remain byte-for-byte unchanged, including musical-looking words", () => {
  const lyrics =
    "Am I dreaming?\r\nA day in Paris, C'est beau !\nDon't change the D in this sentence.\nCome, Baby, Dance, Amazing, Goodbye.\n(Am I alone?) [Chorus] [C'est vrai]";
  assert.equal(transposeText(lyrics, 7), lyrics);
});
test("bracketed inline chords transpose without touching surrounding words", () => {
  assert.equal(
    transposeText(
      "[Am]Hello, [F]darkness!\n[C/E]Bonjour [G/B]à tous. [Refrain]",
      2,
    ),
    "[Bm]Hello, [G]darkness!\n[D/F#]Bonjour [A/C#]à tous. [Refrain]",
  );
});
test("preserve tabs, CRLF, lone CR, whitespace, brackets, punctuation and bar lines", () => {
  assert.equal(
    transposeText("  (C),\t[Am] | G/B!\r\n\r\nC7(b9) :| F;\r", 2),
    "  (D),\t[Bm] | A/C#!\r\n\r\nD7(b9) :| G;\r",
  );
});
test("invalid tokens and unsupported suffixes are left untouched", () => {
  for (const word of [
    "Come",
    "Amazing",
    "Bass",
    "Chello",
    "Cmajestic",
    "H7",
    "am",
    "C//E",
    "C/E7",
    "A#word",
    "C14",
  ]) {
    assert.equal(isChord(word), false, word);
    assert.equal(transposeChord(word, 2), word);
    assert.equal(transposeText(word, 2), word);
  }
  assert.equal(transposeNote("Hello", 2), "Hello");
});
test("empty input and exact whitespace remain intact", () => {
  for (const value of ["", " \t\r\n\n", "   "])
    assert.equal(transposeText(value, -11), value);
});
test("zero preserves pitch but applies requested enharmonic notation", () => {
  assert.equal(transposeText("Dbm Bbmaj7 C/E", 0), "C#m A#maj7 C/E");
  assert.equal(transposeText("C#m A#maj7 C/E", 0, "flats"), "Dbm Bbmaj7 C/E");
});
test("slash bass follows flat preference", () =>
  assert.equal(transposeChord("C/E", 1, "flats"), "Db/F"));
test("reject non-integer transpositions", () => {
  for (const value of [NaN, Infinity, 1.5]) {
    assert.throws(() => transposeNote("C", value), RangeError);
    assert.throws(() => transposeText("C", value), RangeError);
  }
});
