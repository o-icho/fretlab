export interface ChordEvent {
  symbol: string; startMs: number; endMs: number;
  source?: "midi" | "audio" | "manual";
  /** Editorial confidence, from 0 to 1; never inferred by the player. */
  confidence?: number;
}
export const DEFAULT_TIMELINE_END_TOLERANCE_MS = 50;
export interface TimelineValidationOptions { endToleranceMs?: number }
export interface BackingTrackSummary {
  id: string; slug: string; title: string; style?: string;
  bpm: number; key: string; durationMs: number;
}
export interface BackingTrack extends BackingTrackSummary {
  audio: { backingUrl: string; exampleUrl?: string; exampleOffsetMs: number };
  chordTimeline: ChordEvent[];
  /** Strict editorial coverage boundary, in backing milliseconds. Never inferred. */
  chordCoverageEndMs?: number;
}
export type TrackMode = "BACKING" | "EXAMPLE";

/** Root-relative packaged assets or HTTPS; no script/data URLs or credentials. */
export function validAudioUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value || value !== value.trim() || /[\s\\]/.test(value)) return false;
  try {
    const url = new URL(value, "https://fretlab.invalid");
    return (value.startsWith("/") && !value.startsWith("//") || value.startsWith("https://")) && url.protocol === "https:" && !url.username && !url.password && !url.hash;
  } catch { return false; }
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Fiche de morceau invalide.");
  return value as Record<string, unknown>;
}
function text(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim() || value.length > 200) throw new Error(`${field} manquant ou invalide.`);
  return value.trim();
}
function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Valeur numérique invalide.");
  return value;
}
export function decodeBackingTrackSummary(input: unknown): BackingTrackSummary {
  const raw = object(input);
  const id = text(raw.id, "Identifiant"), slug = text(raw.slug, "Slug");
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(id) || !/^[a-z0-9][a-z0-9_-]*$/.test(slug)) throw new Error("Identifiant ou slug invalide.");
  const durationMs = number(raw.durationMs), bpm = number(raw.bpm);
  if (durationMs <= 0 || bpm <= 0) throw new Error("Durée ou tempo invalide.");
  return { id, slug, title: text(raw.title, "Titre"), ...(raw.style === undefined ? {} : { style: text(raw.style, "Style") }), bpm, key: text(raw.key, "Tonalité"), durationMs };
}
export function decodeBackingTrack(input: unknown, options: TimelineValidationOptions = {}): BackingTrack {
  const tolerance = number(options.endToleranceMs ?? DEFAULT_TIMELINE_END_TOLERANCE_MS);
  if (tolerance < 0) throw new Error("Tolérance de fin négative.");
  const summary = decodeBackingTrackSummary(input), { durationMs } = summary;
  const raw = object(input), audio = object(raw.audio), offset = number(audio.exampleOffsetMs);
  const coverage = raw.chordCoverageEndMs === undefined ? undefined : number(raw.chordCoverageEndMs);
  if (coverage !== undefined && (coverage < 0 || coverage > durationMs)) throw new Error("Couverture harmonique hors durée du backing.");
  if (Math.abs(offset) >= durationMs) throw new Error("Décalage invalide.");
  if (!validAudioUrl(audio.backingUrl)) throw new Error("URL du backing invalide : utilisez un chemin /audio/… ou HTTPS.");
  if (audio.exampleUrl !== undefined && typeof audio.exampleUrl !== "string") throw new Error("URL de l’exemple invalide.");
  // An invalid optional example is isolated by the player, never blocking the backing.
  if (!Array.isArray(raw.chordTimeline) || raw.chordTimeline.length > 10000) throw new Error("Timeline invalide.");
  let previousEnd = 0;
  const chordTimeline = raw.chordTimeline.map((value): ChordEvent => {
    const event = object(value), startMs = number(event.startMs), endMs = number(event.endMs);
    if (startMs < 0 || startMs < previousEnd || startMs >= durationMs || endMs <= startMs || endMs - durationMs > tolerance) throw new Error("Timeline non chronologique, chevauchante ou hors durée.");
    if (coverage !== undefined && endMs > coverage) throw new Error("Accord au-delà de la couverture harmonique.");
    if (event.source !== undefined && event.source !== "midi" && event.source !== "audio" && event.source !== "manual") throw new Error("Source éditoriale invalide.");
    const confidence = event.confidence === undefined ? undefined : number(event.confidence);
    if (confidence !== undefined && (confidence < 0 || confidence > 1)) throw new Error("La confiance doit être comprise entre 0 et 1.");
    previousEnd = endMs;
    // Preserve annotations and exact times. No filling, stretching or MIDI-derived duration.
    return { symbol: text(event.symbol, "Accord"), startMs, endMs,
      ...(event.source === undefined ? {} : { source: event.source }),
      ...(confidence === undefined ? {} : { confidence }) };
  });
  return { ...summary,
    ...(coverage === undefined ? {} : { chordCoverageEndMs: coverage }),
    audio: { backingUrl: audio.backingUrl, exampleUrl: audio.exampleUrl as string | undefined, exampleOffsetMs: offset }, chordTimeline };
}
/** Half-open intervals: a boundary belongs to the next event. O(log n), including gaps. */
export function chordsAt(timeline: readonly ChordEvent[], timeMs: number, coverageEndMs?: number): { current?: ChordEvent; next?: ChordEvent } {
  if (coverageEndMs !== undefined && timeMs >= coverageEndMs) return {};
  let low = 0, high = timeline.length;
  while (low < high) { const mid = (low + high) >>> 1; if (timeline[mid].endMs <= timeMs) low = mid + 1; else high = mid; }
  const candidate = timeline[low];
  return candidate && candidate.startMs <= timeMs ? { current: candidate, next: timeline[low + 1] } : { next: candidate };
}
/** Positive offset = extra lead-in in the example. Timeline always uses backing time. */
export function mediaTimeMs(referenceMs: number, mode: TrackMode, offsetMs: number): number { return referenceMs + (mode === "EXAMPLE" ? offsetMs : 0); }
export function referenceTimeMs(mediaMs: number, mode: TrackMode, offsetMs: number): number { return mediaMs - (mode === "EXAMPLE" ? offsetMs : 0); }
/** Raw logical backing time, including negative lead-in if the example has one. */
export function getBackingLogicalTimeMs(audioCurrentTimeSeconds: number, mode: TrackMode, exampleOffsetMs: number): number {
  return referenceTimeMs(audioCurrentTimeSeconds * 1000, mode, exampleOffsetMs);
}
