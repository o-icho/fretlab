import { DRUM_INSTRUMENTS, meterForSignature, stepsPerBar, validatePattern, type DrumInstrument, type DrumPattern, type DrumTrack } from "../../../domain/rhythm/drums.ts";
import type { TimeSignature } from "../../../domain/rhythm/meter.ts";

/** A saved user pattern is the player's exact model plus persistence metadata. */
export type UserPattern = DrumPattern & { createdAt: string; updatedAt: string; basedOnPresetId?: string };
export function isUserPattern(pattern: DrumPattern): pattern is UserPattern {
  return "createdAt" in pattern && "updatedAt" in pattern;
}
export function patternName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 80) throw new RangeError("Choisissez un nom de 1 à 80 caractères.");
  return trimmed;
}
function updated(pattern: UserPattern, now: string): UserPattern {
  if (!Number.isFinite(Date.parse(now))) throw new RangeError("Date invalide.");
  return { ...pattern, updatedAt: new Date(Math.max(Date.parse(now), Date.parse(pattern.createdAt))).toISOString() };
}
function userIdentity(id: string, now: string) {
  if (!/^user-[a-zA-Z0-9-]{1,80}$/.test(id) || !Number.isFinite(Date.parse(now))) throw new RangeError("Identité ou date invalide.");
  const date = new Date(now).toISOString();
  return { id, createdAt: date, updatedAt: date };
}
export function blankUserPattern(source: DrumPattern, id: string, now: string): UserPattern {
  if (id === source.id) throw new RangeError("Identité déjà utilisée.");
  return {
    ...userIdentity(id, now), name: "Mon rythme", description: "Rythme personnel.", style: source.style,
    meter: { ...source.meter }, subdivision: 16 / source.meter.beatUnit, bars: 1, tracks: [],
  };
}
export function copyUserPattern(source: DrumPattern, id: string, now: string): UserPattern {
  if (id === source.id) throw new RangeError("Identité déjà utilisée.");
  const name = `${source.name.slice(0, 72)} - copie`;
  const basedOnPresetId = isUserPattern(source) ? source.basedOnPresetId : source.id;
  const copy: UserPattern = { ...structuredClone(source), ...userIdentity(id, now), name, basedOnPresetId };
  validatePattern(copy);
  return copy;
}
function replaceTrack(pattern: UserPattern, instrument: DrumInstrument, transform: (track: DrumTrack) => DrumTrack, now: string): UserPattern {
  if (!DRUM_INSTRUMENTS.includes(instrument)) throw new RangeError("Instrument invalide.");
  const track = pattern.tracks.find((value) => value.instrument === instrument) ?? { instrument, events: [] };
  const next = transform(track);
  const tracks = pattern.tracks.some((value) => value.instrument === instrument)
    ? pattern.tracks.map((value) => value.instrument === instrument ? next : value)
    : [...pattern.tracks, next];
  const result = updated({ ...pattern, tracks }, now);
  validatePattern(result);
  return result;
}
export function nextStepVelocity(previousVelocity = 0): number {
  if (previousVelocity === 0) return 0.75;
  return previousVelocity < 1 ? 1 : 0;
}
export function cycleStep(pattern: UserPattern, instrument: DrumInstrument, bar: number, step: number, now: string): UserPattern {
  if (!Number.isInteger(bar) || bar < 0 || bar >= pattern.bars || !Number.isInteger(step) || step < 0 || step >= stepsPerBar(pattern)) throw new RangeError("Pas invalide.");
  const beat = Math.floor(step / pattern.subdivision), part = step % pattern.subdivision;
  return replaceTrack(pattern, instrument, (track) => {
    const matches = (event: DrumTrack["events"][number]) => event.position.bar === bar && event.position.beat === beat && event.position.part === part;
    const previous = track.events.find(matches);
    const events = track.events.filter((event) => !matches(event));
    // Preserve preset dynamics until a cell is edited; accents are exactly 1.0.
    const velocity = nextStepVelocity(previous?.velocity);
    if (velocity > 0) events.push({ position: { bar, beat, part }, velocity });
    events.sort((a, b) => a.position.bar - b.position.bar || a.position.beat - b.position.beat || a.position.part - b.position.part);
    return { ...track, events };
  }, now);
}
export function toggleTrackMute(pattern: UserPattern, instrument: DrumInstrument, now: string): UserPattern {
  return replaceTrack(pattern, instrument, (track) => ({ ...track, muted: !track.muted }), now);
}
export function clearUserPattern(pattern: UserPattern, now: string): UserPattern {
  return updated({ ...pattern, tracks: pattern.tracks.map((track) => ({ ...track, events: [] })) }, now);
}
export function renameUserPattern(pattern: UserPattern, name: string, now: string): UserPattern {
  return updated({ ...pattern, name: patternName(name) }, now);
}
export function changePatternBars(pattern: UserPattern, bars: number, now: string): UserPattern {
  if (!Number.isInteger(bars) || bars < 1 || bars > 32) throw new RangeError("Choisissez de 1 à 32 mesures.");
  if (pattern.bars === bars) return pattern;
  const tracks = bars >= pattern.bars ? pattern.tracks : pattern.tracks.map(track => ({
    ...track, events: track.events.filter(event => event.position.bar < bars),
  }));
  return updated({ ...pattern, bars, tracks }, now);
}
export function changePatternSignature(pattern: UserPattern, signature: TimeSignature, now: string): UserPattern {
  const meter = meterForSignature(signature);
  if (pattern.meter.beats === meter.beats && pattern.meter.beatUnit === meter.beatUnit) return pattern;
  // The new grid must contain every old grid line. When a triplet or quarter
  // crosses an eighth-note boundary, split its steps in two rather than rounding.
  const partsPerUnit = pattern.subdivision * pattern.meter.beatUnit / meter.beatUnit;
  const subdivision = Number.isInteger(partsPerUnit) ? partsPerUnit : partsPerUnit * 2;
  const stepRatio = subdivision / partsPerUnit;
  const tracks = pattern.tracks.map(track => ({
    ...track,
    events: track.events.flatMap(event => {
      const { bar, beat, part } = event.position;
      const step = (beat * pattern.subdivision + part) * stepRatio;
      if (step >= meter.beats * subdivision) return [];
      return [{ ...event, position: { bar, beat: Math.floor(step / subdivision), part: step % subdivision } }];
    }),
  }));
  return updated({ ...pattern, meter, subdivision, tracks }, now);
}
export function resetUserPattern(pattern: UserPattern, preset: DrumPattern, now: string): UserPattern {
  if (pattern.basedOnPresetId !== preset.id || isUserPattern(preset)) throw new RangeError("Preset d’origine incompatible.");
  return updated({ ...structuredClone(preset), id: pattern.id, name: pattern.name, createdAt: pattern.createdAt, updatedAt: pattern.updatedAt, basedOnPresetId: preset.id }, now);
}
