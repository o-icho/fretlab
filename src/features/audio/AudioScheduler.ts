export type TimedEvent = { time: number };
export const AUDIO_LOOKAHEAD = 0.1;
export const AUDIO_START_DELAY = 0.04;

/** Shared metronome/drum clock: timers only fill the AudioContext timeline. */
export class AudioScheduler<T extends TimedEvent> {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private frame: number | null = null;
  private visuals: T[] = [];
  private running = false;
  private context: AudioContext;
  private schedule: (now: number, horizon: number) => T[];
  private onVisual: (event: T) => void;
  private onError: () => void;

  constructor(
    context: AudioContext,
    schedule: (now: number, horizon: number) => T[],
    onVisual: (event: T) => void,
    onError: () => void,
  ) {
    this.context = context;
    this.schedule = schedule;
    this.onVisual = onVisual;
    this.onError = onError;
  }

  start() {
    this.stop();
    this.running = true;
    this.tick();
    this.animate();
  }
  clearVisuals() { this.visuals = []; }
  stop() {
    this.running = false;
    if (this.timer !== null) clearTimeout(this.timer);
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.timer = null;
    this.frame = null;
    this.clearVisuals();
  }
  private tick = () => {
    if (!this.running) return;
    try {
      this.visuals.push(...this.schedule(this.context.currentTime, AUDIO_LOOKAHEAD));
      this.timer = setTimeout(this.tick, 25);
    } catch {
      this.stop();
      this.onError();
    }
  };
  private animate = () => {
    if (!this.running) return;
    const timestamp = this.context.getOutputTimestamp?.();
    const audibleTime = timestamp && typeof timestamp.performanceTime === "number" && timestamp.performanceTime > 0 && typeof timestamp.contextTime === "number"
      ? timestamp.contextTime + Math.max(0, performance.now() - timestamp.performanceTime) / 1000
      : this.context.currentTime - (this.context.outputLatency || this.context.baseLatency || 0);
    let latest: T | undefined;
    while (this.visuals.length && this.visuals[0].time <= audibleTime) latest = this.visuals.shift();
    if (latest) this.onVisual(latest);
    this.frame = requestAnimationFrame(this.animate);
  };
}
