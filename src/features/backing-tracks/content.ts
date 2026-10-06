import { decodeBackingTrack, decodeBackingTrackSummary, type BackingTrackSummary } from "../../domain/music/backingTracks.ts";

export const TRACK_ID = /^[a-z0-9][a-z0-9_-]*$/;
export const BACKING_FILE = /^Backingtrack_([a-z0-9][a-z0-9_-]*)\.mp3$/;
export const EXAMPLE_FILE = /^Example_([a-z0-9][a-z0-9_-]*)\.mp3$/;
export const TRACK_FILE = /^Track_([a-z0-9][a-z0-9_-]*)\.json$/;

/** Published content enriches the existing summary; local imports keep their model. */
export interface PublishedTrackSummary extends BackingTrackSummary {
  folder: string;
  backingUrl: string;
  exampleUrl: string;
  detailUrl: string;
}
export function trackPaths(id: string) {
  if (!TRACK_ID.test(id)) throw new Error(`Identifiant de dossier invalide : ${id}`);
  const base = `/backing-tracks/${id}`;
  return { folder: id, backingUrl: `${base}/Backingtrack_${id}.mp3`, exampleUrl: `${base}/Example_${id}.mp3`, detailUrl: `${base}/Track_${id}.json` };
}
export function decodeContentTrack(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Track JSON invalide.");
  const raw = input as Record<string, unknown>;
  if (typeof raw.id !== "string") throw new Error("Identifiant JSON manquant.");
  const paths = trackPaths(raw.id);
  if (raw.audio !== undefined || raw.backingUrl !== undefined || raw.exampleUrl !== undefined) throw new Error("Les URLs audio sont déduites des noms de fichiers, pas stockées dans Track JSON.");
  if (raw.slug !== undefined && raw.slug !== raw.id) throw new Error("Le slug doit correspondre au dossier.");
  if (raw.schemaVersion !== undefined && raw.schemaVersion !== 1) throw new Error("Version de Track JSON non supportée.");
  // analysis is deliberately ignored. Only an explicit editorial offset affects playback.
  return decodeBackingTrack({ ...raw, slug: raw.id, audio: { backingUrl: paths.backingUrl, exampleUrl: paths.exampleUrl, exampleOffsetMs: raw.exampleOffsetMs ?? 0 } });
}
export function decodePublishedSummary(input: unknown): PublishedTrackSummary {
  const summary = decodeBackingTrackSummary(input);
  const raw = input as Record<string, unknown>, paths = trackPaths(summary.id);
  if (summary.slug !== summary.id || Object.entries(paths).some(([key, value]) => raw[key] !== value)) throw new Error("Catalogue généré incohérent avec les conventions de fichiers.");
  return { ...summary, ...paths };
}
