import { planDrumSteps, queuePattern, startDrumCursor, type DrumCursor, type DrumPattern, type DrumStep } from "../../../domain/rhythm/drums";
import { clampBpm } from "../../../domain/rhythm/tempo";
import { AudioScheduler, AUDIO_START_DELAY } from "../../audio/AudioScheduler";
import { BasicDrumKit } from "./BasicDrumKit";
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
  constructor(
    private settings: DrumSettings,
    private onStep: (step: DrumStep) => void,
    private onInterrupted: () => void,
    private createKit: DrumKitFactory = (context, output) => new BasicDrumKit(context, output),
  ) {}
  configure(settings: DrumSettings) {
    if (this.cursor && this.running && settings.pattern !== this.settings.pattern) this.cursor = queuePattern(this.cursor, settings.pattern);
    this.settings = { ...settings, bpm: clampBpm(settings.bpm), volume: Math.max(0, Math.min(1, settings.volume)) };
    if (this.master && this.context) this.master.gain.setTargetAtTime(this.settings.volume, this.context.currentTime, 0.015);
  }
  async start(): Promise<boolean> {
    if (this.disposed) return false;
    if (this.running) return true;
    const generation = ++this.generation;
    if (!this.context) {
      this.context = new AudioContext({ latencyHint: "interactive" });
      this.master = this.context.createGain();
      this.master.connect(this.context.destination);
      this.kit = this.createKit(this.context, this.master);
      this.scheduler = new AudioScheduler(this.context, this.schedule, this.onStep, this.interrupted);
      this.context.onstatechange = () => { if (this.running && this.context?.state !== "running") this.interrupted(); };
    }
    if (this.context.state === "suspended") await this.context.resume();
    if (this.disposed || generation !== this.generation) return false;
    if (this.context.state !== "running") throw new Error("Audio indisponible.");
    this.master!.gain.setValueAtTime(this.settings.volume, this.context.currentTime);
    this.cursor = startDrumCursor(this.settings.pattern, this.context.currentTime + AUDIO_START_DELAY, this.settings.countIn);
    this.running = true;
    this.scheduler!.start();
    return this.running;
  }
  private schedule = (now: number, horizon: number): DrumStep[] => {
    if (!this.running || !this.cursor) return [];
    const plan = planDrumSteps(this.cursor, now, horizon, this.settings.bpm);
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
