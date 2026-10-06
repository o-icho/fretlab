import { absoluteUrl } from "./site.ts";
import { getEnabledFeatures } from "../config/features.ts";
import type { ArticleSummary } from "../features/articles/lib/content.ts";
export const PUBLIC_PATHS = [
  "/",
  ...getEnabledFeatures().map(feature => feature.href),
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
