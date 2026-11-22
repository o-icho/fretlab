export type BpmRange = { readonly min: number; readonly max: number };
export const MIN_BPM = 40;
export const MAX_BPM = 240;
export const DEFAULT_BPM = 120;
export const DRUM_BPM_RANGE = { min: MIN_BPM, max: MAX_BPM };
export const METRONOME_BPM_RANGE = { min: 30, max: 300 };

export function clampBpm(value: number, range: BpmRange = DRUM_BPM_RANGE): number {
  return Number.isFinite(value) ? Math.max(range.min, Math.min(range.max, Math.round(value))) : DEFAULT_BPM;
}

export function parseBpm(value: string, range: BpmRange = DRUM_BPM_RANGE): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? clampBpm(number, range) : null;
}
