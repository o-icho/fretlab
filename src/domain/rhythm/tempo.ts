// Supported range of FretLab's practice players, not a universal musical limit.
export const MIN_BPM = 40;
export const MAX_BPM = 240;
export const DEFAULT_BPM = 120;
export function clampBpm(value: number): number {
  return Number.isFinite(value) ? Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(value))) : DEFAULT_BPM;
}
