import { clampBpm, DEFAULT_BPM } from "../../domain/rhythm/tempo.ts";
export { MIN_BPM, MAX_BPM, clampBpm } from "../../domain/rhythm/tempo.ts";
export const SIGNATURES = ["2/4", "3/4", "4/4", "7/4", "5/8", "6/8", "7/8", "9/8", "12/8"] as const;
export type TimeSignature = (typeof SIGNATURES)[number];
export type BeatSound = "accent" | "normal" | "silent";
// BPM units are explicit: compound meters keep the existing 6/8 convention.
export const SIGNATURE_INFO = {
  "2/4": { steps: 2, unit: "quarter", subdivisions: 1 },
  "3/4": { steps: 3, unit: "quarter", subdivisions: 1 },
  "4/4": { steps: 4, unit: "quarter", subdivisions: 1 },
  "7/4": { steps: 7, unit: "quarter", subdivisions: 1 },
  "5/8": { steps: 5, unit: "eighth", subdivisions: 1 },
  "6/8": { steps: 6, unit: "dotted-quarter", subdivisions: 3 },
  "7/8": { steps: 7, unit: "eighth", subdivisions: 1 },
  "9/8": { steps: 9, unit: "dotted-quarter", subdivisions: 3 },
  "12/8": { steps: 12, unit: "dotted-quarter", subdivisions: 3 },
} as const;
export type MetronomeSettings = {
  bpm: number;
  signature: TimeSignature;
  beatSounds: readonly BeatSound[];
  volume: number;
};
export const DEFAULT_SETTINGS: MetronomeSettings = {
  bpm: DEFAULT_BPM,
  signature: "4/4",
  beatSounds: defaultBeatSounds("4/4"),
  volume: 0.5,
};

export function parseBpm(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? clampBpm(number) : null;
}
export function isTimeSignature(value: string): value is TimeSignature {
  return SIGNATURES.some((signature) => signature === value);
}
export function beatsPerBar(signature: TimeSignature): number {
  return SIGNATURE_INFO[signature].steps;
}
export function signatureDescription(signature: TimeSignature): string {
  const { steps, unit, subdivisions } = SIGNATURE_INFO[signature];
  if (unit === "dotted-quarter")
    return `À la noire pointée · ${steps / subdivisions} pulsations, ${steps} croches`;
  if (unit === "eighth") return `À la croche · ${steps} croches par mesure`;
  return "À la noire · un repère par temps";
}

export function defaultBeatSounds(signature: TimeSignature): BeatSound[] {
  return Array.from({ length: beatsPerBar(signature) }, (_, index) => index === 0 ? "accent" : "normal");
}

export function nextBeatSound(sound: BeatSound): BeatSound {
  return sound === "accent" ? "normal" : sound === "normal" ? "silent" : "accent";
}

export function cycleBeatSounds(sounds: readonly BeatSound[], index: number): BeatSound[] {
  return sounds.map((sound, position) => position === index ? nextBeatSound(sound) : sound);
}

export function updateMetronomeSettings(
  current: MetronomeSettings,
  patch: Partial<MetronomeSettings>,
): MetronomeSettings {
  const signature = patch.signature ?? current.signature;
  const defaults = defaultBeatSounds(signature);
  const sounds = patch.beatSounds ?? (signature !== current.signature ? defaults : current.beatSounds);
  return {
    bpm: clampBpm(patch.bpm ?? current.bpm),
    signature,
    volume: Number.isFinite(patch.volume ?? current.volume)
      ? Math.max(0, Math.min(1, patch.volume ?? current.volume)) : current.volume,
    beatSounds: defaults.map((fallback, index) => {
      const sound = sounds[index];
      return sound === "accent" || sound === "normal" || sound === "silent" ? sound : fallback;
    }),
  };
}

// Interval between displayed steps (eighth notes in compound meters).
export function beatInterval(bpm: number, signature: TimeSignature): number {
  return 60 / clampBpm(bpm) / SIGNATURE_INFO[signature].subdivisions;
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
