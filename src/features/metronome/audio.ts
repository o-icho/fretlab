import {
  DEFAULT_SETTINGS,
  planBeats,
  type BeatCursor,
  type MetronomeSettings,
} from "./rhythm";
import { AudioScheduler, AUDIO_START_DELAY } from "../audio/AudioScheduler";

const CLICK_DURATION = 0.035;
type Voice = { oscillator: OscillatorNode; gain: GainNode };

/** Timer wakes the scheduler; only the AudioContext clock determines click timing. */
export class MetronomeAudio {
  private settings = { ...DEFAULT_SETTINGS };
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Set<Voice>();
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
    this.settings = { ...settings };
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(
        settings.volume,
        this.context.currentTime,
        0.015,
      );
    if (signatureChanged && this.running && this.context) {
      this.clearVoices();
      this.scheduler?.clearVisuals();
      this.cursor = { time: this.context.currentTime + AUDIO_START_DELAY, beat: 0 };
      this.onBeat(-1);
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
    this.cursor = plan.next;
    return plan.events;
  };

  private click(event: BeatCursor) {
    const context = this.context!;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const accented = this.settings.accent && event.beat === 0;
    const secondary = this.settings.signature === "6/8" && event.beat === 3;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      accented ? 1400 : secondary ? 1000 : 850,
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
    const voice = { oscillator, gain };
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
    for (const { oscillator, gain } of this.voices) {
      oscillator.onended = null;
      oscillator.stop();
      oscillator.disconnect();
      gain.disconnect();
    }
    this.voices.clear();
  }

  stop() {
    this.generation++;
    this.running = false;
    this.scheduler?.stop();
    this.clearVoices();
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
