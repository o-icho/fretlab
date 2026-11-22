import { planDrumSteps, queuePattern, startDrumCursor, type DrumCursor, type DrumInstrument, type DrumPattern, type DrumStep } from "../../../domain/rhythm/drums.ts";
import { clampBpm, DRUM_BPM_RANGE, type BpmRange } from "../../../domain/rhythm/tempo.ts";
import { AudioScheduler, AUDIO_START_DELAY } from "../../audio/AudioScheduler.ts";
import { AcousticDrumKit } from "./AcousticDrumKit.ts";
import type { DrumKitFactory, DrumSoundProvider } from "./DrumSoundProvider";

export type DrumSettings = { bpm: number; volume: number; pattern: DrumPattern; countIn: 0 | 1 | 2 };
export class DrumPlayer {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private kit: DrumSoundProvider | null = null;
  private scheduler: AudioScheduler<DrumStep> | null = null;
  private cursor: DrumCursor | null = null;
  private running = false;
  private disposed = false;
  private generation = 0;
  private settings: DrumSettings;
  private onStep: ((step: DrumStep) => void) | null;
  private onInterrupted: () => void;
  private createKit: DrumKitFactory;
  private bpmRange: BpmRange;
  constructor(
    settings: DrumSettings,
    onStep: ((step: DrumStep) => void) | null,
    onInterrupted: () => void,
    createKit: DrumKitFactory = (context, output) => new AcousticDrumKit(context, output),
    bpmRange: BpmRange = DRUM_BPM_RANGE,
  ) {
    this.settings = settings;
    this.onStep = onStep;
    this.onInterrupted = onInterrupted;
    this.createKit = createKit;
    this.bpmRange = bpmRange;
  }
  configure(settings: DrumSettings) {
    if (this.cursor && this.running && settings.pattern !== this.settings.pattern) this.cursor = queuePattern(this.cursor, settings.pattern);
    this.settings = { ...settings, bpm: clampBpm(settings.bpm, this.bpmRange), volume: Math.max(0, Math.min(1, settings.volume)) };
    if (this.master && this.context) this.master.gain.setTargetAtTime(this.settings.volume, this.context.currentTime, 0.015);
  }
  private async prepareAudio(generation: number) {
    if (!this.context) {
      this.context = new AudioContext({ latencyHint: "interactive" });
      this.master = this.context.createGain();
      this.master.connect(this.context.destination);
      this.kit = this.createKit(this.context, this.master);
      this.scheduler = new AudioScheduler(this.context, this.schedule, this.onStep, this.interrupted);
      this.context.onstatechange = () => { if (this.running && this.context?.state !== "running") this.interrupted(); };
    }
    const context = this.context;
    if (context.state === "suspended") await context.resume();
    if (generation !== this.generation) return null;
    if (this.kit?.prepare) await this.kit.prepare();
    if (generation !== this.generation) return null;
    if (context.state !== "running") throw new Error("Audio indisponible.");
    this.master!.gain.setValueAtTime(this.settings.volume, context.currentTime);
    return context;
  }
  async preview(instrument: DrumInstrument, velocity: number) {
    if (this.disposed || this.running || velocity <= 0 || this.settings.volume === 0) return;
    const generation = ++this.generation;
    const context = await this.prepareAudio(generation);
    if (context && generation === this.generation) this.kit!.trigger(instrument, context.currentTime, velocity);
  }
  async start(): Promise<boolean> {
    if (this.disposed) return false;
    if (this.running) return true;
    const generation = ++this.generation;
    this.kit?.stop();
    const context = await this.prepareAudio(generation);
    if (!context || generation !== this.generation) return false;
    this.cursor = startDrumCursor(this.settings.pattern, context.currentTime + AUDIO_START_DELAY, this.settings.countIn);
    this.running = true;
    this.scheduler!.start();
    return this.running;
  }
  private schedule = (now: number, horizon: number): DrumStep[] => {
    if (!this.running || !this.cursor) return [];
    const plan = planDrumSteps(this.cursor, now, horizon, this.settings.bpm, this.bpmRange);
    this.cursor = plan.next;
    for (const event of plan.events) {
      if (event.click) this.kit!.click(event.time, event.click === "accent");
      for (const hit of event.hits) this.kit!.trigger(hit.instrument, event.time, hit.velocity);
    }
    return plan.events;
  };
  private interrupted = () => { this.stop(); this.onInterrupted(); };
  stop() {
    this.generation++;
    this.running = false;
    this.scheduler?.stop();
    this.kit?.stop();
    this.cursor = null;
  }
  dispose() {
    this.disposed = true;
    this.stop();
    this.kit?.dispose();
    if (this.context) {
      this.context.onstatechange = null;
      if (this.context.state !== "closed") void this.context.close().catch(() => {});
    }
    this.master?.disconnect();
    this.context = null;
    this.master = null;
    this.kit = null;
    this.scheduler = null;
  }
}
