import test from "node:test";
import assert from "node:assert/strict";
import {
  frequencyToMidi,
  frequencyToNote,
  midiToNote,
  targetFrequency,
  centsDifference,
  clampCents,
  tuningStatus,
  nearestGuitarString,
  nearestString,
  STANDARD_STRINGS,
} from "./notes.ts";
import { BASS_4_TUNING, BASS_5_TUNING, STANDARD_TUNING, TUNINGS, tuningNotes } from "../../../domain/music/tuning.ts";

for (const [frequency, note, octave, midi] of [
  [440, "A", 4, 69],
  [220, "A", 3, 57],
  [261.63, "C", 4, 60],
  [329.63, "E", 4, 64],
  [41.2034, "E", 1, 28],
  [30.8677, "B", 0, 23],
])
  test(`${frequency} Hz -> ${note}${octave}`, () => {
    const result = frequencyToNote(frequency);
    assert.equal(result.note, note);
    assert.equal(result.octave, octave);
    assert.equal(result.midi, midi);
  });
test("target frequencies and MIDI round trips", () => {
  assert.equal(targetFrequency(69), 440);
  assert.equal(targetFrequency(57), 220);
  assert.ok(Math.abs(targetFrequency(40) - 82.4069) < 0.001);
  for (let midi = 0; midi < 128; midi++) {
    assert.ok(Math.abs(frequencyToMidi(targetFrequency(midi)) - midi) < 1e-10);
    assert.equal(midiToNote(midi).midi, midi);
  }
});
test("cents sign, exact reference and semitone distance", () => {
  assert.equal(centsDifference(440, 440), 0);
  assert.ok(centsDifference(441, 440) > 0);
  assert.ok(centsDifference(439, 440) < 0);
  assert.ok(Math.abs(centsDifference(targetFrequency(70), 440) - 100) < 1e-10);
  assert.equal(clampCents(1200), 50);
  assert.equal(clampCents(-1200), -50);
  assert.equal(tuningStatus(5), "Note juste");
  assert.equal(tuningStatus(-5), "Note juste");
  assert.equal(tuningStatus(-6), "Note trop basse");
  assert.equal(tuningStatus(6), "Note trop haute");
});
test("invalid frequencies do not produce misleading notes or cents", () => {
  for (const value of [0, -1, NaN, Infinity]) {
    assert.equal(frequencyToNote(value), null);
    assert.equal(frequencyToMidi(value), null);
    assert.equal(centsDifference(value, 440), null);
    assert.equal(nearestGuitarString(value), null);
  }
});
test("standard guitar references and chromatic independence", () => {
  assert.deepEqual(
    STANDARD_STRINGS.map((string) => string.note + string.octave),
    ["E2", "A2", "D3", "G3", "B3", "E4"],
  );
  assert.equal(nearestGuitarString(110).midi, 45);
  assert.equal(frequencyToNote(440).midi, 69);
  assert.equal(nearestGuitarString(440).midi, 64);
});
test("bass tunings use the correct sounding octaves and keep guitar scale presets unchanged", () => {
  assert.deepEqual(tuningNotes(BASS_4_TUNING).map((note) => note.note + note.octave), ["E1", "A1", "D2", "G2"]);
  assert.deepEqual(tuningNotes(BASS_5_TUNING).map((note) => note.note + note.octave), ["B0", "E1", "A1", "D2", "G2"]);
  assert.ok(Math.abs(tuningNotes(BASS_5_TUNING)[0].frequency - 30.867706) < 0.00001);
  assert.equal(TUNINGS[0], STANDARD_TUNING);
  assert.ok(TUNINGS.every((tuning) => tuning.strings.length === 6));
});
test("automatic bass targets stay on the played string above and below its reference", () => {
  for (const tuning of [BASS_4_TUNING, BASS_5_TUNING]) {
    for (const reference of tuningNotes(tuning)) {
      for (const cents of [-75, 0, 75]) {
        const frequency = reference.frequency * 2 ** (cents / 1200);
        const target = nearestString(frequency, tuning);
        assert.equal(target.midi, reference.midi);
        assert.ok(Math.abs(centsDifference(frequency, target.frequency) - cents) < 1e-8);
      }
    }
    for (const frequency of [0, -1, NaN, Infinity]) assert.equal(nearestString(frequency, tuning), null);
  }
  assert.equal(nearestString(55, { ...BASS_4_TUNING, strings: [] }), null);
});
