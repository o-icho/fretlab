import assert from "node:assert/strict";
import test from "node:test";
import { CHORDS } from "../../data/chords/dataset.ts";
import { earExercises } from "../../domain/music/earTraining.ts";
import { SHARP_NOTES } from "../../domain/music/pitch.ts";
import { STANDARD_TUNING } from "../../domain/music/tuning.ts";
import { earChordPositions } from "./earChordPositions.ts";

test("every chord answer has distinct catalogue positions containing exactly its chord tones", () => {
  const catalogue = new Set(CHORDS.flatMap(chord => chord.positions));
  for (const root of SHARP_NOTES) {
    for (const exercise of earExercises(root, "chord")) {
      const positions = earChordPositions(exercise);
      assert.ok(positions.length > 0, exercise.answer);
      assert.equal(new Set(positions.map(position => position.frets.join(","))).size, positions.length);
      let sawInversion = false;
      for (const position of positions) {
        assert.ok(catalogue.has(position));
        const notes = position.frets.flatMap((fret, index) => fret < 0 ? [] : [STANDARD_TUNING.strings[index] + fret]);
        assert.deepEqual(new Set(notes.map(n => n % 12)), new Set(exercise.midi.map(n => n % 12)), exercise.answer);
        if (Math.min(...notes) % 12 === exercise.midi[0] % 12) assert.equal(sawInversion, false);
        else sawInversion = true;
      }
    }
  }
});

test("interval answers have no chord diagram", () => {
  assert.deepEqual(earChordPositions(earExercises("C", "interval")[0]), []);
});
