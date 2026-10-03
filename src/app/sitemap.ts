import type { MetadataRoute } from "next";
import { getAllArticles } from "@/features/articles/lib/articles";
import { sitemapEntries } from "@/lib/sitemap";
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(getAllArticles());
}
