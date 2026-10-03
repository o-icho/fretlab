import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/Container";
import { ArticleGrid } from "@/features/articles/components/ArticleGrid";
import { ArticleIndex } from "@/features/articles/components/ArticleIndex";
import { getAllArticles } from "@/features/articles/lib/articles";
import { toSummary } from "@/features/articles/lib/content";

const description =
  "Des guides pratiques pour apprendre les accords, travailler votre rythme, accorder votre guitare et transposer vos morceaux.";
export const metadata = pageMetadata(
  "Articles et conseils guitare",
  description,
  "/articles",
);
export default function ArticlesPage() {
  const articles = getAllArticles().map(toSummary);
  const categories = [
    ...new Set(articles.map((article) => article.category)),
  ].sort();
  const sections = ["Tous", ...categories].map((category) => {
    const matching =
      category === "Tous"
        ? articles
        : articles.filter((article) => article.category === category);
    return {
      category,
      count: matching.length,
      content: <ArticleGrid articles={matching} />,
    };
  });
  return (
    <Container>
      <section className="page-intro">
        <p className="eyebrow">LE JOURNAL FRETLAB</p>
        <h1>Progresser à la guitare</h1>
        <p>
          Des repères simples, des exercices concrets et de bonnes habitudes
          pour prendre plaisir à jouer.
        </p>
      </section>
      <ArticleIndex sections={sections} />
    </Container>
  );
}
