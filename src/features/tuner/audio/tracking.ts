import type { PitchDetection } from "./pitch.ts";

export const TRACKING = {
  acquireRms: 0.003,
  releaseRms: 0.0008,
  acquireConfidence: 0.88,
  holdConfidence: 0.72,
  holdMs: 450,
  confirmationFrames: 3,
  harmonicConfirmationFrames: 4,
  continuityCents: 80,
  candidateCents: 60,
  candidateGapMs: 200,
} as const;

function distance(a: number, b: number) {
  return Math.abs(1200 * Math.log2(a / b));
}
function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/** Hold only bridges dropouts; each accepted sustain frame must pass release checks. */
export class PitchStabilizer {
  private history: number[] = [];
  private candidate: number[] = [];
  private candidateTime: number | null = null;
  private lastValid: number | null = null;
  private stable: number | null = null;
  decision: { accepted: boolean; reason: string } = {
    accepted: false,
    reason: "no-signal",
  };
  get isTracking() {
    return this.stable !== null;
  }
  get frequency() {
    return this.stable;
  }
  age(now: number) {
    return this.lastValid === null ? null : Math.max(0, now - this.lastValid);
  }
  reset() {
    this.history = [];
    this.candidate = [];
    this.candidateTime = null;
    this.lastValid = null;
    this.stable = null;
    this.decision = { accepted: false, reason: "reset" };
  }

  push(
    detection: PitchDetection | null,
    now: number = performance.now(),
  ): number | null {
    if (this.lastValid !== null && now - this.lastValid > TRACKING.holdMs) {
      this.stable = null;
      this.history = [];
    }
    this.decision = { accepted: false, reason: "no-pitch" };
    if (
      !detection ||
      !Number.isFinite(detection.frequency) ||
      detection.frequency <= 0
    ) {
      this.candidate = [];
      return this.stable;
    }
    const continuing =
      this.stable !== null &&
      distance(detection.frequency, this.stable) <= TRACKING.continuityCents;
    const minRms = continuing ? TRACKING.releaseRms : TRACKING.acquireRms;
    const minConfidence = continuing
      ? TRACKING.holdConfidence
      : TRACKING.acquireConfidence;
    if (!Number.isFinite(detection.rms) || detection.rms < minRms) {
      this.candidate = [];
      this.decision.reason = "rms";
      return this.stable;
    }
    if (
      !Number.isFinite(detection.confidence) ||
      detection.confidence < minConfidence
    ) {
      this.candidate = [];
      this.decision.reason = "confidence";
      return this.stable;
    }
    if (continuing) {
      this.candidate = [];
      this.history.push(detection.frequency);
      if (this.history.length > 5) this.history.shift();
      this.stable = median(this.history);
      this.lastValid = now;
      this.decision = { accepted: true, reason: "tracking" };
      return this.stable;
    }
    if (
      this.candidate.length &&
      (this.candidateTime === null ||
        now - this.candidateTime > TRACKING.candidateGapMs ||
        distance(detection.frequency, median(this.candidate)) >
          TRACKING.candidateCents)
    )
      this.candidate = [];
    this.candidate.push(detection.frequency);
    this.candidateTime = now;
    // A momentary octave/fifth overtone must not replace the fundamental.
    const interval =
      this.stable === null ? 0 : distance(detection.frequency, this.stable);
    const harmonic =
      Math.abs(interval - 1200) < 35 || Math.abs(interval - 702) < 35;
    const required = harmonic
      ? TRACKING.harmonicConfirmationFrames
      : TRACKING.confirmationFrames;
    this.decision.reason = "confirming-new-note";
    if (this.candidate.length >= required) {
      this.history = [...this.candidate];
      this.candidate = [];
      this.stable = median(this.history);
      this.lastValid = now;
      this.decision = { accepted: true, reason: "acquired" };
    }
    return this.stable;
  }
}
