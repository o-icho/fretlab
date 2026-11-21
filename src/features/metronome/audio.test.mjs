import test from "node:test";
import assert from "node:assert/strict";
import { MetronomeAudio } from "./audio.ts";
import { DEFAULT_SETTINGS, SIGNATURES, defaultBeatSounds, beatInterval, beatsPerBar } from "./rhythm.ts";

// Fake only the Web Audio boundary and wakeup callbacks; the engine, scheduler,
// clock planning, voice cleanup and visual queue are exercised unchanged.
function setup(t) {
  let engine;
  t.after(() => engine?.dispose());
  const timers = new Map(), frames = new Map(), contexts = [], visuals = [];
  let id = 0, interruptions = 0;
  function global(name, value) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name]);
  }
  t.mock.method(globalThis, "setTimeout", (callback) => { timers.set(++id, callback); return id; });
  t.mock.method(globalThis, "clearTimeout", (key) => timers.delete(key));
  global("requestAnimationFrame", (callback) => { frames.set(++id, callback); return id; });
  global("cancelAnimationFrame", (key) => frames.delete(key));
  const parameter = () => ({
    values: [],
    setValueAtTime(value, time) { this.values.push({ value, time }); },
    linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {},
  });
  global("AudioContext", class {
    currentTime = 0;
    baseLatency = 0;
    state = "running";
    destination = {};
    oscillators = [];
    closed = false;
    constructor() { contexts.push(this); }
    async resume() { this.state = "running"; }
    async close() { this.closed = true; this.state = "closed"; }
    createGain() { return { gain: parameter(), connect() {}, disconnect() {} }; }
    createOscillator() {
      const oscillator = {
        frequency: parameter(), starts: [], stops: [], disconnected: false,
        start(time) { this.starts.push(time); },
        stop(time) { this.stops.push(time); },
        connect() {}, disconnect() { this.disconnected = true; },
      };
      this.oscillators.push(oscillator);
      return oscillator;
    }
  });
  engine = new MetronomeAudio((beat) => visuals.push(beat), () => interruptions++);
  function advance(time) {
    contexts[0].currentTime = time;
    for (const queue of [timers, frames]) {
      const entry = queue.entries().next().value;
      if (entry) { queue.delete(entry[0]); entry[1](); }
    }
  }
  return { engine, contexts, timers, frames, visuals, advance, interrupted: () => interruptions };
}

for (const signature of SIGNATURES) {
  test(`audio ${signature}: sound choices, silent visuals and measure wrap`, async (t) => {
    const s = setup(t);
    const count = beatsPerBar(signature);
    const sounds = defaultBeatSounds(signature).map((_, i) => i % 3 === 0 ? "silent" : i % 3 === 1 ? "accent" : "normal");
    s.engine.configure({ ...DEFAULT_SETTINGS, signature, beatSounds: sounds });
    await s.engine.start();
    const interval = beatInterval(DEFAULT_SETTINGS.bpm, signature);
    for (let i = 0; i <= count; i++) {
      const time = 0.04 + i * interval;
      s.advance(time - 0.02);
      s.advance(time + 1e-8);
    }
    assert.deepEqual(s.visuals, [...Array(count).keys(), 0]);
    const played = s.contexts[0].oscillators;
    const expected = sounds.flatMap((sound, beat) => sound === "silent" ? [] : [{ beat, frequency: sound === "accent" ? 1400 : 850 }]);
    assert.equal(played.length, expected.length);
    played.forEach((oscillator, index) => {
      assert.equal(oscillator.frequency.values[0].value, expected[index].frequency);
      assert.ok(Math.abs(oscillator.starts[0] - (0.04 + expected[index].beat * interval)) < 1e-8);
    });
  });
}

test("sound edits replace a queued click, including silence, without resetting its time or visual", async (t) => {
  const s = setup(t);
  await s.engine.start();
  const context = s.contexts[0];
  context.currentTime = 0.01;
  const settings = { ...DEFAULT_SETTINGS, beatSounds: ["normal", "normal", "normal", "normal"] };
  s.engine.configure(settings);
  assert.ok(context.oscillators[0].disconnected);
  assert.equal(context.oscillators[1].frequency.values[0].value, 850);
  assert.equal(context.oscillators[1].starts[0], 0.04);
  settings.beatSounds[0] = "silent";
  s.engine.configure(settings);
  assert.ok(context.oscillators[1].disconnected);
  assert.equal(context.oscillators.length, 2);
  settings.beatSounds[0] = "accent";
  s.engine.configure(settings);
  assert.equal(context.oscillators[2].frequency.values[0].value, 1400);
  assert.equal(context.oscillators[2].starts[0], 0.04);
  s.advance(0.04);
  assert.deepEqual(s.visuals, [0]);
  s.advance(0.52); s.advance(0.54);
  assert.deepEqual(s.visuals, [0, 1]);
  assert.equal(context.oscillators.at(-1).starts[0], 0.54);
});

test("a fully silent measure has no oscillators but keeps the clock and clears work on stop", async (t) => {
  const s = setup(t);
  s.engine.configure({ ...DEFAULT_SETTINGS, beatSounds: ["silent", "silent", "silent", "silent"] });
  await s.engine.start();
  for (let i = 0; i < 4; i++) { s.advance(0.02 + i * 0.5); s.advance(0.04 + i * 0.5); }
  assert.deepEqual(s.visuals, [0, 1, 2, 3]);
  assert.equal(s.contexts[0].oscillators.length, 0);
  s.engine.stop();
  assert.equal(s.frames.size, 0); assert.equal(s.timers.size, 0);
  await s.engine.start();
  s.advance(s.contexts[0].currentTime + 0.04);
  assert.equal(s.visuals.at(-1), 0);
});

test("changing signature cancels pending old clicks and visuals; disposal closes audio", async (t) => {
  const s = setup(t);
  await s.engine.start();
  const context = s.contexts[0];
  context.currentTime = 0.01;
  s.engine.configure({ ...DEFAULT_SETTINGS, signature: "12/8", beatSounds: defaultBeatSounds("12/8") });
  assert.ok(context.oscillators[0].disconnected);
  assert.deepEqual(s.visuals, [-1]);
  s.advance(0.04);
  assert.deepEqual(s.visuals, [-1]);
  s.advance(0.05);
  assert.deepEqual(s.visuals, [-1, 0]);
  context.state = "suspended"; context.onstatechange();
  assert.equal(s.interrupted(), 1);
  assert.equal(s.frames.size, 0); assert.equal(s.timers.size, 0);
  s.engine.dispose();
  assert.equal(context.closed, true);
  assert.ok(context.oscillators.every((voice) => voice.disconnected));
});
