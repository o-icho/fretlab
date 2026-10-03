import test from "node:test";
import assert from "node:assert/strict";
import { analysePitch } from "./pitch.ts";
import { PitchStabilizer, TRACKING } from "./tracking.ts";
import { musicalAudioConstraints } from "./constraints.ts";

const sample = (frequency, confidence = 0.99, rms = 0.02) => ({
  frequency,
  confidence,
  rms,
});
function acquire(tracker) {
  tracker.push(sample(82.2), 0);
  tracker.push(sample(82.5), 60);
  return tracker.push(sample(82.3), 120);
}
test("nearby E2 measurements use a robust median", () => {
  const tracker = new PitchStabilizer();
  assert.equal(acquire(tracker), 82.3);
  const stable = tracker.push(sample(82.4), 180);
  assert.ok(stable >= 82.3 && stable <= 82.4);
});
test("a dropout holds the display briefly without refreshing the validity clock", () => {
  const tracker = new PitchStabilizer();
  acquire(tracker);
  assert.equal(tracker.push(null, 180), 82.3);
  assert.equal(tracker.age(180), 60);
  assert.notEqual(tracker.push(sample(82.4), 240), null);
  assert.equal(tracker.age(240), 0);
});
test("RMS and confidence hysteresis follow real quieter periodic readings", () => {
  const tracker = new PitchStabilizer();
  acquire(tracker);
  for (let now = 180; now < 2500; now += 60) {
    assert.notEqual(tracker.push(sample(82.4, 0.78, 0.0012), now), null);
    assert.equal(tracker.decision.accepted, true);
    assert.equal(tracker.age(now), 0);
  }
  const fresh = new PitchStabilizer();
  for (let now = 0; now < 600; now += 60)
    assert.equal(fresh.push(sample(82.4, 0.78, 0.0012), now), null);
});
test("silence ends after 450ms even with just one late callback", () => {
  const tracker = new PitchStabilizer();
  acquire(tracker);
  assert.equal(tracker.push(null, 400), 82.3);
  assert.equal(tracker.push(null, 571), null);
  assert.equal(
    tracker.push(sample(82.4, 0.99, TRACKING.releaseRms / 2), 600),
    null,
  );
});
test("new A2 is confirmed in three frames without locking to E2", () => {
  const tracker = new PitchStabilizer();
  acquire(tracker);
  assert.equal(tracker.push(sample(110), 180), 82.3);
  assert.equal(tracker.push(sample(110.1), 240), 82.3);
  assert.ok(Math.abs(tracker.push(sample(109.9), 300) - 110) < 0.2);
});
test("one octave/fifth glitch does not replace or enter the median", () => {
  const tracker = new PitchStabilizer();
  acquire(tracker);
  assert.equal(tracker.push(sample(164.8), 180), 82.3);
  assert.equal(tracker.push(sample(123.5), 240), 82.3);
  assert.notEqual(tracker.push(sample(82.4), 300), null);
  assert.ok(Math.abs(tracker.frequency - 82.4) < 0.2);
  assert.equal(tracker.decision.reason, "tracking");
});
test("real octave changes remain possible after four confirmations", () => {
  const tracker = new PitchStabilizer();
  acquire(tracker);
  for (const now of [180, 240, 300])
    assert.equal(tracker.push(sample(164.8), now), 82.3);
  assert.equal(tracker.push(sample(164.8), 360), 164.8);
});
test("stale or interrupted candidate sequences do not acquire a note", () => {
  const tracker = new PitchStabilizer();
  tracker.push(sample(110), 0);
  tracker.push(sample(110), 60);
  assert.equal(tracker.push(sample(110), 400), null);
  tracker.push(null, 420);
  assert.equal(tracker.push(sample(110), 480), null);
});
test("supported speech processing constraints are disabled, unsupported ones omitted", () => {
  assert.deepEqual(musicalAudioConstraints({}), {});
  assert.deepEqual(
    musicalAudioConstraints({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    }),
    {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  );
  assert.deepEqual(
    musicalAudioConstraints({
      echoCancellation: true,
      noiseSuppression: false,
    }),
    { echoCancellation: false },
  );
});

for (const rate of [44100, 48000])
  for (const frequency of [
    82.4069, 110, 146.8324, 195.9977, 246.9417, 329.6276,
  ])
    test(`decaying ${frequency} Hz at ${rate} Hz stays truly detected during sustain`, () => {
      const tracker = new PitchStabilizer();
      let seed = 12345;
      let belowOldThreshold = 0;
      let rawAccepted = 0;
      for (let now = 0; now <= 3600; now += 60) {
        const amplitude = 0.025 * Math.exp(-now / 1200);
        const buffer = Float32Array.from({ length: 4096 }, (_, i) => {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          const noise = (seed / 2 ** 32 - 0.5) * 0.0006;
          const phase = 2 * Math.PI * frequency * (now / 1000 + i / rate);
          return (
            amplitude * (Math.sin(phase) + 0.35 * Math.sin(2 * phase)) + noise
          );
        });
        const analysis = analysePitch(buffer, rate, {
          minRms: tracker.isTracking
            ? TRACKING.releaseRms
            : TRACKING.acquireRms,
          yinThreshold: tracker.isTracking
            ? 1 - TRACKING.holdConfidence
            : 1 - TRACKING.acquireConfidence,
          referenceFrequency: tracker.frequency,
        });
        const stable = tracker.push(analysis.detection, now);
        if (now >= 180) {
          assert.ok(stable, `${now}: ${analysis.reason}`);
          assert.ok(
            Math.abs(1200 * Math.log2(stable / frequency)) < 5,
            JSON.stringify({
              now,
              frequency,
              stable,
              raw: analysis.detection,
              cents: 1200 * Math.log2(stable / frequency),
            }),
          );
          if (tracker.decision.accepted) {
            rawAccepted++;
            if (analysis.rms < 0.008) belowOldThreshold++;
          }
        }
      }
      assert.ok(rawAccepted >= 50, "must be actual detections, not UI hold");
      assert.ok(belowOldThreshold >= 30);
      assert.equal(tracker.push(null, 4200), null);
    });
test("YIN reports low-volume and nonperiodic rejection reasons", () => {
  assert.equal(analysePitch(new Float32Array(4096), 48000).reason, "rms");
  assert.equal(
    analysePitch(new Float32Array(4), 48000).reason,
    "invalid-buffer",
  );
});
