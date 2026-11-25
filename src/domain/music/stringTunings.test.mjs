import test from "node:test";
import assert from "node:assert/strict";
import { getStringTunings, resolveStringInstrument, resolveStringTuning } from "./stringTunings.ts";
import { BASS_4_TUNING, BASS_5_TUNING, TUNINGS, tuningNotes } from "./tuning.ts";

test("les liens vers l’accordeur et la rubrique gardent la famille d’instrument", () => {
  for (const instrument of ["bass-4", "bass-5"]) {
    for (const tuning of getStringTunings(instrument)) {
      assert.equal(resolveStringInstrument(null, tuning.id), instrument);
      assert.equal(resolveStringTuning(instrument, tuning.id), tuning);
    }
  }
  assert.equal(resolveStringInstrument("folk", "drop-d"), "folk");
  assert.equal(resolveStringInstrument(null, "drop-d"), "electric");
  assert.equal(resolveStringInstrument("inconnu", "bass-5"), "bass-5");
  assert.equal(resolveStringInstrument("inconnu", "inconnu"), "electric");
  assert.equal(resolveStringInstrument("bass-4", "bass-5"), "bass-4");
  assert.equal(resolveStringTuning("bass-4", "bass-5"), BASS_4_TUNING);
  assert.equal(resolveStringTuning("bass-5", "drop-d"), BASS_5_TUNING);
  assert.equal(getStringTunings("classical"), TUNINGS);
});

test("le drop abaisse uniquement la corde la plus grave d’un ton sur chaque basse", () => {
  for (const [instrument, expected] of [
    ["bass-4", ["D1", "A1", "D2", "G2"]],
    ["bass-5", ["A0", "E1", "A1", "D2", "G2"]],
  ]) {
    const [standard, drop] = getStringTunings(instrument);
    assert.deepEqual(tuningNotes(drop).map(n => n.note + n.octave), expected);
    assert.equal(drop.strings[0], standard.strings[0] - 2);
    assert.deepEqual(drop.strings.slice(1), standard.strings.slice(1));
  }
});
