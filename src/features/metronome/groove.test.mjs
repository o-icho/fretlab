import assert from "node:assert/strict";
import test from "node:test";
import { planDrumSteps, startDrumCursor, stepsPerBar } from "../../domain/rhythm/drums.ts";
import { METRONOME_BPM_RANGE } from "../../domain/rhythm/tempo.ts";
import { metronomeGroove } from "./groove.ts";
import { SIGNATURES, beatInterval, beatsPerBar } from "./rhythm.ts";

// Written eighth notes and actual BPM pulses per bar.
const meters = {
  "2/4": [4, 2], "3/4": [6, 3], "4/4": [8, 4], "7/4": [14, 7],
  "5/8": [5, 5], "6/8": [6, 2], "7/8": [7, 7], "9/8": [9, 3], "12/8": [12, 4],
};
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} ≠ ${expected}`);

for (const signature of SIGNATURES) {
  test(`${signature} groove loops in sync with the metronome across its full tempo range`, () => {
    const [eighths, pulses] = meters[signature];
    const pattern = metronomeGroove(signature);
    assert.equal(stepsPerBar(pattern), eighths);
    for (const bpm of [30, 120, 300]) {
      const barDuration = pulses * 60 / bpm;
      near(barDuration, beatInterval(bpm, signature) * beatsPerBar(signature));
      const cursor = startDrumCursor(pattern, 0, 0);
      const { events, next } = planDrumSteps(cursor, 0, 2 * barDuration - 1e-8, bpm, METRONOME_BPM_RANGE);
      assert.equal(events.length, 2 * eighths);
      assert.equal(next.step, 0);
      near(next.time, 2 * barDuration);
      const firstBar = events.slice(0, eighths);
      assert.ok(firstBar[0].hits.some(hit => hit.instrument === "kick"));
      assert.ok(firstBar.some(step => step.hits.some(hit => hit.instrument === "snare")));
      for (const step of firstBar) {
        const repeat = events[eighths + step.step];
        near(step.time, step.step * barDuration / eighths);
        near(repeat.time - step.time, barDuration);
        assert.deepEqual(repeat.hits, step.hits);
      }
    }
  });
}

test("the hats mark the chosen asymmetric groupings", () => {
  for (const [signature, downbeats] of [["5/8", [0, 3]], ["7/8", [0, 2, 4]], ["7/4", [0, 8]]]) {
    const pattern = metronomeGroove(signature);
    const hats = pattern.tracks.find(track => track.instrument === "closed-hat").events;
    const accent = Math.max(...hats.map(hit => hit.velocity));
    const positions = hats.filter(hit => hit.velocity === accent)
      .map(({ position }) => position.beat * pattern.subdivision + position.part);
    assert.deepEqual(positions, downbeats);
  }
});
