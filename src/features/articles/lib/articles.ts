import { cache } from "react";
import { loadArticles, selectRelatedArticles } from "./content.ts";
export const getAllArticles = cache(() => loadArticles());
export function getArticleBySlug(slug: string) {
  return getAllArticles().find((article) => article.slug === slug) ?? null;
}
export function getRelatedArticles(slug: string, limit = 3) {
  const current = getArticleBySlug(slug);
  return current ? selectRelatedArticles(getAllArticles(), current, limit) : [];
}
