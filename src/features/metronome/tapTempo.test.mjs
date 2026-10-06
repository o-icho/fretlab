import test from "node:test";
import assert from "node:assert/strict";
import { emptyTapSequence, estimateTapTempo, recordTap, TAP_RESET_MS } from "./tapTempo.ts";

function taps(intervals) {
  let timestamp = 0;
  let sequence = recordTap(emptyTapSequence(), timestamp);
  for (const interval of intervals) {
    timestamp += interval;
    sequence = recordTap(sequence, timestamp);
  }
  return sequence;
}

for (const [interval, bpm] of [[500, 120], [1000, 60], [400, 150], [1500, 40], [250, 240], [60000 / 65, 65]]) {
  test(`regular taps ${interval} ms measure ${bpm} BPM without octave conversion`, () => {
    assert.deepEqual(estimateTapTempo(taps(Array(6).fill(interval))), { bpm, stable: true, inRange: true });
  });
}
test("one interval cannot set tempo; four regular intervals are required", () => {
  for (let count = 0; count < 4; count++) {
    assert.equal(estimateTapTempo(taps(Array(count).fill(500))).stable, false);
    assert.equal(estimateTapTempo(taps(Array(count).fill(500))).bpm, null);
  }
  assert.equal(estimateTapTempo(taps(Array(4).fill(500))).stable, true);
});
test("small timing variation is averaged and a single missed or short tap is rejected", () => {
  assert.deepEqual(estimateTapTempo(taps([490, 510, 505, 495])), { bpm: 120, stable: true, inRange: true });
  for (const outlier of [90, 1000]) {
    const intervals = [500, 500, 500, 500, outlier];
    assert.equal(estimateTapTempo(taps(intervals)).stable, false);
    assert.deepEqual(estimateTapTempo(taps([...intervals, 500])), { bpm: 120, stable: true, inRange: true });
  }
});
test("irregular or competing rhythms do not apply a new tempo", () => {
  assert.equal(estimateTapTempo(taps([300, 500, 300, 500, 300, 500, 300, 500])).stable, false);
  assert.equal(estimateTapTempo(taps([500, 500, 500, 500, 500, 1000, 1000, 1000])).stable, false);
});
test("a long pause begins a fresh sequence and forgets the previous estimate", () => {
  const previous = taps([500, 500, 500, 500]);
  const reset = recordTap(previous, previous.lastTap + TAP_RESET_MS);
  assert.equal(reset.intervals.length, 0);
  assert.equal(estimateTapTempo(reset).bpm, null);
  let next = reset;
  for (let i = 0; i < 4; i++) next = recordTap(next, next.lastTap + 400);
  assert.deepEqual(estimateTapTempo(next), { bpm: 150, stable: true, inRange: true });
});
test("recent taps replace an old tempo instead of carrying history indefinitely", () => {
  const sequence = taps([...Array(12).fill(500), ...Array(8).fill(1000)]);
  assert.equal(sequence.intervals.length, 8);
  assert.deepEqual(estimateTapTempo(sequence), { bpm: 60, stable: true, inRange: true });
});
test("out-of-range measurements are reported honestly, never clamped or doubled", () => {
  for (const [interval, bpm] of [[200, 300], [2000, 30]]) {
    assert.deepEqual(estimateTapTempo(taps(Array(6).fill(interval))), { bpm, stable: true, inRange: false });
  }
});
test("invalid, duplicate or out-of-order timestamps do not mutate a sequence", () => {
  const sequence = taps([500, 500]);
  for (const value of [NaN, Infinity, -1, sequence.lastTap, sequence.lastTap - 20]) {
    assert.equal(recordTap(sequence, value), sequence);
  }
  const next = recordTap(sequence, sequence.lastTap + 500);
  assert.equal(sequence.intervals.length, 2);
  assert.equal(next.intervals.length, 3);
});
