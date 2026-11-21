import assert from "node:assert/strict";
import test from "node:test";
import { searchChord } from "./search.ts";
import { playedNotes } from "./voicing.ts";

test("the C barre at fret eight keeps all six strings and their octaves", () => {
  const chord = searchChord("C");
  const notes = playedNotes(chord, chord.positions.find((position) => position.baseFret === 8));
  assert.deepEqual(notes.map((n) => n.name), ["C", "G", "C", "E", "G", "C"]);
  assert.deepEqual(notes.map((n) => n.midi), [48, 55, 60, 64, 67, 72]);
});

test("muted strings are skipped and pitches follow the diagram even when they cross", () => {
  const chord = searchChord("C");
  assert.deepEqual(playedNotes(chord, chord.positions[0]).map((n) => n.midi), [48, 52, 55, 60, 64]);
  const add9 = searchChord("Cadd9");
  const crossed = add9.positions.find((position) => position.frets.join() === "8,7,0,0,8,0");
  assert.deepEqual(playedNotes(add9, crossed).map((n) => n.midi), [48, 52, 50, 55, 67, 64]);
});

test("the names match the requested chord spelling and its altered extensions", () => {
  for (const [symbol, required] of [["Db", ["Db", "F", "Ab"]], ["C#", ["C#", "E#", "G#"]], ["C7#9", ["Bb", "D#"]], ["C9#11", ["F#"]]]) {
    const chord = searchChord(symbol);
    const names = playedNotes(chord, chord.positions[0]).map((note) => note.name);
    for (const name of required) assert.ok(names.includes(name), symbol + " requires " + name);
  }
});
