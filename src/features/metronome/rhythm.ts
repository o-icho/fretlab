import { clampBpm as clampTempo, parseBpm as parseTempo, DEFAULT_BPM, METRONOME_BPM_RANGE } from "../../domain/rhythm/tempo.ts";
import { SIGNATURE_INFO, type TimeSignature } from "../../domain/rhythm/meter.ts";
export const { min: MIN_BPM, max: MAX_BPM } = METRONOME_BPM_RANGE;
export const clampBpm = (value: number) => clampTempo(value, METRONOME_BPM_RANGE);
export const parseBpm = (value: string) => parseTempo(value, METRONOME_BPM_RANGE);
export { SIGNATURES, SIGNATURE_INFO, isTimeSignature, type TimeSignature } from "../../domain/rhythm/meter.ts";
export type BeatSound = "accent" | "normal" | "silent";
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
  volume: 1,
};

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
