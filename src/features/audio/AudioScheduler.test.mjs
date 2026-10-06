import test from "node:test";
import assert from "node:assert/strict";
import { AudioScheduler, AUDIO_LOOKAHEAD } from "./AudioScheduler.ts";

test("shared scheduler uses the audio clock, has one wakeup chain and clears all work on stop/error", (t) => {
  const timers = new Map();
  const frames = new Map();
  let id = 0;
  t.mock.method(globalThis, "setTimeout", (callback) => { timers.set(++id, callback); return id; });
  t.mock.method(globalThis, "clearTimeout", (key) => timers.delete(key));
  globalThis.requestAnimationFrame = (callback) => { frames.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = (key) => frames.delete(key);
  t.after(() => { delete globalThis.requestAnimationFrame; delete globalThis.cancelAnimationFrame; });
  const clock = { currentTime: 12, baseLatency: 0 };
  const calls = [];
  const visuals = [];
  let failed = 0;
  let shouldThrow = false;
  const scheduler = new AudioScheduler(clock, (now, horizon) => {
    if (shouldThrow) throw new Error("provider failure");
    calls.push([now, horizon]);
    return [{ time: now + 0.05, step: 1 }, { time: now + 0.09, step: 2 }];
  }, (event) => visuals.push(event), () => failed++);
  scheduler.start(); scheduler.start();
  assert.equal(timers.size, 1); assert.equal(frames.size, 1);
  assert.deepEqual(calls, [[12, AUDIO_LOOKAHEAD], [12, AUDIO_LOOKAHEAD]]);
  assert.equal(visuals.length, 0);
  clock.currentTime = 12.1;
  const [frameId, frame] = [...frames][0]; frames.delete(frameId); frame();
  assert.equal(visuals.length, 1); assert.equal(visuals[0].step, 2);
  scheduler.stop();
  assert.equal(timers.size, 0); assert.equal(frames.size, 0);
  frame(); assert.equal(frames.size, 0);
  shouldThrow = true; scheduler.start();
  assert.equal(failed, 1); assert.equal(timers.size, 0); assert.equal(frames.size, 0);
});
