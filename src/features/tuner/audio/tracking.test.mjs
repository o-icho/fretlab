import test from "node:test";
import assert from "node:assert/strict";
import { analysePitch, pitchBufferSize } from "./pitch.ts";
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

function bassFrame(frequency, rate, now, { decaying = false } = {}) {
  let seed = 12345 + now;
  return Float32Array.from({ length: pitchBufferSize(rate) }, (_, i) => {
    const time = now / 1000 + i / rate;
    if (!decaying) return 0.1 * Math.sin(2 * Math.PI * frequency * time);
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = (seed / 2 ** 32 - 0.5) * 0.0003;
    // Decay occurs inside the observation window too. Small string stiffness
    // stretches partials while leaving the intended fundamental unchanged.
    const stiffness = 0.0001;
    const partial = (n) => Math.sin(
      2 * Math.PI * frequency * n *
      Math.sqrt((1 + stiffness * n * n) / (1 + stiffness)) * time,
    );
    const amplitude = 0.025 * Math.exp(-time / 1.2);
    return amplitude * (0.12 * partial(1) + partial(2) + 0.25 * partial(3)) + noise;
  });
}

function followFrame(tracker, buffer, rate, now) {
  const analysis = analysePitch(buffer, rate, {
    minRms: tracker.isTracking ? TRACKING.releaseRms : TRACKING.acquireRms,
    yinThreshold: tracker.isTracking
      ? 1 - TRACKING.holdConfidence
      : 1 - TRACKING.acquireConfidence,
  });
  return { analysis, stable: tracker.push(analysis.detection, now) };
}

function assertPitchNear(actual, expected, context) {
  assert.ok(actual !== null && actual > 0, context);
  assert.ok(Math.abs(1200 * Math.log2(actual / expected)) < 5,
    `${context}: expected ${expected} Hz, received ${actual} Hz`);
}

for (const rate of [44100, 48000, 96000]) {
  for (const bass of [30.867706, 41.203445]) {
    test(`real YIN and tracking follow ${bass} Hz octave up/down at ${rate} Hz`, () => {
      const tracker = new PitchStabilizer();
      let now = 0;
      for (const frequency of [bass, bass * 2, bass]) {
        for (let frame = 0; frame < 7; frame++, now += 60) {
          const { analysis, stable } = followFrame(
            tracker, bassFrame(frequency, rate, now), rate, now,
          );
          assertPitchNear(analysis.detection?.frequency ?? null, frequency,
            `raw octave transition at ${now} ms`);
          // The stabilizer may hold the previous note only while confirming.
          if (frame >= 3) assertPitchNear(stable, frequency, `retained at ${now} ms`);
        }
      }
    });

    test(`pure ${bass * 2} Hz is not invented as a bass fundamental at ${rate} Hz`, () => {
      const tracker = new PitchStabilizer();
      for (let now = 0; now <= 600; now += 60) {
        const { analysis, stable } = followFrame(
          tracker, bassFrame(bass * 2, rate, now), rate, now,
        );
        assertPitchNear(analysis.detection?.frequency ?? null, bass * 2,
          `pure octave raw at ${now} ms`);
        if (now >= 120) assertPitchNear(stable, bass * 2, `pure octave retained at ${now} ms`);
      }
    });

    test(`decaying inharmonic ${bass} Hz with noise remains measured at ${rate} Hz`, () => {
      const tracker = new PitchStabilizer();
      let accepted = 0;
      let quietAccepted = 0;
      for (let now = 0; now <= 3000; now += 60) {
        const { analysis, stable } = followFrame(
          tracker, bassFrame(bass, rate, now, { decaying: true }), rate, now,
        );
        if (now < 180) continue;
        assertPitchNear(stable, bass, `bass sustain at ${now} ms`);
        if (tracker.decision.accepted) {
          accepted++;
          assertPitchNear(analysis.detection?.frequency ?? null, bass,
            `accepted bass raw at ${now} ms`);
          if (analysis.rms < TRACKING.acquireRms) quietAccepted++;
        }
      }
      assert.ok(accepted >= 45, `only ${accepted} genuine sustain detections`);
      assert.ok(quietAccepted >= 10, `only ${quietAccepted} quiet sustain detections`);
      assert.equal(tracker.push(null, 3600), null, "silence clears the bass reading");
    });
  }
}
