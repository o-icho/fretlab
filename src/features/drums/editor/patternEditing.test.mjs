import test from "node:test";
import assert from "node:assert/strict";
import { DRUM_PATTERNS } from "../presets.ts";
import { hitsAt, planDrumSteps, queuePattern, startDrumCursor } from "../../../domain/rhythm/drums.ts";
import { clearUserPattern, copyUserPattern, cycleStep, isUserPattern, renameUserPattern, resetUserPattern, toggleTrackMute } from "./patternEditing.ts";

const preset = DRUM_PATTERNS[0];
const created = "2026-10-05T10:00:00.000Z";
const edited = "2026-10-05T11:00:00.000Z";
const copy = () => copyUserPattern(preset, "user-test", created);

test("first user copy preserves the exact player model with stable identity and provenance", () => {
  const user = copy();
  assert.equal(user.name, "Basic Rock - copie");
  assert.equal(user.id, "user-test");
  assert.equal(user.basedOnPresetId, preset.id);
  assert.equal(user.createdAt, created); assert.equal(user.updatedAt, created);
  assert.deepEqual(user.tracks, preset.tracks); assert.notEqual(user.tracks, preset.tracks);
  assert.equal(isUserPattern(preset), false); assert.equal(isUserPattern(user), true);
});
test("presets are deeply immutable and every editing operation leaves them intact", () => {
  const before = JSON.stringify(preset);
  assert.throws(() => { preset.tracks[0].events[0].velocity = 1; }, TypeError);
  assert.throws(() => { preset.name = "changed"; }, TypeError);
  let user = cycleStep(copy(), "kick", 0, 1, edited);
  user = toggleTrackMute(user, "snare", edited);
  user = clearUserPattern(user, edited);
  user = renameUserPattern(user, "Mon rythme", edited);
  resetUserPattern(user, preset, edited);
  assert.equal(JSON.stringify(preset), before);
});
test("OFF → NORMAL 0.75 → ACCENT 1 → OFF affects actual scheduled velocities", () => {
  const initial = copy();
  const normal = cycleStep(initial, "kick", 0, 1, edited);
  const accent = cycleStep(normal, "kick", 0, 1, edited);
  const off = cycleStep(accent, "kick", 0, 1, edited);
  assert.equal(hitsAt(initial, 0, 1).length, 0);
  assert.equal(hitsAt(normal, 0, 1)[0].velocity, 0.75);
  assert.equal(hitsAt(accent, 0, 1)[0].velocity, 1);
  assert.equal(hitsAt(off, 0, 1).length, 0);
  const plan = planDrumSteps(startDrumCursor(accent, 0, 0), 0, 0.2, 120);
  assert.equal(plan.events[1].hits[0].velocity, 1);
  assert.equal(accent.id, initial.id); assert.equal(accent.createdAt, created); assert.equal(accent.updatedAt, edited);
});
test("editing a missing instrument adds a track; other preset dynamics remain untouched", () => {
  const initial = copy();
  const next = cycleStep(initial, "crash", 0, 0, edited);
  assert.equal(next.tracks.find((track) => track.instrument === "crash").events[0].velocity, 0.75);
  assert.deepEqual(next.tracks.slice(0, initial.tracks.length), initial.tracks);
  assert.throws(() => cycleStep(initial, "kick", 2, 0, edited), RangeError);
  assert.throws(() => cycleStep(initial, "kick", 0, 16, edited), RangeError);
});
test("Mute changes playback while preserving events, and unmute restores them", () => {
  const initial = copy();
  const muted = toggleTrackMute(initial, "kick", edited);
  assert.equal(hitsAt(muted, 0, 0).some((hit) => hit.instrument === "kick"), false);
  assert.equal(hitsAt(muted, 0, 0).some((hit) => hit.instrument === "closed-hat"), true);
  assert.deepEqual(muted.tracks[0].events, initial.tracks[0].events);
  const restored = toggleTrackMute(muted, "kick", edited);
  assert.deepEqual(hitsAt(restored, 0, 0), hitsAt(initial, 0, 0));
});
test("duplication keeps content and provenance but creates new dates and identity", () => {
  const user = toggleTrackMute(cycleStep(copy(), "kick", 0, 1, edited), "snare", edited);
  const duplicate = copyUserPattern(user, "user-second", edited);
  assert.equal(duplicate.id, "user-second"); assert.equal(duplicate.createdAt, edited);
  assert.equal(duplicate.basedOnPresetId, preset.id);
  assert.deepEqual(duplicate.tracks, user.tracks);
  assert.throws(() => copyUserPattern(user, user.id, edited), RangeError);
});
test("clear/rename/reset preserve user identity; reset restores the source notes and mutes", () => {
  const user = renameUserPattern(toggleTrackMute(copy(), "kick", edited), "  Mon groove  ", edited);
  const empty = clearUserPattern(user, edited);
  assert.ok(empty.tracks.every((track) => !track.events.length));
  const reset = resetUserPattern(empty, preset, edited);
  assert.equal(reset.id, user.id); assert.equal(reset.name, "Mon groove"); assert.equal(reset.createdAt, created);
  assert.deepEqual(reset.tracks, preset.tracks);
  assert.throws(() => renameUserPattern(user, "   ", edited), RangeError);
  assert.throws(() => resetUserPattern(user, DRUM_PATTERNS[1], edited), RangeError);
});
test("same-id edited snapshots replace each other at the next bar, not immediately", () => {
  const user = copy();
  const normal = cycleStep(user, "kick", 0, 1, edited);
  const accent = cycleStep(normal, "kick", 0, 1, edited);
  const cursor = planDrumSteps(startDrumCursor(user, 0, 0), 0, 0.2, 120).next;
  const queued = queuePattern(queuePattern(cursor, normal), accent);
  const plan = planDrumSteps(queued, 0.2, 2.1, 120);
  assert.ok(plan.events.filter((event) => event.time < 2).every((event) => event.pattern === user));
  assert.equal(plan.events.find((event) => event.time === 2).pattern, accent);
  assert.equal(plan.events.find((event) => event.time === 2.125).hits[0].velocity, 1);
});
