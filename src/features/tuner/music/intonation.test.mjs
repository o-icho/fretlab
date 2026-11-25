import assert from "node:assert/strict";
import test from "node:test";
import { targetFrequency } from "../../../domain/music/midi.ts";
import { BASS_4_TUNING, BASS_5_TUNING, STANDARD_TUNING, TUNINGS } from "../../../domain/music/tuning.ts";
import { resolveStringTuning } from "../../../domain/music/stringTunings.ts";
import { detectPitch, pitchBufferSize } from "../audio/pitch.ts";
import {
  createIntonationSession, intonationCents, intonationReducer, measurementStage, verdict,
} from "./intonation.ts";

const open = targetFrequency(STANDARD_TUNING.strings[0]);
const detune = (hz, cents) => hz * 2 ** (cents / 1200);
const sample = (session, hz) => intonationReducer(session, { type: "sample", frequency: hz });
function sustain(session, frequency, count = 6) {
  for (let i = 0; i < count; i++) session = sample(session, frequency);
  return session;
}
function octave(session, open, offset) {
  session = sustain(session, open);
  session = intonationReducer(session, { type: "arm-fret" });
  return sustain(session, detune(open * 2, offset));
}

test("l’intonation compare la case 12 à l’octave effectivement mesurée", () => {
  const slightlySharp = detune(open, 3);
  for (const cents of [-20, 0, 17]) {
    const result = octave(createIntonationSession(STANDARD_TUNING), slightlySharp, cents);
    const reading = result.readings[0];
    assert.equal(measurementStage(result), "done");
    assert.ok(Math.abs(intonationCents(reading.open, reading.fretted) - cents) < 0.000001);
  }
  assert.equal(verdict(-13), "Trop grave à la 12ᵉ case");
  assert.equal(verdict(5), "Juste à la 12ᵉ case");
  assert.equal(verdict(13), "Trop aigu à la 12ᵉ case");
  assert.equal(intonationCents(0, open), null);
});

test("une lecture exige plusieurs trames neuves, stables, dans la bonne octave", () => {
  let session = createIntonationSession(STANDARD_TUNING);
  for (const wrong of [null, NaN, Infinity, -1, open * 2, detune(open, -9)])
    session = sustain(session, wrong);
  session = sustain(session, open, 3);
  session = sample(session, null); // silence ou hauteur seulement conservée par l’affichage
  session = sustain(session, open, 2);
  assert.equal(measurementStage(session), "open");
  session = sustain(session, open);
  assert.equal(measurementStage(session), "ready");
  assert.equal(measurementStage(sustain(session, open * 2)), "ready");
  session = intonationReducer(session, { type: "arm-fret" });
  session = sustain(session, open);
  for (const cents of [-10, 12, -9, 13, 0]) session = sample(session, detune(open * 2, cents));
  assert.equal(measurementStage(session), "fretted");
  session = sustain(session, detune(open * 2, -12));
  assert.equal(measurementStage(session), "done");
});

test("le contrôle distingue les cordes graves des basses de leur octave en standard et en drop", () => {
  const sampleRate = 48000;
  const detected = frequency => {
    const wave = Float32Array.from({ length: pitchBufferSize(sampleRate) }, (_, i) => {
      const phase = 2 * Math.PI * frequency * i / sampleRate;
      return 0.05 * Math.sin(phase) + 0.18 * Math.sin(phase * 2) + 0.08 * Math.sin(phase * 3);
    });
    return detectPitch(wave, sampleRate)?.frequency;
  };
  for (const [instrument, tuning, hz, cents] of [
    ["bass-4", BASS_4_TUNING, 41.2034, -12],
    ["bass-4", resolveStringTuning("bass-4", "bass-4-drop-d"), 36.7081, 10],
    ["bass-5", BASS_5_TUNING, 30.8677, 14],
    ["bass-5", resolveStringTuning("bass-5", "bass-5-drop-a"), 27.5, -10],
  ]) {
    let session = createIntonationSession(tuning, instrument);
    session = sustain(session, detected(hz * 2)); // an octave-up note cannot validate the open string
    assert.equal(measurementStage(session), "open");
    session = sustain(session, detected(hz));
    assert.equal(measurementStage(session), "ready");
    session = intonationReducer(session, { type: "arm-fret" });
    session = sustain(session, detected(detune(hz * 2, cents)));
    const reading = session.readings[0];
    assert.equal(measurementStage(session), "done");
    assert.ok(Math.abs(intonationCents(reading.open, reading.fretted) - cents) < 2);
    session = intonationReducer(session, { type: "string", index: tuning.strings.length - 1 });
    assert.equal(measurementStage(session), "open");
    assert.equal(session.readings[0], reading);
  }
});

test("les mesures de chaque corde restent indépendantes et un changement d’accordage les réinitialise", () => {
  let session = octave(createIntonationSession(STANDARD_TUNING), open, 7);
  const first = session.readings[0];
  session = intonationReducer(session, { type: "string", index: 1 });
  session = octave(session, targetFrequency(STANDARD_TUNING.strings[1]), -6);
  assert.deepEqual(session.readings[0], first);
  session = intonationReducer(session, { type: "repeat" });
  assert.equal(session.readings[1], undefined);
  assert.equal(session.readings[0], first);
  session = intonationReducer(session, { type: "string", index: 0 });
  assert.equal(measurementStage(session), "done");
  const dropD = TUNINGS.find((item) => item.id === "drop-d");
  session = intonationReducer(session, { type: "tuning", tuning: dropD });
  session = sustain(session, open);
  assert.equal(measurementStage(session), "open");
  session = sustain(session, targetFrequency(dropD.strings[0]));
  assert.equal(measurementStage(session), "ready");
});
