import { MAX_BPM, MIN_BPM } from "./rhythm.ts";

export const TAP_RESET_MS = 2500;
const MAX_INTERVALS = 8;
const MIN_INTERVALS = 4;
export type TapSequence = {
  lastTap: number | null;
  intervals: readonly number[];
};
export type TapEstimate = {
  bpm: number | null;
  stable: boolean;
  inRange: boolean;
};
export function emptyTapSequence(): TapSequence {
  return { lastTap: null, intervals: [] };
}

/** Timestamps are monotonic milliseconds, supplied by the caller. */
export function recordTap(sequence: TapSequence, timestamp: number): TapSequence {
  if (!Number.isFinite(timestamp) || timestamp < 0) return sequence;
  if (sequence.lastTap === null || timestamp - sequence.lastTap >= TAP_RESET_MS) {
    return { lastTap: timestamp, intervals: [] };
  }
  const interval = timestamp - sequence.lastTap;
  if (interval <= 0) return sequence;
  return {
    lastTap: timestamp,
    intervals: [...sequence.intervals, interval].slice(-MAX_INTERVALS),
  };
}

/** Reject isolated intervals outside 15% of the median, then average inliers.
 * At least four inliers and 75% agreement are required, including the latest tap.
 * Never infer a doubled/halved tempo or clamp the measured value.
 */
export function estimateTapTempo(sequence: TapSequence): TapEstimate {
  const intervals = sequence.intervals;
  if (intervals.length < MIN_INTERVALS) return { bpm: null, stable: false, inRange: false };
  const sorted = [...intervals].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  const tolerance = median * 0.15;
  const agrees = (interval: number) => Math.abs(interval - median) <= tolerance;
  const inliers = intervals.filter(agrees);
  if (!inliers.length) return { bpm: null, stable: false, inRange: false };
  const measuredBpm = 60000 / (inliers.reduce((sum, interval) => sum + interval, 0) / inliers.length);
  return {
    bpm: Math.round(measuredBpm),
    stable: inliers.length >= MIN_INTERVALS && inliers.length / intervals.length >= 0.75 && agrees(intervals[intervals.length - 1]),
    // Tiny floating point errors at exactly 40/240 are not out-of-range taps.
    inRange: measuredBpm >= MIN_BPM - 1e-9 && measuredBpm <= MAX_BPM + 1e-9,
  };
}
