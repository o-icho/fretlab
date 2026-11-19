import { test } from "node:test";
import assert from "node:assert/strict";
import { EarAudio } from "./EarAudio.ts";

test("horloge audio, arrêt pendant resume et nettoyage au démontage", async () => {
  const original = globalThis.AudioContext;
  let resume, closed = false;
  const voices = [];
  globalThis.AudioContext = class {
    state = "suspended"; currentTime = 10; destination = {};
    resume() { return new Promise(resolve => { resume = () => { this.state = "running"; resolve(); }; }); }
    close() { this.state = "closed"; closed = true; return Promise.resolve(); }
    createOscillator() {
      const voice = { frequency: {}, connect() {}, disconnect() { this.disconnected = true; }, start(time) { this.startTime = time; }, stop(time) { this.stopTime = time; } };
      voices.push(voice); return voice;
    }
    createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
  };
  try {
    const audio = new EarAudio(); let ended = 0;
    const pending = audio.play([48, 52, 55], false, .5, () => ended++);
    audio.stop(); resume(); await pending;
    assert.equal(voices.length, 0);
    await audio.play([48, 52, 55], false, .5, () => ended++);
    assert.deepEqual(voices.map(v => Math.round(v.startTime * 1000)), [10040, 10740, 11440]);
    for (const voice of [...voices]) voice.onended();
    assert.equal(ended, 1);
    assert(voices.every(v => v.disconnected));
    await audio.play([48, 55], false, .5, () => ended++);
    audio.dispose(); assert.equal(closed, true);
    assert(voices.every(v => v.disconnected)); assert.equal(ended, 1);
  } finally { globalThis.AudioContext = original; }
});
