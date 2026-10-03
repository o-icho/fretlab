import test from "node:test";
import assert from "node:assert/strict";
import { detectPitch, PitchStabilizer } from "./pitch.ts";

function tone(
  frequency,
  sampleRate,
  amplitude = 0.3,
  harmonics = false,
  offset = 0,
) {
  return Float32Array.from({ length: 4096 }, (_, i) => {
    const phase = (2 * Math.PI * frequency * i) / sampleRate;
    return (
      offset +
      amplitude *
        (Math.sin(phase) +
          (harmonics
            ? 0.6 * Math.sin(2 * phase) + 0.35 * Math.sin(3 * phase)
            : 0))
    );
  });
}
for (const sampleRate of [44100, 48000, 96000])
  for (const frequency of [
    82.4069, 110, 146.8324, 195.9977, 246.9417, 329.6276, 440, 880,
  ])
    test(`YIN detects ${frequency} Hz at ${sampleRate} Hz`, () => {
      const result = detectPitch(tone(frequency, sampleRate), sampleRate);
      assert.ok(result);
      assert.ok(
        Math.abs(1200 * Math.log2(result.frequency / frequency)) < 5,
        JSON.stringify(result),
      );
      assert.ok(result.confidence > 0.88);
    });
test("harmonic-rich guitar-like waveform and DC offset", () => {
  for (const frequency of [82.4069, 110, 220, 440]) {
    const result = detectPitch(tone(frequency, 48000, 0.2, true, 0.15), 48000);
    assert.ok(result);
    assert.ok(Math.abs(1200 * Math.log2(result.frequency / frequency)) < 5);
  }
});
test("silence, weak signals, invalid buffers, DC and nonperiodic noise rejected", () => {
  let seed = 12345;
  const noise = Float32Array.from({ length: 4096 }, () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed / 2 ** 32 - 0.5) * 0.5;
  });
  for (const buffer of [
    new Float32Array(4096),
    new Float32Array(4096).fill(0.3),
    tone(110, 48000, 0.001),
    noise,
    new Float32Array(8),
    new Float32Array(4096).fill(NaN),
  ])
    assert.equal(detectPitch(buffer, 48000), null);
  assert.equal(detectPitch(tone(110, 48000), 0), null);
});
test("stabilizer requires confirmation, smooths jitter and clears weak signal", () => {
  const stable = new PitchStabilizer();
  const detection = (frequency) => ({ frequency, confidence: 0.99, rms: 0.2 });
  assert.equal(stable.push(detection(110)), null);
  assert.equal(stable.push(detection(110.1)), null);
  assert.equal(stable.push(detection(109.9)), 110);
  assert.ok(Math.abs(stable.push(detection(110.05)) - 110) < 0.2);
  const now = performance.now();
  assert.notEqual(stable.push(null, now + 60), null);
  assert.notEqual(stable.push(null, now + 120), null);
  assert.equal(stable.push(null, now + 600), null);
});
test("large pitch changes re-confirm without hiding octave changes", () => {
  const stable = new PitchStabilizer();
  const detection = (frequency) => ({ frequency, confidence: 0.99, rms: 0.2 });
  stable.push(detection(110));
  stable.push(detection(110));
  assert.equal(stable.push(detection(110)), 110);
  assert.equal(stable.push(detection(220)), 110);
  assert.equal(stable.push(detection(220)), 110);
  assert.equal(stable.push(detection(220)), 110);
  assert.equal(stable.push(detection(220)), 220);
  stable.reset();
  assert.equal(stable.push(detection(220)), null);
});
