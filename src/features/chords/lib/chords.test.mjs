import test from "node:test";
import assert from "node:assert/strict";
import { CHORDS } from "../../../data/chords/dataset.ts";
import { ROOTS, ROOT_PITCH, QUALITIES } from "./model.ts";
import {
  normalizeChordName,
  parseChordName,
  searchChord,
  findChord,
  getPosition,
} from "./search.ts";

test("normalization of whitespace, case and musical accidentals", () => {
  assert.equal(normalizeChordName("  F♯ m  "), "F#m");
  for (const [query, expected] of [
    ["am", "Am"],
    [" c MAJ7 ", "Cmaj7"],
    ["B♭ min7", "Bbm7"],
    ["CM", "C"],
    ["CM7", "Cmaj7"],
    ["c mineur", "Cm"],
  ])
    assert.equal(searchChord(query)?.displayName, expected);
});
test("major and minor remain distinct, including M/m and M7/m7", () => {
  assert.equal(searchChord("A")?.quality, "major");
  assert.equal(searchChord("Am")?.quality, "minor");
  assert.equal(searchChord("AM")?.quality, "major");
  assert.equal(searchChord("AM7")?.quality, "maj7");
  assert.equal(searchChord("Am7")?.quality, "m7");
  assert.notDeepEqual(
    searchChord("A").positions[0].frets,
    searchChord("Am").positions[0].frets,
  );
});
test("exact lookup never guesses unsupported chords", () => {
  for (const name of [
    "",
    "Hello",
    "Cmajestic",
    "Amigo",
    "H7",
    "C/E",
    "Cadd11",
    "C#b",
    "B#",
  ])
    assert.equal(searchChord(name), null, name);
  assert.equal(parseChordName("F#m").root, "F#");
});
test("enharmonic aliases return the same source positions and preserve requested spelling", () => {
  for (const [sharp, flat] of [
    ["C#", "Db"],
    ["D#", "Eb"],
    ["F#", "Gb"],
    ["G#", "Ab"],
    ["A#", "Bb"],
  ])
    for (const quality of QUALITIES) {
      const a = findChord(sharp, quality),
        b = findChord(flat, quality);
      if (sharp === "C#" && quality === "11") {
        assert.equal(a, null); assert.equal(b, null);
        continue; // All four upstream C#11 shapes actually contain #11.
      }
      assert.ok(a);
      assert.ok(b);
      assert.deepEqual(a.positions, b.positions);
      assert.equal(b.root, flat);
    }
});
test("coverage includes every requested root and all fifteen qualities", () => {
  for (const root of ROOTS)
    for (const quality of QUALITIES) {
      const chord = findChord(root, quality);
      if (["C#", "Db"].includes(root) && quality === "11") {
        assert.equal(chord, null);
        continue;
      }
      assert.ok(chord, root + quality);
      assert.ok(chord.positions.length > 0);
    }
});
test("known open voicings match source, including seventh with omitted fifth", () => {
  const known = {
    C: [-1, 3, 2, 0, 1, 0],
    Am: [-1, 0, 2, 2, 1, 0],
    D: [-1, -1, 0, 2, 3, 2],
    E: [0, 2, 2, 1, 0, 0],
    Em: [0, 2, 2, 0, 0, 0],
    C7: [-1, 3, 2, 3, 1, 0],
  };
  for (const [name, frets] of Object.entries(known))
    assert.ok(
      searchChord(name).positions.some(
        (position) => JSON.stringify(position.frets) === JSON.stringify(frets),
      ),
      name,
    );
});
test("position retrieval handles boundaries", () => {
  const chord = searchChord("Am");
  assert.equal(getPosition(chord, 0), chord.positions[0]);
  for (const index of [-1, 1.5, 99])
    assert.equal(getPosition(chord, index), null);
});
test("all dataset entries have required fields, unique identifiers and six valid strings", () => {
  const chordIds = new Set(),
    positionIds = new Set();
  for (const chord of CHORDS) {
    assert.ok(chord.id);
    assert.ok(chord.displayName);
    assert.ok(chord.root in ROOT_PITCH);
    assert.ok(QUALITIES.includes(chord.quality));
    assert.ok(chord.positions.length);
    assert.ok(!chordIds.has(chord.id));
    chordIds.add(chord.id);
    for (const position of chord.positions) {
      assert.ok(position.id);
      assert.ok(!positionIds.has(position.id));
      positionIds.add(position.id);
      assert.equal(position.frets.length, 6);
      assert.equal(position.fingers.length, 6);
      assert.ok(
        Number.isInteger(position.baseFret) &&
          position.baseFret >= 1 &&
          position.baseFret <= 24,
      );
      position.frets.forEach((fret, i) => {
        assert.ok(Number.isInteger(fret) && fret >= -1 && fret <= 24);
        assert.ok(
          fret <= 0 ||
            (fret >= position.baseFret && fret < position.baseFret + 5),
        );
        const finger = position.fingers[i];
        assert.ok(Number.isInteger(finger) && finger >= 0 && finger <= 4);
        assert.ok(fret <= 0 ? finger === 0 : finger > 0);
      });
      for (const barre of position.barres) {
        assert.ok(
          barre.fromString >= 0 &&
            barre.toString <= 5 &&
            barre.fromString < barre.toString,
        );
        assert.equal(position.frets[barre.fromString], barre.fret);
        assert.equal(position.frets[barre.toString], barre.fret);
        for (let i = barre.fromString; i <= barre.toString; i++)
          assert.ok(position.frets[i] >= barre.fret);
      }
    }
  }
});
test("every position sounds the declared chord in standard tuning", () => {
  // Independent musical check, not copied from source MIDI fields.
  const tuning = [4, 9, 2, 7, 11, 4];
  const intervals = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    7: [0, 4, 7, 10],
    maj7: [0, 4, 7, 11],
    m7: [0, 3, 7, 10],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    dim: [0, 3, 6],
    5: [0, 7],
    add9: [0, 2, 4, 7], "7sus4": [0, 5, 7, 10], "7#9": [0, 3, 4, 7, 10],
    m7b5: [0, 3, 6, 10], "11": [0, 2, 4, 5, 7, 10], "13": [0, 2, 4, 5, 7, 9, 10],
  };
  for (const chord of CHORDS)
    for (const position of chord.positions) {
      const actual = new Set(
        position.frets.flatMap((fret, i) =>
          fret === -1
            ? []
            : [(tuning[i] + fret - ROOT_PITCH[chord.root] + 120) % 12],
        ),
      );
      const expected = intervals[chord.quality];
      const essential = chord.quality === "11" ? [0, 5, 10]
        : chord.quality === "13" ? [0, 4, 9, 10]
        : ["7", "maj7", "m7", "7sus4", "7#9"].includes(chord.quality)
        ? expected.filter((note) => note !== 7)
        : expected;
      for (const tone of actual)
        assert.ok(
          expected.includes(tone),
          `${position.id}: unexpected ${tone}`,
        );
      for (const tone of essential)
        assert.ok(actual.has(tone), `${position.id}: missing ${tone}`);
    }
});


test("new chord names, Unicode accidentals and half-diminished aliases resolve", () => {
  for (const suffix of ["add9", "7sus4", "7#9", "m7b5", "11", "13"]) {
    assert.equal(searchChord("C" + suffix)?.quality, suffix);
    assert.ok(searchChord("C" + suffix).positions.length);
  }
  assert.equal(searchChord(" E 7♯9 ")?.displayName, "E7#9");
  assert.equal(searchChord("Bø7")?.displayName, "Bm7b5");
  assert.equal(searchChord("B♭m7♭5")?.displayName, "Bbm7b5");
});
