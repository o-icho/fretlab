import test from "node:test";
import assert from "node:assert/strict";
import {
  clampBpm,
  parseBpm,
  beatsPerBar,
  beatInterval,
  nextBeat,
  isTimeSignature,
  planBeats,
} from "./rhythm.ts";

test("BPM validation: finite integers clamped to 40–240", () => {
  for (const [value, expected] of [
    [0, 40],
    [-12, 40],
    [39, 40],
    [40, 40],
    [120, 120],
    [240, 240],
    [241, 240],
    [999, 240],
    [120.6, 121],
    [NaN, 120],
    [Infinity, 120],
  ])
    assert.equal(clampBpm(value), expected);
  for (const [value, expected] of [
    ["", null],
    ["  ", null],
    ["abc", null],
    ["120", 120],
    ["39", 40],
    ["999", 240],
    ["119.7", 120],
  ])
    assert.equal(parseBpm(value), expected);
});
test("signatures and measure wrap", () => {
  for (const [signature, count] of [
    ["2/4", 2],
    ["3/4", 3],
    ["4/4", 4],
    ["6/8", 6],
  ]) {
    assert.ok(isTimeSignature(signature));
    assert.equal(beatsPerBar(signature), count);
    let beat = 0;
    for (let i = 0; i < count; i++) {
      assert.equal(beat, i);
      beat = nextBeat(beat, signature);
    }
    assert.equal(beat, 0);
  }
  assert.equal(isTimeSignature("5/4"), false);
});
test("quarter-note and compound meter intervals", () => {
  assert.equal(beatInterval(120, "4/4"), 0.5);
  assert.equal(beatInterval(60, "3/4"), 1);
  assert.equal(beatInterval(240, "2/4"), 0.25);
  assert.equal(beatInterval(120, "6/8"), 1 / 6);
  assert.equal(beatInterval(40, "6/8"), 0.5);
});
test("lookahead schedules future audio timestamps and advances cursor", () => {
  const plan = planBeats({ time: 1.04, beat: 0 }, 1, 0.1, 120, "4/4");
  assert.deepEqual(plan.events, [{ time: 1.04, beat: 0 }]);
  assert.deepEqual(plan.next, { time: 1.54, beat: 1 });
  assert.equal(planBeats(plan.next, 1.025, 0.1, 120, "4/4").events.length, 0);
});
test("successive wakeups do not duplicate beats or accumulate timer drift", () => {
  let cursor = { time: 0.04, beat: 0 };
  const events = [];
  for (let i = 0; i < 400; i++) {
    const plan = planBeats(cursor, i * 0.025, 0.1, 120, "4/4");
    events.push(...plan.events);
    cursor = plan.next;
  }
  assert.equal(events.length, 21);
  for (let i = 0; i < events.length; i++) {
    assert.ok(Math.abs(events[i].time - (0.04 + i * 0.5)) < 1e-10);
    assert.equal(events[i].beat, i % 4);
  }
});
test("late scheduler skips missed beats without a burst", () => {
  const plan = planBeats({ time: 1, beat: 1 }, 3.1, 0.5, 120, "4/4");
  assert.deepEqual(plan.events, [{ time: 3.5, beat: 2 }]);
  assert.deepEqual(plan.next, { time: 4, beat: 3 });
});
test("tempo change updates intervals from next unscheduled beat", () => {
  const plan = planBeats({ time: 1, beat: 2 }, 1, 1, 240, "4/4");
  assert.deepEqual(plan.events, [
    { time: 1, beat: 2 },
    { time: 1.25, beat: 3 },
    { time: 1.5, beat: 0 },
    { time: 1.75, beat: 1 },
  ]);
});
test("signature change starts a fresh measure and uses new grouping", () => {
  const plan = planBeats({ time: 1, beat: 0 }, 1, 1, 120, "6/8");
  assert.deepEqual(
    plan.events.slice(0, 6).map((event) => event.beat),
    [0, 1, 2, 3, 4, 5],
  );
  assert.ok(Math.abs(plan.events[3].time - 1.5) < 1e-10);
});
