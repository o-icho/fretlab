export type PitchDetection = {
  frequency: number;
  confidence: number;
  rms: number;
};
// Leave room below B0 (30.87 Hz) for a flat five-string bass.
export const MIN_FREQUENCY = 25;
export const MAX_FREQUENCY = 1600;
import { TRACKING } from "./tracking.ts";
export { PitchStabilizer } from "./tracking.ts";
const YIN_THRESHOLD = 0.12;
/** At least four periods of the lowest pitch, including at 96 kHz.
 * YIN compares two half-windows; a fixed 4096 buffer misses bass fundamentals.
 */
export function pitchBufferSize(sampleRate: number): number {
  return Math.min(32768, Math.max(4096, 2 ** Math.ceil(Math.log2(4 * sampleRate / MIN_FREQUENCY))));
}
export type PitchOptions = {
  minRms?: number;
  yinThreshold?: number;
};
export type PitchAnalysis = {
  rms: number;
  detection: PitchDetection | null;
  reason: "invalid-buffer" | "rms" | "periodicity" | null;
};

/** YIN: squared difference, cumulative normalization, first deep trough, interpolation.
 * Monophonic input only. Temporary buffers never leave memory or this function.
 */
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  options: PitchOptions = {},
): PitchDetection | null {
  return analysePitch(buffer, sampleRate, options).detection;
}

export function analysePitch(
  buffer: Float32Array,
  sampleRate: number,
  options: PitchOptions = {},
): PitchAnalysis {
  if (sampleRate <= 0 || !Number.isFinite(sampleRate) || buffer.length < 512)
    return { rms: 0, detection: null, reason: "invalid-buffer" };
  const factor = Math.max(1, Math.round(sampleRate / 24000));
  const rate = sampleRate / factor;
  const size = Math.floor(buffer.length / factor);
  const signal = new Float32Array(size);
  let mean = 0;
  for (let i = 0; i < size; i++) {
    let sum = 0;
    for (let j = 0; j < factor; j++) sum += buffer[i * factor + j];
    signal[i] = sum / factor;
    mean += signal[i];
  }
  mean /= size;
  let energy = 0;
  for (let i = 0; i < size; i++) {
    signal[i] -= mean;
    energy += signal[i] * signal[i];
  }
  const rms = Math.sqrt(energy / size);
  if (!Number.isFinite(rms))
    return { rms: 0, detection: null, reason: "invalid-buffer" };
  if (rms < (options.minRms ?? TRACKING.acquireRms))
    return { rms, detection: null, reason: "rms" };
  const window = Math.floor(size / 2);
  const minLag = Math.max(2, Math.floor(rate / MAX_FREQUENCY));
  const maxLag = Math.min(window - 2, Math.ceil(rate / MIN_FREQUENCY));
  if (maxLag <= minLag)
    return { rms, detection: null, reason: "invalid-buffer" };
  const normalized = new Float64Array(maxLag + 2);
  normalized[0] = 1;
  let cumulative = 0;
  for (let lag = 1; lag <= maxLag + 1; lag++) {
    let difference = 0;
    for (let i = 0; i < window; i++) {
      const delta = signal[i] - signal[i + lag];
      difference += delta * delta;
    }
    cumulative += difference;
    normalized[lag] = cumulative > 0 ? (difference * lag) / cumulative : 1;
  }
  const candidates: PitchDetection[] = [];
  // Smooth only the period-difference curve for low notes, not the measured
  // waveform or its frequency: this reduces noise-induced sample-lag jitter.
  const rawNormalized = normalized.slice();
  for (let lag = Math.max(2, Math.ceil(rate / 400)); lag < maxLag; lag++)
    normalized[lag] =
      (rawNormalized[lag - 1] +
        2 * rawNormalized[lag] +
        rawNormalized[lag + 1]) /
      4;
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (normalized[lag] >= (options.yinThreshold ?? YIN_THRESHOLD)) continue;
    // Noise can create tiny local dips before the actual period. Find the
    // deepest point of this whole below-threshold trough, not its first dip.
    let trough = lag;
    while (
      lag < maxLag &&
      normalized[lag + 1] < (options.yinThreshold ?? YIN_THRESHOLD)
    ) {
      lag++;
      if (normalized[lag] < normalized[trough]) trough = lag;
    }
    const before = normalized[trough - 1],
      center = normalized[trough],
      after = normalized[trough + 1];
    const denominator = before - 2 * center + after;
    const correction =
      denominator !== 0
        ? Math.max(-1, Math.min(1, (before - after) / (2 * denominator)))
        : 0;
    const frequency = rate / (trough + correction);
    // Compare interpolated residuals too: integer-lag error is proportionally
    // larger for treble notes and must not make a subharmonic look preferable.
    const residual = Math.max(0, center - 0.25 * (before - after) * correction);
    if (frequency >= MIN_FREQUENCY && frequency <= MAX_FREQUENCY)
      candidates.push({ frequency, confidence: 1 - residual, rms });
    // Skip the rest of this trough, then inspect later periods for continuity.
    while (
      lag < maxLag &&
      normalized[lag + 1] <= (options.yinThreshold ?? YIN_THRESHOLD)
    )
      lag++;
  }
  // A dominant overtone may produce an early, plausible trough. Keep the
  // shortest period whose residual is comparable to the best one. The absolute
  // floor tolerates interpolation/noise; the relative term scales with noise.
  // Never favor the previous frequency's longer-period trough: a pure octave-up
  // note also repeats at that period and would otherwise stay locked forever.
  // Temporal continuity remains the stabilizer's job.
  const bestConfidence = candidates.reduce(
    (best, candidate) => Math.max(best, candidate.confidence),
    0,
  );
  const maxResidual = (1 - bestConfidence) * 1.5 + 0.005;
  const detection = candidates.find(
    (candidate) => 1 - candidate.confidence <= maxResidual,
  ) ?? null;
  return { rms, detection, reason: detection ? null : "periodicity" };
}
