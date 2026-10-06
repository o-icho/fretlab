// Build-time data access only. Never import this module from a client component.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { decodePublishedSummary } from "./content";
import { decodeTrackDetail, detailPath } from "./detail";
export function getBackingTracks() {
  const summaries = getBackingTrackSummaries();
  return summaries.map(summary => decodeTrackDetail(JSON.parse(readFileSync(join(process.cwd(), "public", detailPath(summary.slug)), "utf8")), summary));
}
export function getBackingTrackSummaries() {
  const raw: unknown = JSON.parse(readFileSync(join(process.cwd(), "public/backing-tracks/catalog.generated.json"), "utf8"));
  if (!Array.isArray(raw)) throw new Error("Catalogue généré invalide. Relancez generate:backing-tracks.");
  const summaries = raw.map(decodePublishedSummary);
  if (new Set(summaries.map(t => t.id)).size !== summaries.length) throw new Error("Identifiants du catalogue dupliqués.");
  return summaries;
}
