import test from "node:test";
import assert from "node:assert/strict";
import { createGroovePlayer } from "./GroovePlayer.ts";
import { AUDIO_START_DELAY } from "../audio/AudioScheduler.ts";
import { BasicDrumKit } from "../drums/audio/BasicDrumKit.ts";

function setup(t, bpm, fetchRecording = (path) => Promise.resolve(new Response(path))) {
  const requests = [], sources = [], gains = [], contexts = [], timers = new Map();
  let nextId = 0, interruptions = 0;
  t.mock.method(globalThis, "fetch", (path, { signal }) => {
    requests.push({ path, signal });
    return fetchRecording(path, signal);
  });
  t.mock.method(globalThis, "setTimeout", (fn) => { timers.set(++nextId, fn); return nextId; });
  t.mock.method(globalThis, "clearTimeout", (id) => timers.delete(id));
  globalThis.AudioContext = class {
    currentTime = 0;
    state = "suspended";
    destination = {};
    sampleRate = 32000;
    constructor() { contexts.push(this); }
    async resume() { this.state = "running"; }
    async close() { this.state = "closed"; }
    async decodeAudioData(data) { return { path: new TextDecoder().decode(data) }; }
    createBuffer(_channels, length) { return { getChannelData: () => new Float32Array(length) }; }
    createGain() {
      const node = {
        gain: { setValueAtTime(value) { this.value = value; }, setTargetAtTime() {} },
        connect() {}, disconnect() {},
      };
      gains.push(node);
      return node;
    }
    createBufferSource() {
      const node = {
        playbackRate: {}, stops: [],
        start(time) { this.startTime = time; }, stop(time) { this.stops.push(time); },
        connect() {}, disconnect() { this.disconnected = true; },
      };
      sources.push(node);
      return node;
    }
  };
  const engine = createGroovePlayer({ bpm, volume: 0.76, signature: "6/8" }, () => interruptions++);
  t.after(() => { engine.dispose(); delete globalThis.AudioContext; });
  function advance(time) {
    contexts[0].currentTime = time;
    const [id, tick] = [...timers][0];
    timers.delete(id);
    tick();
  }
  return { engine, requests, sources, gains, contexts, timers, advance, interruptions: () => interruptions };
}

for (const bpm of [30, 300]) {
  test(`sampled groove loops and chokes the open hat at the next downbeat at ${bpm} BPM`, async (t) => {
    const s = setup(t, bpm);
    assert.equal(s.contexts.length, 0);
    assert.equal(await s.engine.start(), true);
    assert.deepEqual(s.requests.map(r => r.path), ["kick", "snare", "closed-hat", "open-hat"].map(name => `/audio/metronome-kit/${name}.wav`));
    assert.equal(s.gains[0].gain.value, 0.76);
    const eighth = 60 / bpm / 3;
    for (let n = 1; n <= 6; n++) s.advance(AUDIO_START_DELAY + n * eighth - 0.02);
    const kicks = s.sources.filter(s => s.buffer.path.endsWith("/kick.wav"));
    assert.equal(kicks.length, 2);
    assert.equal(kicks[0].startTime, AUDIO_START_DELAY);
    const nextMeasure = AUDIO_START_DELAY + 6 * eighth;
    assert.ok(Math.abs(kicks[1].startTime - nextMeasure) < 1e-8);
    const openHat = s.sources.find(s => s.buffer.path.endsWith("/open-hat.wav"));
    assert.ok(Math.abs(openHat.stops[0] - nextMeasure - 0.025) < 1e-8);
    const context = s.contexts[0];
    context.state = "suspended";
    context.onstatechange();
    assert.equal(s.interruptions(), 1);
    assert.equal(s.timers.size, 0);
    assert.ok(s.sources.every(s => s.disconnected));
    s.engine.dispose();
    assert.equal(context.state, "closed");
  });
}

test("closing the groove while recordings load aborts requests and schedules no voices", async (t) => {
  const loading = Promise.withResolvers();
  const s = setup(t, 120, () => loading.promise);
  const started = s.engine.start();
  await Promise.resolve();
  assert.equal(s.requests.length, 4);
  s.engine.dispose();
  assert.ok(s.requests.every(r => r.signal.aborted));
  loading.reject(new Error("Aborted"));
  assert.equal(await started, false);
  assert.equal(s.sources.length, 0);
  assert.equal(s.timers.size, 0);
  assert.equal(s.contexts[0].state, "closed");
});

test("the groove starts with local synthesis if a recording cannot be loaded", async (t) => {
  const s = setup(t, 120, (path) => Promise.resolve(new Response("", { status: path.endsWith("/snare.wav") ? 404 : 200 })));
  const synth = t.mock.method(BasicDrumKit.prototype, "trigger", () => {});
  assert.equal(await s.engine.start(), true);
  assert.deepEqual(synth.mock.calls.map(c => c.arguments[0]), ["kick", "closed-hat"]);
  assert.equal(s.sources.length, 0);
  s.engine.stop();
  assert.equal(s.timers.size, 0);
});
