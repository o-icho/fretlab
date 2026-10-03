import { getAllArticles } from "@/features/articles/lib/articles";
import { toSummary } from "@/features/articles/lib/content";
import { ArticleGrid } from "@/features/articles/components/ArticleGrid";
export function ArticleCards() {
  return <ArticleGrid articles={getAllArticles().slice(0, 3).map(toSummary)} />;
}
