import { targetFrequency } from "../../domain/music/midi.ts";
import { AUDIO_START_DELAY } from "./AudioScheduler.ts";

/** A short finite phrase is scheduled entirely on the audio clock; no timer/loop required. */
export class MidiNotePlayer {
  private context: AudioContext | null = null;
  private voices = new Map<OscillatorNode, GainNode>();
  private generation = 0;
  private disposed = false;
  private readonly noteStarts: (count: number, together: boolean) => number[];

  constructor(noteStarts: (count: number, together: boolean) => number[]) {
    this.noteStarts = noteStarts;
  }

  stop() {
    this.generation++;
    for (const [oscillator, gain] of this.voices) {
      oscillator.onended = null;
      oscillator.stop(); oscillator.disconnect(); gain.disconnect();
    }
    this.voices.clear();
  }
  async play(notes: readonly number[], together: boolean, volume: number, onEnd: () => void) {
    this.stop();
    if (this.disposed) return;
    const starts = this.noteStarts(notes.length, together);
    const token = this.generation;
    const context = this.context ??= new AudioContext();
    if (context.state !== "running") await context.resume();
    if (this.disposed || token !== this.generation) return;
    const start = context.currentTime + AUDIO_START_DELAY;
    try {
      notes.forEach((midi, index) => {
        const oscillator = context.createOscillator(), gain = context.createGain();
        const time = start + starts[index], duration = together ? 1.25 : 0.55;
        const level = Math.min(1, Math.max(0, volume)) * 0.18 / (together ? notes.length : 1);
        oscillator.type = "triangle";
        oscillator.frequency.value = targetFrequency(midi);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(level, time + 0.015);
        if (level > 0) gain.gain.exponentialRampToValueAtTime(level * 0.25, time + duration - 0.08);
        gain.gain.linearRampToValueAtTime(0, time + duration);
        oscillator.connect(gain); gain.connect(context.destination);
        this.voices.set(oscillator, gain);
        oscillator.onended = () => {
          oscillator.disconnect(); gain.disconnect(); this.voices.delete(oscillator);
          if (token === this.generation && this.voices.size === 0) onEnd();
        };
        oscillator.start(time); oscillator.stop(time + duration);
      });
    } catch (error) { this.stop(); throw error; }
  }
  dispose() {
    this.disposed = true; this.stop();
    if (this.context) void this.context.close().catch(() => {});
    this.context = null;
  }
}
