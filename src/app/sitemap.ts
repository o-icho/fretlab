import type { MetadataRoute } from "next";
import { getAllArticles } from "@/features/articles/lib/articles";
import { sitemapEntries } from "@/lib/sitemap";
import { getBackingTrackSummaries } from "@/features/backing-tracks/catalogue";
import { absoluteUrl } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [...sitemapEntries(getAllArticles()), ...getBackingTrackSummaries().map(track => ({ url: absoluteUrl(`/backing-tracks/${track.slug}`) }))];
}
