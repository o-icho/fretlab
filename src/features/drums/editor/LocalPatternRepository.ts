import { validatePattern, type DrumPattern } from "../../../domain/rhythm/drums.ts";
import { patternName, type UserPattern } from "./patternEditing.ts";
import type { PatternRepository } from "./PatternRepository.ts";

export const PATTERN_STORAGE_KEY = "fretlab.drum-patterns";
export const PATTERN_SCHEMA_VERSION = 1;
type StoragePort = Pick<Storage, "getItem" | "setItem">;
type ObjectValue = Record<string, unknown>;
function object(value: unknown): ObjectValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Données de patterns invalides.");
  return value as ObjectValue;
}
function date(value: unknown): string {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) throw new Error("Date de pattern invalide.");
  return value;
}
export function decodeUserPattern(input: unknown): UserPattern {
  const raw = object(input);
  if (typeof raw.id !== "string" || !/^user-[a-zA-Z0-9-]{1,80}$/.test(raw.id) || typeof raw.name !== "string" || typeof raw.description !== "string" || !raw.description || raw.description.length > 500) throw new Error("Identité de pattern invalide.");
  const createdAt = date(raw.createdAt), updatedAt = date(raw.updatedAt);
  if (updatedAt < createdAt) throw new Error("Dates de pattern incohérentes.");
  if (raw.basedOnPresetId !== undefined && (typeof raw.basedOnPresetId !== "string" || !/^[a-z0-9-]{1,80}$/.test(raw.basedOnPresetId))) throw new Error("Origine de pattern invalide.");
  const meter = object(raw.meter);
  if (!Array.isArray(raw.tracks) || raw.tracks.length > 8) throw new Error("Pistes invalides.");
  const tracks = raw.tracks.map((inputTrack: unknown) => {
    const track = object(inputTrack);
    if (!Array.isArray(track.events) || track.events.length > 768 || (track.muted !== undefined && typeof track.muted !== "boolean")) throw new Error("Piste invalide.");
    return { instrument: track.instrument, muted: track.muted ?? false, events: track.events.map((inputEvent: unknown) => {
      const event = object(inputEvent), position = object(event.position);
      return { position: { bar: position.bar, beat: position.beat, part: position.part }, velocity: event.velocity };
    }) };
  });
  const pattern = { id: raw.id, name: patternName(raw.name), description: raw.description, style: raw.style,
    meter: { beats: meter.beats, beatUnit: meter.beatUnit, pulseBeats: meter.pulseBeats }, bars: raw.bars, subdivision: raw.subdivision, tracks };
  // Structural checks above precede the shared musical validator; no unchecked JSON reaches the player.
  validatePattern(pattern as DrumPattern);
  return { ...pattern as DrumPattern, createdAt, updatedAt, ...(raw.basedOnPresetId ? { basedOnPresetId: raw.basedOnPresetId as string } : {}) };
}
export function decodePatternLibrary(json: string | null): UserPattern[] {
  if (json === null) return [];
  if (json.length > 1_000_000) throw new Error("Bibliothèque locale trop volumineuse.");
  const raw = object(JSON.parse(json));
  if (raw.schemaVersion !== PATTERN_SCHEMA_VERSION) throw new Error("Version de bibliothèque non prise en charge. Les données existantes sont conservées.");
  if (!Array.isArray(raw.patterns) || raw.patterns.length > 100) throw new Error("Bibliothèque de patterns invalide.");
  const patterns = raw.patterns.map(decodeUserPattern);
  if (new Set(patterns.map((pattern) => pattern.id)).size !== patterns.length) throw new Error("Identifiants de patterns dupliqués.");
  return patterns;
}

export class LocalPatternRepository implements PatternRepository {
  private storage: () => StoragePort;
  constructor(storage: StoragePort | (() => StoragePort) = () => window.localStorage) {
    this.storage = typeof storage === "function" ? storage : () => storage;
  }
  list(): UserPattern[] {
    try { return decodePatternLibrary(this.storage().getItem(PATTERN_STORAGE_KEY)); }
    catch (error) {
      if (error instanceof Error && error.message.startsWith("Version de bibliothèque")) throw error;
      throw new Error("Bibliothèque locale illisible ou stockage indisponible. Les données existantes sont conservées.");
    }
  }
  private write(patterns: UserPattern[]) {
    if (patterns.length > 100) throw new Error("Limite de 100 patterns atteinte. Supprimez un pattern avant d’en ajouter un.");
    const json = JSON.stringify({ schemaVersion: PATTERN_SCHEMA_VERSION, patterns });
    if (json.length > 1_000_000) throw new Error("Bibliothèque locale trop volumineuse.");
    try { this.storage().setItem(PATTERN_STORAGE_KEY, json); }
    catch { throw new Error("Sauvegarde impossible : stockage local indisponible ou plein. Votre édition reste ouverte."); }
  }
  save(pattern: UserPattern): void {
    const value = decodeUserPattern(pattern);
    const patterns = this.list(); // Refuse to overwrite corrupt/unknown schema data.
    const previous = patterns.find((item) => item.id === value.id);
    if (previous && (previous.createdAt !== value.createdAt || previous.updatedAt > value.updatedAt)) throw new Error("Une version plus récente existe. Dupliquez votre édition pour la conserver séparément.");
    this.write([...patterns.filter((item) => item.id !== value.id), value]);
  }
  remove(id: string): void {
    this.write(this.list().filter((pattern) => pattern.id !== id));
  }
}
