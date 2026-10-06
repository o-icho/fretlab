import test from "node:test";
import assert from "node:assert/strict";
import { hitsAt, stepsPerBar, stepSeconds, validatePattern, startDrumCursor, queuePattern, planDrumSteps } from "./drums.ts";
import { DRUM_PATTERNS } from "../../features/drums/presets.ts";
const find = (id) => DRUM_PATTERNS.find((pattern) => pattern.id === id);
const rock = find("basic-rock");
const waltz = find("pop-waltz");
const six = find("slow-blues");
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} ≠ ${b}`);

test("preset catalogue: 11 distinct, validated forms across five styles", () => {
  assert.equal(DRUM_PATTERNS.length, 11);
  assert.equal(new Set(DRUM_PATTERNS.map((p) => p.id)).size, 11);
  assert.equal(new Set(DRUM_PATTERNS.map((p) => p.style)).size, 5);
  assert.equal(new Set(DRUM_PATTERNS.map((p) => JSON.stringify(p.tracks))).size, 11);
  DRUM_PATTERNS.forEach(validatePattern);
});
for (const [pattern, count, duration, interval] of [[rock, 16, 2, 0.125], [waltz, 6, 1.5, 0.25], [six, 6, 1, 1 / 6]]) {
  test(`${pattern.name}: beat unit, pulse and subdivision produce correct times at 120 BPM`, () => {
    assert.equal(stepsPerBar(pattern), count);
    near(stepSeconds(pattern, 120), interval);
    const plan = planDrumSteps(startDrumCursor(pattern, 0, 0), 0, duration - 1e-8, 120);
    assert.equal(plan.events.length, count);
    plan.events.forEach((event, i) => near(event.time, i * interval));
    near(plan.next.time, duration);
    assert.equal(plan.next.step, 0);
  });
}
test("rock anchors and velocities survive conversion into scheduled events", () => {
  const events = planDrumSteps(startDrumCursor(rock, 1, 0), 1, 1.999, 120).events;
  assert.deepEqual(events.filter((e) => e.hits.some((h) => h.instrument === "kick")).map((e) => e.time), [1, 2]);
  assert.deepEqual(events.filter((e) => e.hits.some((h) => h.instrument === "snare")).map((e) => e.time), [1.5, 2.5]);
  assert.equal(events[2].hits.find((h) => h.instrument === "closed-hat").velocity, 0.55);
  assert.deepEqual(hitsAt(find("half-time-rock"), 0, 8).find((h) => h.instrument === "snare"), { instrument: "snare", velocity: 0.8 });
  assert.equal(hitsAt(find("half-time-rock"), 0, 4).some((h) => h.instrument === "snare"), false);
});
test("shuffle is genuine triplet spacing with a 2:1 long/short pair", () => {
  const pattern = find("shuffle-blues");
  const hats = planDrumSteps(startDrumCursor(pattern, 0, 0), 0, 0.51, 120).events.filter((e) => e.hits.some((h) => h.instrument === "closed-hat"));
  near(hats[0].time, 0); near(hats[1].time, 1 / 3); near(hats[2].time, 0.5);
});
test("BPM changes adjust upcoming intervals, keep phase and respect player limits", () => {
  const first = planDrumSteps(startDrumCursor(rock, 0, 0), 0, 0.2, 120);
  const next = planDrumSteps(first.next, 0.2, 0.5, 60);
  assert.equal(next.events[0].step, 2); near(next.events[0].time, 0.25);
  near(next.events[1].time, 0.5);
  near(stepSeconds(rock, 0), 0.375); near(stepSeconds(rock, 999), 0.0625);
});
test("queued meter/pattern change applies at the next bar, not in the current beat", () => {
  const first = planDrumSteps(startDrumCursor(rock, 0, 0), 0, 0.4, 120);
  const queued = queuePattern(first.next, six);
  const plan = planDrumSteps(queued, 0.4, 2.1, 120);
  assert.ok(plan.events.filter((e) => e.time < 2).every((e) => e.pattern.id === rock.id));
  const start = plan.events.find((e) => e.pattern.id === six.id);
  near(start.time, 2); assert.equal(start.step, 0); assert.equal(start.bar, 0);
  near(plan.events.find((e) => e.pattern.id === six.id && e.step === 1).time, 2 + 1 / 6);
  assert.equal(plan.next.pending, null);
});
test("a pending change is replaceable/cancellable; an unscheduled bar boundary is available", () => {
  const cursor = planDrumSteps(startDrumCursor(rock, 0, 0), 0, 0.2, 120).next;
  const queued = queuePattern(cursor, six);
  assert.equal(queuePattern(queued, waltz).pending.id, waltz.id);
  assert.equal(queuePattern(queued, rock).pending, null);
  const boundary = planDrumSteps(startDrumCursor(rock, 0, 0), 0, 1.999, 120).next;
  const changed = queuePattern(boundary, six);
  assert.equal(changed.pattern.id, six.id); near(changed.time, 2);
});
for (const [pattern, pulses, duration] of [[rock, 4, 2], [waltz, 3, 1.5], [six, 2, 1]]) {
  test(`${pattern.name}: one/two-bar count-in uses the actual pulse and no drum hits`, () => {
    for (const bars of [1, 2]) {
      const events = planDrumSteps(startDrumCursor(pattern, 0, bars), 0, duration * bars + 0.05, 120).events;
      const count = events.filter((e) => e.countIn > 0);
      assert.equal(count.filter((e) => e.click).length, pulses * bars);
      assert.equal(count.filter((e) => e.click === "accent").length, bars);
      assert.ok(count.every((e) => !e.hits.length));
      const first = events.find((e) => e.countIn === 0);
      near(first.time, duration * bars); assert.equal(first.step, 0); assert.ok(first.hits.length);
    }
  });
}
test("multiple bars retain event positions and loop at the full pattern boundary", () => {
  const pattern = { ...rock, bars: 2, tracks: [{ instrument: "snare", events: [{ position: { bar: 1, beat: 2, part: 1 }, velocity: 0.25 }] }] };
  validatePattern(pattern);
  const plan = planDrumSteps(startDrumCursor(pattern, 0, 0), 0, 4.01, 120);
  const hits = plan.events.filter((e) => e.hits.length);
  assert.equal(hits.length, 1); near(hits[0].time, 3.125); assert.equal(hits[0].bar, 1);
  assert.equal(plan.events.at(-1).bar, 0); assert.equal(plan.events.at(-1).step, 0);
});
test("late scheduler skips old hits without a burst, including queued changes/count-in", () => {
  let cursor = startDrumCursor(rock, 0, 2);
  cursor = planDrumSteps(cursor, 0, 0.2, 120).next;
  cursor = queuePattern(cursor, six);
  const plan = planDrumSteps(cursor, 10000, 0.1, 120);
  assert.ok(plan.events.length <= 2);
  assert.ok(plan.events.every((e) => e.time >= 10000 && e.time < 10000.1 && e.pattern.id === six.id && e.countIn === 0));
});
test("restart resets step, bar, pending pattern and count-in independently of old cursor", () => {
  const old = queuePattern(planDrumSteps(startDrumCursor(rock, 0, 0), 0, 0.8, 120).next, six);
  const reset = startDrumCursor(rock, 20, 1);
  assert.equal(reset.step, 0); assert.equal(reset.bar, 0); assert.equal(reset.pending, null); assert.equal(reset.countIn, 1);
  assert.ok(old.step > 0); assert.equal(old.pending.id, six.id);
});
test("invalid meter, events, velocity and duplicate positions are rejected", () => {
  for (const patch of [{ bars: 0 }, { subdivision: 0 }, { meter: { beats: 6, beatUnit: 8, pulseBeats: 1 } }]) assert.throws(() => validatePattern({ ...rock, ...patch }), RangeError);
  for (const velocity of [0, -1, 1.1, NaN]) assert.throws(() => validatePattern({ ...rock, tracks: [{ instrument: "kick", events: [{ position: { bar: 0, beat: 0, part: 0 }, velocity }] }] }), RangeError);
  const hit = { position: { bar: 0, beat: 4, part: 0 }, velocity: 1 };
  assert.throws(() => validatePattern({ ...rock, tracks: [{ instrument: "kick", events: [hit] }] }), RangeError);
  assert.throws(() => validatePattern({ ...rock, tracks: [rock.tracks[0], rock.tracks[0]] }), RangeError);
});
