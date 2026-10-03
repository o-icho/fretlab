export const MIN_BPM = 40;
export const MAX_BPM = 240;
export const SIGNATURES = ["2/4", "3/4", "4/4", "6/8"] as const;
export type TimeSignature = (typeof SIGNATURES)[number];
export type MetronomeSettings = {
  bpm: number;
  signature: TimeSignature;
  accent: boolean;
  volume: number;
};
export const DEFAULT_SETTINGS: MetronomeSettings = {
  bpm: 120,
  signature: "4/4",
  accent: true,
  volume: 0.5,
};

export function clampBpm(value: number): number {
  return Number.isFinite(value)
    ? Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(value)))
    : DEFAULT_SETTINGS.bpm;
}
export function parseBpm(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? clampBpm(number) : null;
}
export function isTimeSignature(value: string): value is TimeSignature {
  return SIGNATURES.some((signature) => signature === value);
}
export function beatsPerBar(signature: TimeSignature): number {
  return signature === "6/8" ? 6 : Number(signature[0]);
}
// Compound 6/8: BPM counts dotted quarters, each subdivided into three eighths.
export function beatInterval(bpm: number, signature: TimeSignature): number {
  return 60 / clampBpm(bpm) / (signature === "6/8" ? 3 : 1);
}
export function nextBeat(beat: number, signature: TimeSignature): number {
  return (beat + 1) % beatsPerBar(signature);
}
export type BeatCursor = { time: number; beat: number };
export type BeatPlan = { events: BeatCursor[]; next: BeatCursor };

/** Recover from a late scheduler without playing missed clicks in a burst. */
export function planBeats(
  cursor: BeatCursor,
  now: number,
  horizon: number,
  bpm: number,
  signature: TimeSignature,
): BeatPlan {
  const interval = beatInterval(bpm, signature);
  let { time, beat } = cursor;
  if (time < now) {
    const skipped = Math.ceil((now - time) / interval);
    time += skipped * interval;
    beat = (beat + skipped) % beatsPerBar(signature);
  }
  const events: BeatCursor[] = [];
  while (time < now + horizon) {
    events.push({ time, beat });
    time += interval;
    beat = nextBeat(beat, signature);
  }
  return { events, next: { time, beat } };
}
