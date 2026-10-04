import test from "node:test";
import assert from "node:assert/strict";
import { MicrophoneTuner } from "./MicrophoneTuner.ts";

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

// Only the browser boundary is faked; session/generation/cleanup run unchanged.
function setup(t) {
  const requests = [], contexts = [], frames = new Map(), logs = [];
  let engine;
  t.after(() => engine?.stop("component-unmount"));
  let frameId = 0;
  function global(name, value) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value, writable: true });
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name]);
  }
  global("window", { location: { search: "?tunerDebug=1" } });
  t.mock.method(console, "info", (...args) => logs.push(args));
  global("navigator", { mediaDevices: {
    getSupportedConstraints: () => ({}),
    getUserMedia: () => { const request = deferred(); requests.push(request); return request.promise; },
  } });
  global("requestAnimationFrame", (callback) => { frames.set(++frameId, callback); return frameId; });
  global("cancelAnimationFrame", (id) => frames.delete(id));
  global("AudioContext", class {
    state = "running";
    closes = 0;
    onstatechange = null;
    constructor() { contexts.push(this); }
    async resume() {}
    async close() { this.closes++; this.state = "closed"; }
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
    createAnalyser() { return { fftSize: 4096, disconnect() {} }; }
  });
  const interruptions = [];
  engine = new MicrophoneTuner(() => {}, (message) => interruptions.push(message));
  const stream = () => {
    const track = { readyState: "live", enabled: true, muted: false, stops: 0,
      stop() { this.stops++; this.readyState = "ended"; } };
    return { active: true, getTracks: () => [track], getAudioTracks: () => [track], track };
  };
  return { engine, requests, contexts, frames, stream, interruptions, logs };
}

test("permission async resolves into running, and user Stop releases resources once", async (t) => {
  const s = setup(t), stream = s.stream();
  const start = s.engine.start();
  assert.equal(s.requests.length, 1);
  assert.equal(s.frames.size, 0);
  s.requests[0].resolve(stream);
  assert.equal(await start, true);
  assert.equal(stream.track.stops, 0);
  assert.equal(s.frames.size, 1);
  s.engine.stop("user-button");
  s.engine.stop("component-unmount");
  assert.equal(stream.track.stops, 1);
  assert.equal(s.contexts[0].closes, 1);
  assert.equal(s.frames.size, 0);
  assert.ok(s.logs.some(([event, data]) => event.includes("STOP requested") && data.reason === "user-button"));
});

test("real unmount during permission stops a late stream without scheduling analysis", async (t) => {
  const s = setup(t), stream = s.stream();
  const start = s.engine.start();
  s.engine.stop("component-unmount");
  s.requests[0].resolve(stream);
  assert.equal(await start, false);
  assert.equal(stream.track.stops, 1);
  assert.equal(s.frames.size, 0);
  assert.ok(s.logs.some(([, data]) => data.reason === "late-permission-result"));
});

test("a stale permission result cannot replace or stop a newer session", async (t) => {
  const s = setup(t), old = s.stream(), current = s.stream();
  const first = s.engine.start();
  s.engine.stop("user-button");
  const second = s.engine.start();
  s.requests[1].resolve(current);
  assert.equal(await second, true);
  s.requests[0].resolve(old);
  assert.equal(await first, false);
  assert.equal(old.track.stops, 1);
  assert.equal(current.track.stops, 0);
  assert.equal(s.contexts[1].closes, 0);
  assert.equal(s.frames.size, 1);
});

test("NotReadableError before MediaStream creation closes the context and logs its cause", async (t) => {
  const s = setup(t);
  const start = s.engine.start();
  s.requests[0].reject(new DOMException("Could not start audio source", "NotReadableError"));
  await assert.rejects(start, { name: "NotReadableError" });
  assert.equal(s.contexts[0].closes, 1);
  assert.equal(s.frames.size, 0);
  assert.ok(s.logs.some(([, data]) => data.name === "NotReadableError"));
  assert.equal(s.logs.filter(([event]) => event.includes("track.stop")).length, 0);
});

test("temporary mute/unmute does not stop a live track", async (t) => {
  const s = setup(t), stream = s.stream();
  const start = s.engine.start(); s.requests[0].resolve(stream); await start;
  stream.track.muted = true; stream.track.onmute();
  stream.track.muted = false; stream.track.onunmute();
  assert.equal(stream.track.stops, 0);
  assert.equal(s.frames.size, 1);
  assert.deepEqual(s.interruptions, []);
});

test("permission denied leaves no context or analysis callback", async (t) => {
  const s = setup(t);
  const start = s.engine.start();
  s.requests[0].reject(new DOMException("Permission denied", "NotAllowedError"));
  await assert.rejects(start, { name: "NotAllowedError" });
  assert.equal(s.contexts[0].closes, 1);
  assert.equal(s.frames.size, 0);
});

test("a stale permission rejection cannot close a newer context", async (t) => {
  const s = setup(t), stream = s.stream();
  const first = s.engine.start();
  s.engine.stop("user-button");
  const second = s.engine.start();
  s.requests[1].resolve(stream);
  assert.equal(await second, true);
  s.requests[0].reject(new DOMException("Permission denied", "NotAllowedError"));
  assert.equal(await first, false);
  assert.equal(stream.track.stops, 0);
  assert.equal(s.contexts[1].closes, 0);
});

test("audio context interruption has its own stop reason", async (t) => {
  const s = setup(t), stream = s.stream();
  const start = s.engine.start(); s.requests[0].resolve(stream); await start;
  s.contexts[0].state = "suspended";
  s.contexts[0].onstatechange();
  assert.equal(stream.track.stops, 1);
  assert.equal(s.frames.size, 0);
  assert.ok(s.logs.some(([, data]) => data.reason === "audio-context-state"));
});

test("browser-ended track is distinguished from an application stop", async (t) => {
  const s = setup(t), stream = s.stream();
  const start = s.engine.start(); s.requests[0].resolve(stream); await start;
  stream.track.readyState = "ended"; stream.track.onended();
  assert.equal(s.interruptions.length, 1);
  assert.equal(s.frames.size, 0);
  assert.ok(s.logs.some(([event]) => event.includes("track ended by browser/device")));
  assert.ok(s.logs.some(([, data]) => data.reason === "track-ended"));
});

test("real background stop cleans up handlers and the analysis loop", async (t) => {
  const s = setup(t), stream = s.stream();
  const start = s.engine.start(); s.requests[0].resolve(stream); await start;
  s.engine.stop("app-background");
  assert.equal(stream.track.stops, 1);
  assert.equal(stream.track.onended, null);
  assert.equal(stream.track.onmute, null);
  assert.equal(stream.track.onunmute, null);
  assert.equal(s.frames.size, 0);
});
