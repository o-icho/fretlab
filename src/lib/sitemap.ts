import { absoluteUrl } from "./site.ts";
import type { ArticleSummary } from "../features/articles/lib/content.ts";
export const PUBLIC_PATHS = [
  "/",
  "/outils/accords",
  "/outils/metronome",
  "/outils/accordeur",
  "/outils/transposeur",
  "/outils/gammes",
  "/outils/progressions",
  "/outils/boite-a-rythmes",
  "/backing-tracks",
  "/articles",
  "/a-propos",
] as const;
export function sitemapEntries(
  articles: ArticleSummary[],
): { url: string; lastModified?: string }[] {
  return [
    ...PUBLIC_PATHS.map((path) => ({ url: absoluteUrl(path) })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: article.updatedAt ?? article.date,
    })),
  ];
}
