import { clampBpm } from "./tempo.ts";

export type DrumInstrument = "kick" | "snare" | "closed-hat" | "open-hat" | "crash" | "ride" | "tom-low" | "tom-high";
export type DrumStyle = "rock" | "blues" | "funk" | "metal" | "pop";
export type Meter = { beats: number; beatUnit: 4 | 8; pulseBeats: number };
export type DrumEvent = { position: { bar: number; beat: number; part: number }; velocity: number };
export type DrumTrack = { instrument: DrumInstrument; muted?: boolean; events: readonly DrumEvent[] };
export type DrumPattern = {
  id: string; name: string; style: DrumStyle; description: string;
  meter: Meter; bars: number; subdivision: number; tracks: readonly DrumTrack[];
};
export type DrumHit = { instrument: DrumInstrument; velocity: number };
export const DRUM_INSTRUMENTS: DrumInstrument[] = ["kick", "snare", "closed-hat", "open-hat", "crash", "ride", "tom-low", "tom-high"];
export function stepsPerBar(pattern: DrumPattern): number { return pattern.meter.beats * pattern.subdivision; }
export function stepSeconds(pattern: DrumPattern, bpm: number): number {
  return 60 / clampBpm(bpm) / pattern.meter.pulseBeats / pattern.subdivision;
}
export function hitsAt(pattern: DrumPattern, bar: number, step: number): DrumHit[] {
  return pattern.tracks.filter((track) => !track.muted).flatMap((track) => track.events
    .filter((event) => event.position.bar === bar && event.position.beat * pattern.subdivision + event.position.part === step)
    .map((event) => ({ instrument: track.instrument, velocity: event.velocity })));
}
export function validatePattern(pattern: DrumPattern): void {
  const m = pattern.meter;
  if (!pattern.id || !pattern.name || !pattern.description || !["rock", "blues", "funk", "metal", "pop"].includes(pattern.style)) throw new RangeError("Pattern incomplet.");
  if (!((m.beatUnit === 4 && [3, 4].includes(m.beats) && m.pulseBeats === 1) || (m.beatUnit === 8 && m.beats === 6 && m.pulseBeats === 3))) throw new RangeError("Signature non prise en charge.");
  if (!Number.isInteger(pattern.bars) || pattern.bars < 1 || pattern.bars > 32 || ![1, 2, 3, 4].includes(pattern.subdivision)) throw new RangeError("Mesures ou subdivision invalides.");
  const instruments = new Set<DrumInstrument>();
  for (const track of pattern.tracks) {
    if (!DRUM_INSTRUMENTS.includes(track.instrument) || instruments.has(track.instrument)) throw new RangeError("Piste invalide ou dupliquée.");
    if (track.muted !== undefined && typeof track.muted !== "boolean") throw new RangeError("Mute invalide.");
    instruments.add(track.instrument);
    const positions = new Set<string>();
    for (const { position: p, velocity } of track.events) {
      if (!Number.isInteger(p.bar) || p.bar < 0 || p.bar >= pattern.bars || !Number.isInteger(p.beat) || p.beat < 0 || p.beat >= m.beats || !Number.isInteger(p.part) || p.part < 0 || p.part >= pattern.subdivision || !Number.isFinite(velocity) || velocity <= 0 || velocity > 1) throw new RangeError("Événement invalide.");
      const key = `${p.bar}:${p.beat}:${p.part}`;
      if (positions.has(key)) throw new RangeError("Événement dupliqué.");
      positions.add(key);
    }
  }
}

export type DrumCursor = { time: number; step: number; bar: number; pattern: DrumPattern; pending: DrumPattern | null; countIn: number };
export type DrumStep = { time: number; step: number; bar: number; pattern: DrumPattern; countIn: number; hits: DrumHit[]; click: "accent" | "beat" | null };
export function startDrumCursor(pattern: DrumPattern, time: number, countIn: number): DrumCursor {
  validatePattern(pattern);
  if (!Number.isFinite(time) || time < 0 || ![0, 1, 2].includes(countIn)) throw new RangeError("Départ invalide.");
  return { time, step: 0, bar: 0, pattern, pending: null, countIn };
}
export function queuePattern(cursor: DrumCursor, pattern: DrumPattern): DrumCursor {
  validatePattern(pattern);
  // Step zero has not been scheduled yet: this boundary is still available.
  if (cursor.step === 0) return { ...cursor, pattern, bar: 0, pending: null };
  return { ...cursor, pending: pattern === cursor.pattern ? null : pattern };
}
function advance(cursor: DrumCursor, bpm: number): DrumCursor {
  const next = { ...cursor, time: cursor.time + stepSeconds(cursor.pattern, bpm), step: cursor.step + 1 };
  if (next.step < stepsPerBar(next.pattern)) return next;
  next.step = 0;
  next.bar = next.countIn > 0 ? 0 : (next.bar + 1) % next.pattern.bars;
  next.countIn = Math.max(0, next.countIn - 1);
  if (next.pending) { next.pattern = next.pending; next.pending = null; next.bar = 0; }
  return next;
}
/** One shared audio horizon; old steps are skipped, never replayed in a burst. */
export function planDrumSteps(cursor: DrumCursor, now: number, horizon: number, bpm: number): { events: DrumStep[]; next: DrumCursor } {
  if (!Number.isFinite(now) || !Number.isFinite(horizon) || horizon < 0) throw new RangeError("Horloge invalide.");
  let next = cursor;
  // Resolve a queued change/count-in at its boundary before skipping whole cycles.
  while (next.time < now && (next.pending || next.countIn > 0)) next = advance(next, bpm);
  const cycleSteps = stepsPerBar(next.pattern) * next.pattern.bars;
  const cycleSeconds = cycleSteps * stepSeconds(next.pattern, bpm);
  if (next.time < now) {
    const cycles = Math.floor((now - next.time) / cycleSeconds);
    if (cycles > 0) next = { ...next, time: next.time + cycles * cycleSeconds };
  }
  const events: DrumStep[] = [];
  while (next.time < now + horizon) {
    if (next.time >= now) {
      const pulse = next.step % (next.pattern.subdivision * next.pattern.meter.pulseBeats) === 0;
      events.push({ time: next.time, step: next.step, bar: next.bar, pattern: next.pattern, countIn: next.countIn,
        hits: next.countIn ? [] : hitsAt(next.pattern, next.bar, next.step),
        click: next.countIn && pulse ? (next.step === 0 ? "accent" : "beat") : null });
    }
    next = advance(next, bpm);
  }
  return { events, next };
}
