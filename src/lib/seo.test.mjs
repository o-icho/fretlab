import test from "node:test";
import assert from "node:assert/strict";
import {
  pageMetadata,
  SOCIAL_IMAGE,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
} from "./metadata.ts";
import { sitemapEntries, PUBLIC_PATHS } from "./sitemap.ts";
import { loadArticles } from "../features/articles/lib/content.ts";
import { absoluteUrl, getPublicSiteUrl } from "./site.ts";
test("build web : domaine HTTPS explicite, pas de localhost ou IP", () => {
  assert.equal(getPublicSiteUrl("https://example.com/"), "https://example.com");
  for (const value of [undefined, "", "http://example.com", "https://localhost:3000", "https://127.0.0.1", "https://192.168.1.10", "https://[::1]", "https://fretlab.local", "https://fretlab.internal", "https://fretlab.test", "https://example.com/android", "https://example.com?token=x"]) {
    assert.throws(() => getPublicSiteUrl(value));
  }
});
test("canonical, OG et Twitter utilisent le même titre, résumé et domaine", () => {
  const metadata = pageMetadata("Accords", "Les doigtés", "/outils/accords");
  assert.equal(metadata.alternates.canonical, absoluteUrl("/outils/accords"));
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.openGraph.title, "Accords | FretLab");
  assert.equal(metadata.twitter.title, metadata.openGraph.title);
  assert.equal(metadata.twitter.description, metadata.description);
  assert.equal(metadata.twitter.images[0].url, SOCIAL_IMAGE.url);
  assert.deepEqual(
    pageMetadata(DEFAULT_TITLE, DEFAULT_DESCRIPTION, "/", true).title,
    { absolute: DEFAULT_TITLE },
  );
});
test("sitemap : toutes les pages publiques, sans doublon ni date inventée", () => {
  const articles = loadArticles();
  const entries = sitemapEntries(articles);
  assert.equal(entries.length, PUBLIC_PATHS.length + articles.length);
  assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);
  for (const path of PUBLIC_PATHS)
    assert.ok(entries.some((entry) => entry.url === absoluteUrl(path)));
  for (const entry of entries.slice(0, PUBLIC_PATHS.length))
    assert.equal("lastModified" in entry, false);
  for (const article of articles)
    assert.equal(
      entries.find(
        (entry) => entry.url === absoluteUrl(`/articles/${article.slug}`),
      ).lastModified,
      article.date,
    );
  const updated = { ...articles[0], updatedAt: "2026-10-04" };
  assert.equal(
    sitemapEntries([updated]).at(-1).lastModified,
    updated.updatedAt,
  );
});
