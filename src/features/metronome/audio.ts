import {
  DEFAULT_SETTINGS,
  planBeats,
  updateMetronomeSettings,
  type BeatCursor,
  type MetronomeSettings,
} from "./rhythm.ts";
import { AudioScheduler, AUDIO_START_DELAY } from "../audio/AudioScheduler.ts";

const CLICK_DURATION = 0.035;
type Voice = { oscillator: OscillatorNode; gain: GainNode; time: number };

/** Timer wakes the scheduler; only the AudioContext clock determines click timing. */
export class MetronomeAudio {
  private settings = { ...DEFAULT_SETTINGS };
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Set<Voice>();
  // Includes silent events so an edit within the lookahead can make them audible.
  private pending: BeatCursor[] = [];
  private cursor: BeatCursor = { time: 0, beat: 0 };
  private scheduler: AudioScheduler<BeatCursor> | null = null;
  private running = false;
  private generation = 0;
  private disposed = false;
  private onBeat: (beat: number) => void;
  private onInterrupted: () => void;

  constructor(onBeat: (beat: number) => void, onInterrupted: () => void) {
    this.onBeat = onBeat;
    this.onInterrupted = onInterrupted;
  }

  configure(settings: MetronomeSettings) {
    const signatureChanged = settings.signature !== this.settings.signature;
    const soundsChanged = settings.beatSounds.some((sound, index) => sound !== this.settings.beatSounds[index]);
    this.settings = updateMetronomeSettings(this.settings, settings);
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(
        settings.volume,
        this.context.currentTime,
        0.015,
      );
    if (signatureChanged && this.running && this.context) {
      this.clearVoices();
      this.pending = [];
      this.scheduler?.clearVisuals();
      this.cursor = { time: this.context.currentTime + AUDIO_START_DELAY, beat: 0 };
      this.onBeat(-1);
    } else if (soundsChanged && this.running && this.context) {
      const now = this.context.currentTime;
      // Replace only future sounds, keeping the musical clock and visual queue.
      // An already audible click finishes normally; a silent step still advances.
      for (const voice of this.voices) {
        if (voice.time > now) this.releaseVoice(voice);
      }
      this.pending = this.pending.filter((event) => event.time > now);
      for (const event of this.pending) this.click(event);
    }
  }

  async start(): Promise<boolean> {
    if (this.disposed) return false;
    if (this.running) return true;
    const generation = ++this.generation;
    if (!this.context) {
      this.context = new AudioContext({ latencyHint: "interactive" });
      this.master = this.context.createGain();
      this.master.connect(this.context.destination);
      this.scheduler = new AudioScheduler(this.context, this.schedule, (event) => this.onBeat(event.beat), this.onInterrupted);
      this.context.onstatechange = () => {
        if (this.running && this.context?.state !== "running") {
          this.stop();
          this.onInterrupted();
        }
      };
    }
    const context = this.context;
    if (context.state === "suspended") await context.resume();
    if (this.disposed || generation !== this.generation) return false;
    if (context.state !== "running")
      throw new Error("Le navigateur n’a pas autorisé la lecture audio.");
    this.master!.gain.setValueAtTime(this.settings.volume, context.currentTime);
    this.running = true;
    this.pending = [];
    this.cursor = { time: context.currentTime + AUDIO_START_DELAY, beat: 0 };
    this.scheduler!.start();
    return true;
  }

  private schedule = (now: number, horizon: number): BeatCursor[] => {
    if (!this.running || !this.context) return [];
    const plan = planBeats(
      this.cursor,
      now,
      horizon,
      this.settings.bpm,
      this.settings.signature,
    );
    for (const event of plan.events) {
      this.click(event);
    }
    this.pending = this.pending.filter((event) => event.time > now).concat(plan.events);
    this.cursor = plan.next;
    return plan.events;
  };

  private click(event: BeatCursor) {
    const sound = this.settings.beatSounds[event.beat];
    if (sound === "silent") return;
    const context = this.context!;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const accented = sound === "accent";
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      accented ? 1400 : 850,
      event.time,
    );
    gain.gain.setValueAtTime(0, event.time);
    gain.gain.linearRampToValueAtTime(
      accented ? 0.24 : 0.16,
      event.time + 0.002,
    );
    gain.gain.exponentialRampToValueAtTime(0.001, event.time + CLICK_DURATION);
    oscillator.connect(gain);
    gain.connect(this.master!);
    const voice = { oscillator, gain, time: event.time };
    this.voices.add(voice);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      this.voices.delete(voice);
    };
    oscillator.start(event.time);
    oscillator.stop(event.time + CLICK_DURATION + 0.005);
  }

  private clearVoices() {
    for (const voice of this.voices) this.releaseVoice(voice);
  }

  private releaseVoice(voice: Voice) {
    voice.oscillator.onended = null;
    voice.oscillator.stop();
    voice.oscillator.disconnect();
    voice.gain.disconnect();
    this.voices.delete(voice);
  }

  stop() {
    this.generation++;
    this.running = false;
    this.scheduler?.stop();
    this.clearVoices();
    this.pending = [];
  }

  dispose() {
    this.disposed = true;
    this.stop();
    if (this.context) {
      this.context.onstatechange = null;
      if (this.context.state !== "closed")
        void this.context.close().catch(() => {});
    }
    this.master?.disconnect();
    this.master = null;
    this.scheduler = null;
    this.context = null;
  }
}
