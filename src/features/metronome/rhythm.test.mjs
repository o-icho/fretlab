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

test("BPM validation: finite integers clamped to 30–300", () => {
  for (const [value, expected] of [
    [0, 30],
    [-12, 30],
    [29, 30],
    [30, 30],
    [120, 120],
    [300, 300],
    [301, 300],
    [999, 300],
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
    ["29", 30],
    ["999", 300],
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
  assert.equal(beatInterval(30, "4/4"), 2);
  assert.equal(beatInterval(300, "4/4"), 0.2);
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

import {
  SIGNATURES,
  DEFAULT_SETTINGS,
  defaultBeatSounds,
  nextBeatSound,
  cycleBeatSounds,
  updateMetronomeSettings,
  signatureDescription,
} from "./rhythm.ts";

const meterExamples = [
  // Signature, displayed steps, step duration and bar duration at 120 BPM.
  ["2/4", 2, 0.5, 1],
  ["3/4", 3, 0.5, 1.5],
  ["4/4", 4, 0.5, 2],
  ["7/4", 7, 0.5, 3.5],
  ["5/8", 5, 0.5, 2.5],
  ["6/8", 6, 1 / 6, 1],
  ["7/8", 7, 0.5, 3.5],
  ["9/8", 9, 1 / 6, 1.5],
  ["12/8", 12, 1 / 6, 2],
];

test("all previous and requested signatures are available without duplicates", () => {
  assert.deepEqual(new Set(SIGNATURES), new Set(meterExamples.map(([signature]) => signature)));
  assert.equal(SIGNATURES.length, 9);
  assert.equal(isTimeSignature("12/8"), true);
  assert.equal(isTimeSignature("12/4"), false);
});

for (const [signature, steps, interval, barDuration] of meterExamples) {
  test(`${signature} has its full numerator, wraps correctly and keeps the stated BPM unit`, () => {
    assert.equal(beatsPerBar(signature), steps);
    assert.equal(beatInterval(120, signature), interval);
    assert.ok(Math.abs(steps * beatInterval(120, signature) - barDuration) < 1e-12);
    const plan = planBeats({ time: 1, beat: 0 }, 1, barDuration + interval / 2, 120, signature);
    assert.equal(plan.events.length, steps + 1);
    assert.deepEqual(plan.events.map(({ beat }) => beat), [...Array.from({ length: steps }, (_, index) => index), 0]);
    assert.ok(Math.abs(plan.events[steps].time - (1 + barDuration)) < 1e-12);
    assert.equal(nextBeat(steps - 1, signature), 0);
  });
}

test("BPM description explicitly distinguishes eighth, quarter and dotted-quarter units", () => {
  for (const signature of ["5/8", "7/8"]) {
    assert.match(signatureDescription(signature), /À la croche/);
    assert.doesNotMatch(signatureDescription(signature), /pointée/);
  }
  for (const [signature, pulses] of [["6/8", 2], ["9/8", 3], ["12/8", 4]]) {
    assert.match(signatureDescription(signature), /À la noire pointée/);
    assert.ok(signatureDescription(signature).includes(`${pulses} pulsations`));
  }
  assert.match(signatureDescription("7/4"), /À la noire ·/);
});

test("every meter starts with one accent followed only by ordinary clicks", () => {
  for (const [signature, steps] of meterExamples) {
    assert.deepEqual(defaultBeatSounds(signature), ["accent", ...Array(steps - 1).fill("normal")]);
  }
  assert.deepEqual(DEFAULT_SETTINGS.beatSounds, ["accent", "normal", "normal", "normal"]);
  const editable = defaultBeatSounds("4/4");
  editable[0] = "silent";
  assert.equal(defaultBeatSounds("4/4")[0], "accent");
  assert.equal(DEFAULT_SETTINGS.beatSounds[0], "accent");
});

test("a beat cycles accent to normal to silent to accent without changing other beats", () => {
  assert.equal(nextBeatSound("accent"), "normal");
  assert.equal(nextBeatSound("normal"), "silent");
  assert.equal(nextBeatSound("silent"), "accent");
  const original = Object.freeze(["accent", "normal", "silent", "normal"]);
  const first = cycleBeatSounds(original, 0);
  const second = cycleBeatSounds(first, 0);
  const third = cycleBeatSounds(second, 0);
  assert.deepEqual(first, ["normal", "normal", "silent", "normal"]);
  assert.deepEqual(second, ["silent", "normal", "silent", "normal"]);
  assert.deepEqual(third, original);
  assert.deepEqual(original, ["accent", "normal", "silent", "normal"]);
  assert.notEqual(third, original);
  assert.deepEqual(cycleBeatSounds(original, 1), ["accent", "silent", "silent", "normal"]);
});

test("invalid or stale beat positions leave the pattern untouched", () => {
  const sounds = Object.freeze(["accent", "normal", "silent"]);
  for (const index of [-1, 3, 12, 0.5, NaN, Infinity])
    assert.deepEqual(cycleBeatSounds(sounds, index), sounds);
});

test("signature changes rebuild defaults at the new length and retain tempo and volume", () => {
  const previous = Object.freeze({
    bpm: 93,
    signature: "4/4",
    volume: 0.37,
    beatSounds: Object.freeze(["silent", "accent", "silent", "normal"]),
  });
  const longer = updateMetronomeSettings(previous, { signature: "12/8" });
  assert.equal(longer.bpm, 93);
  assert.equal(longer.volume, 0.37);
  assert.equal(longer.signature, "12/8");
  assert.deepEqual(longer.beatSounds, ["accent", ...Array(11).fill("normal")]);
  const shorter = updateMetronomeSettings(longer, { signature: "2/4" });
  assert.deepEqual(shorter.beatSounds, ["accent", "normal"]);
  assert.equal(shorter.bpm, 93);
  assert.equal(shorter.volume, 0.37);
  assert.deepEqual(previous.beatSounds, ["silent", "accent", "silent", "normal"]);
});

test("tempo, volume and same-signature updates preserve custom beat sounds", () => {
  const sounds = Object.freeze(["silent", "accent", "normal", "silent"]);
  const current = Object.freeze({ ...DEFAULT_SETTINGS, beatSounds: sounds });
  for (const patch of [{ bpm: 180 }, { volume: 0 }, { signature: "4/4" }, {}]) {
    const updated = updateMetronomeSettings(current, patch);
    assert.deepEqual(updated.beatSounds, sounds);
    assert.notEqual(updated.beatSounds, sounds);
  }
  assert.equal(updateMetronomeSettings(current, { bpm: 301 }).bpm, 300);
  assert.equal(updateMetronomeSettings(current, { volume: -1 }).volume, 0);
  assert.equal(updateMetronomeSettings(current, { volume: 2 }).volume, 1);
  assert.equal(updateMetronomeSettings(current, { volume: NaN }).volume, current.volume);
});

for (const [signature, interval, count, expectedEvents] of [
  ["12/8", 1 / 6, 12, 61],
  ["7/4", 0.5, 7, 21],
]) {
  test(`${signature} scheduling retains every step without timer drift or duplicates`, () => {
    let cursor = { time: 0.04, beat: 0 };
    const events = [];
    for (let tick = 0; tick < 400; tick++) {
      const plan = planBeats(cursor, tick * 0.025, 0.1, 120, signature);
      events.push(...plan.events);
      cursor = plan.next;
    }
    assert.equal(events.length, expectedEvents);
    for (let index = 0; index < events.length; index++) {
      assert.equal(events[index].beat, index % count);
      assert.ok(Math.abs(events[index].time - (0.04 + index * interval)) < 1e-10);
    }
  });
}

test("late wakeups skip elapsed steps in 12/8 and 7/4 without replaying them", () => {
  const compound = planBeats({ time: 1, beat: 10 }, 3.1, 0.2, 120, "12/8");
  assert.equal(compound.events.length, 1);
  assert.equal(compound.events[0].beat, 11);
  assert.ok(Math.abs(compound.events[0].time - 19 / 6) < 1e-12);
  assert.equal(compound.next.beat, 0);
  const simple = planBeats({ time: 1, beat: 5 }, 3.1, 0.5, 120, "7/4");
  assert.deepEqual(simple.events, [{ time: 3.5, beat: 3 }]);
  assert.deepEqual(simple.next, { time: 4, beat: 4 });
});
