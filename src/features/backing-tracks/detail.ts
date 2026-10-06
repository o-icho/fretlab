import { decodeBackingTrackSummary, type BackingTrackSummary } from "../../domain/music/backingTracks.ts";
import { decodeContentTrack, trackPaths } from "./content.ts";
export function decodeTrackDetail(input: unknown, summary: BackingTrackSummary) {
  const track = decodeContentTrack(input);
  if (JSON.stringify(decodeBackingTrackSummary(track)) !== JSON.stringify(decodeBackingTrackSummary(summary))) throw new Error("Le détail du morceau ne correspond pas au catalogue.");
  return track;
}
export function detailPath(slug: string) {
  return trackPaths(slug).detailUrl;
}
export async function loadTrackDetail(summary: BackingTrackSummary, signal: AbortSignal, fetcher: typeof fetch = fetch) {
  const response = await fetcher(detailPath(summary.slug), { signal });
  if (!response.ok) throw new Error("Détail du morceau inaccessible. Réessayez.");
  return decodeTrackDetail(await response.json(), summary);
}
