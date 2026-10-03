import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  loadArticles,
  parseArticle,
  selectRelatedArticles,
  toSummary,
  headingSlug,
} from "./content.ts";
import { getArticleBySlug } from "./articles.ts";
import { articleStructuredData, serializeJsonLd } from "./seo.ts";
import { getSiteUrl, absoluteUrl } from "../../../lib/site.ts";
const articles = loadArticles();
const fixture = (body = "## Un conseil\n\nUne phrase utile.", extra = "") =>
  `---\ntitle: Exemple\ndescription: Un guide\nslug: exemple\ndate: "2026-10-03"\nauthor: FretLab\ncategory: Accords\ntags: [guitare]\ntool: accords\n${extra}---\n${body}`;
test("les cinq articles ont les métadonnées, positions de lecture et liens requis", () => {
  assert.equal(articles.length, 5);
  for (const article of articles) {
    assert.ok(article.readingMinutes >= 1);
    assert.ok(article.headings.length > 1);
    assert.ok(article.links.includes(`/outils/${article.tool}`));
    assert.ok(article.links.some((link) => link.startsWith("/articles/")));
    assert.ok(article.title && article.description && article.author);
  }
  assert.deepEqual(
    articles.map((a) => a.slug),
    [...articles]
      .sort(
        (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
      )
      .map((a) => a.slug),
  );
});
test("recherche par slug et rejet des chemins inconnus", () => {
  assert.equal(getArticleBySlug(articles[0].slug)?.title, articles[0].title);
  assert.equal(getArticleBySlug("inconnu"), null);
  assert.equal(getArticleBySlug("../../package.json"), null);
});
test("validation des dates, champs, nom du fichier et contenu", () => {
  assert.throws(() =>
    parseArticle(fixture().replace("title: Exemple", "title:"), "exemple.md"),
  );
  assert.throws(() =>
    parseArticle(fixture().replace("2026-10-03", "2026-02-30"), "exemple.md"),
  );
  assert.throws(() => parseArticle(fixture(), "autre.md"));
  assert.throws(() => parseArticle(fixture("# Titre interdit"), "exemple.md"));
  assert.throws(() => parseArticle(fixture(""), "exemple.md"));
  assert.throws(() =>
    parseArticle(fixture(undefined, 'updatedAt: "2025-01-01"\n'), "exemple.md"),
  );
});
test("sommaire issu du Markdown, accents et titres identiques", () => {
  const article = parseArticle(
    fixture("## Écouter !\n\n### Écouter !\n\n```\n## Faux titre\n```"),
    "exemple.md",
  );
  assert.deepEqual(
    article.headings.map((h) => h.id),
    ["ecouter", "ecouter-2"],
  );
  assert.equal(headingSlug("Les accords à l’essai"), "les-accords-a-l-essai");
});
test("lecture calculée et résumés sans corps de contenu", () => {
  const article = parseArticle(
    fixture(Array(401).fill("mot").join(" ")),
    "exemple.md",
  );
  assert.equal(article.readingMinutes, 3);
  assert.equal("content" in toSummary(article), false);
  assert.equal("headings" in toSummary(article), false);
});
test("articles associés sans article courant, pertinence et limite", () => {
  const current = articles.find((a) => a.slug === "accords-guitare-debutant");
  const related = selectRelatedArticles(articles, current, 2);
  assert.equal(related.length, 2);
  assert.ok(related.every((a) => a.slug !== current.slug));
  assert.equal(related[0].category, "Accords");
  assert.deepEqual(selectRelatedArticles(articles, current, 0), []);
});
test("un lien éditorial cassé est détecté avant publication", () => {
  const directory = mkdtempSync(join(tmpdir(), "fretlab-articles-test-"));
  try {
    writeFileSync(
      join(directory, "exemple.md"),
      fixture("[Outil](/outils/accords)\n\n[Article](/articles/inconnu)"),
    );
    assert.throws(() => loadArticles(directory), /lien cassé/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
test("SEO reprend les données réelles et protège le script JSON-LD", () => {
  const article = articles[0];
  const [schema, breadcrumb] = articleStructuredData(article);
  assert.equal(schema.headline, article.title);
  assert.equal(schema.datePublished, article.date);
  assert.equal(
    schema.mainEntityOfPage,
    absoluteUrl(`/articles/${article.slug}`),
  );
  assert.equal(schema.author.name, article.author);
  assert.equal("dateModified" in schema, false);
  assert.equal(
    articleStructuredData({ ...article, updatedAt: "2026-10-04" })[0]
      .dateModified,
    "2026-10-04",
  );
  assert.equal(breadcrumb.itemListElement.length, 3);
  assert.equal(serializeJsonLd({ title: "</script>" }).includes("<"), false);
  assert.deepEqual(JSON.parse(serializeJsonLd(schema)), schema);
});
test("domaine canonical configurable et validé", () => {
  assert.equal(
    getSiteUrl("https://fretlab.example/"),
    "https://fretlab.example",
  );
  for (const url of [
    "https://fretlab.example/articles",
    "ftp://fretlab.example",
    "https://user:pass@fretlab.example",
    "https://fretlab.example?q=x",
  ])
    assert.throws(() => getSiteUrl(url));
});
