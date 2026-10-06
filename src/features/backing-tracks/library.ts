import type { BackingTrackSummary } from "../../domain/music/backingTracks.ts";
import { BACKING_TRACKS_PAGE_SIZE } from "./config.ts";
import { BACKING_TRACK_STYLES, BACKING_TRACK_TEMPO_RANGES, matchesTempoRange, styleId, type BackingTrackTempoRangeId } from "./filterConfig.ts";
import { BACKING_TRACK_KEYS, normalizeBackingTrackKeyRoot, type BackingTrackKeyRoot } from "./keys.ts";
export interface TrackFilters { genre?: string; key?: BackingTrackKeyRoot; tempoRange?: BackingTrackTempoRangeId; page: number }
export function filterOptions() {
  return { styles: BACKING_TRACK_STYLES, keys: BACKING_TRACK_KEYS };
}
export function readFilters(params: URLSearchParams): TrackFilters {
  const options = filterOptions();
  const positive = (key: string) => { const raw = params.get(key); if (!raw || !/^\d+(\.\d+)?$/.test(raw)) return undefined; const n = Number(raw); return Number.isFinite(n) && n > 0 ? n : undefined; };
  const genre = styleId(params.get("genre") ?? undefined);
  const key = options.keys.find(k => k.id === params.get("key"))?.id;
  const tempoRange = BACKING_TRACK_TEMPO_RANGES.find(r => r.id === params.get("tempo"))?.id;
  const page = positive("page");
  return { genre, key, tempoRange, page: page && Number.isSafeInteger(page) ? page : 1 };
}
export function queryTracks(tracks: readonly BackingTrackSummary[], filters: TrackFilters, pageSize = BACKING_TRACKS_PAGE_SIZE) {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error("Taille de page invalide.");
  const matching = tracks.filter(t => (!filters.genre || styleId(t.style) === filters.genre) && (!filters.key || normalizeBackingTrackKeyRoot(t.key) === filters.key) && matchesTempoRange(t.bpm, filters.tempoRange));
  const pages = Math.max(1, Math.ceil(matching.length / pageSize));
  const page = Math.max(1, Math.min(pages, filters.page));
  return { items: matching.slice((page - 1) * pageSize, page * pageSize), total: matching.length, page, pages };
}
export function filterQuery(filters: TrackFilters): string {
  const params = new URLSearchParams();
  if (filters.genre) params.set("genre", filters.genre);
  if (filters.key) params.set("key", filters.key);
  if (filters.tempoRange) params.set("tempo", filters.tempoRange);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}
