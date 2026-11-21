import test from "node:test";
import assert from "node:assert/strict";
import { ChordAudio } from "./ChordAudio.ts";
import { targetFrequency } from "../../domain/music/midi.ts";

test("le barré de Do en case 8 fait entendre les six cordes, ensemble ou dans l’ordre du diagramme", async (t) => {
  const voices = [];
  const originalContext = Object.getOwnPropertyDescriptor(globalThis, "AudioContext");
  t.after(() => {
    if (originalContext) Object.defineProperty(globalThis, "AudioContext", originalContext);
    else delete globalThis.AudioContext;
  });
  globalThis.AudioContext = class {
    state = "running";
    currentTime = 0;
    destination = {};
    close() { return Promise.resolve(); }
    createOscillator() {
      const voice = {
        frequency: {}, connect() {}, disconnect() {},
        start(time) { this.startTime = time; }, stop() {},
      };
      voices.push(voice);
      return voice;
    }
    createGain() {
      return {
        gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {}, disconnect() {},
      };
    }
  };

  const audio = new ChordAudio();
  t.after(() => audio.dispose());
  const notes = [48, 55, 60, 64, 67, 72];
  const expectedFrequencies = notes.map(targetFrequency);
  await audio.play(notes, true, 0.85, () => {});
  assert.deepEqual(voices.map(voice => voice.frequency.value), expectedFrequencies);
  assert.equal(new Set(voices.map(voice => voice.startTime)).size, 1);

  let ended = 0;
  await audio.play(notes, false, 0.85, () => ended++);
  const arpeggio = voices.slice(6);
  assert.deepEqual(arpeggio.map(voice => voice.frequency.value), expectedFrequencies);
  for (let string = 0; string < arpeggio.length; string++) {
    if (string > 0) assert.ok(arpeggio[string].startTime > arpeggio[string - 1].startTime);
    assert.equal(ended, 0);
    arpeggio[string].onended();
  }
  assert.equal(ended, 1);
});
