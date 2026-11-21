import test from "node:test";
import assert from "node:assert/strict";
import provenance from "../../../data/chords/PROVENANCE.json" with { type: "json" };
import { CHORD_TONE_INTERVALS } from "../../../domain/music/harmony.ts";
import { parseChord } from "../../../domain/music/chords.ts";
import { CHORDS } from "../../../data/chords/dataset.ts";
import { ROOTS, ROOT_PITCH, QUALITIES } from "./model.ts";
import {
  normalizeChordName,
  parseChordName,
  searchChord,
  findChord,
  chordDescription,
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
  for (const [name, quality] of [["CM9", "maj9"], ["Cm9", "m9"], ["CM11", "maj11"], ["CM7b5", "maj7b5"], ["CM6", "6"], ["Cm6/9", "m69"]])
    assert.equal(searchChord(name)?.quality, quality);
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
    "C7/B",
    "Cadd13",
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
      assert.equal(Boolean(a), Boolean(b));
      if (a) {
        assert.equal(a.positions, b.positions);
        assert.equal(b.root, flat);
      }
    }
});
test("the selector covers every source suffix, including enharmonic slash spellings", () => {
  assert.deepEqual(new Set(QUALITIES), new Set(provenance.suffixes));
  assert.equal(QUALITIES.length, 86);
  assert.equal(CHORDS.length, 826);
  for (const quality of QUALITIES) assert.ok(ROOTS.some(root => findChord(root, quality)), quality);
  for (const quality of QUALITIES.filter(type => !type.includes("/"))) {
    for (const root of ROOTS) {
      const unavailable = (["C#", "Db"].includes(root) && quality === "11")
        || (root === "E" && quality === "madd9")
        || (["Ab", "G#"].includes(root) && quality === "sus2sus4");
      assert.equal(Boolean(findChord(root, quality)), !unavailable, root + quality);
    }
  }
});
test("slash searches use the named lowest pitch and preserve its spelling", () => {
  for (const [name, canonical] of [["C/E", "C/E"], ["cm9/b♭", "Cm9/Bb"], ["c7/g", "C7/G"], ["C/G♭", "C/Gb"]]) {
    const chord = searchChord(name);
    assert.equal(chord?.displayName, canonical);
    const bass = parseChord(canonical).bass.pitchClass;
    for (const pos of chord.positions) {
      const midi = pos.frets.flatMap((fret, i) => fret < 0 ? [] : [[40,45,50,55,59,64][i] + fret]);
      assert.equal(Math.min(...midi) % 12, bass);
    }
  }
  assert.equal(searchChord("C/Gb").positions, searchChord("C/F#").positions);
  assert.equal(chordDescription(searchChord("C/Gb")), "Do majeur, basse Gb");
  assert.notEqual(searchChord("C").positions, searchChord("C/E").positions);
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
  for (const chord of CHORDS)
    for (const position of chord.positions) {
      const actual = new Set(
        position.frets.flatMap((fret, i) =>
          fret === -1
            ? []
            : [(tuning[i] + fret - ROOT_PITCH[chord.root] + 120) % 12],
        ),
      );
      const parsed = parseChord(chord.displayName);
      const base = parsed.suffix === "m" ? "minor" : parsed.suffix || "major";
      const expected = CHORD_TONE_INTERVALS[base === "alt" ? "(b5)" : base].map(note => note % 12);
      if (parsed.bass) {
        const midi = position.frets.flatMap((fret, i) => fret < 0 ? [] : [[40,45,50,55,59,64][i] + fret]);
        assert.equal(Math.min(...midi) % 12, parsed.bass.pitchClass, position.id);
        expected.push((parsed.bass.pitchClass - ROOT_PITCH[chord.root] + 12) % 12);
      }
      const essential = {
        major: [0, 4, 7], minor: [0, 3, 7], "5": [0, 7],
        dim: [0, 3, 6], dim7: [0, 3, 6, 9], sus2: [0, 2, 7], sus4: [0, 5, 7],
        "7": [0, 4, 10], m7: [0, 3, 10], maj7: [0, 4, 11],
        "11": [0, 5, 10], "13": [0, 4, 9, 10], "7sus4": [0, 5, 10],
        "7#9": [0, 3, 4, 10], m7b5: [0, 3, 6, 10], add9: [0, 2, 4, 7],
        alt: [0, 4, 6], sus2sus4: [0, 2, 5, 7], "9#11": [0, 4, 6, 10],
        mmaj11: [0, 3, 5, 11], "69": [0, 2, 4, 9], m69: [0, 2, 3, 9],
      }[base] ?? [0];
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
