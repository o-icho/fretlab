import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { ArticleGrid } from "@/features/articles/components/ArticleGrid";
import { MarkdownContent } from "@/features/articles/components/MarkdownContent";
import styles from "@/features/articles/components/articles.module.css";
import {
  getAllArticles,
  getArticleBySlug,
  getRelatedArticles,
} from "@/features/articles/lib/articles";
import { formatArticleDate } from "@/features/articles/lib/content";
import {
  articleStructuredData,
  serializeJsonLd,
} from "@/features/articles/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { tools } from "@/lib/content";
import { pageMetadata, SOCIAL_IMAGE } from "@/lib/metadata";
type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug((await params).slug);
  if (!article) notFound();
  return {
    ...pageMetadata(
      article.title,
      article.description,
      `/articles/${article.slug}`,
    ),
    title: article.title,
    description: article.description,
    authors: [{ name: article.author }],
    keywords: article.tags,
    alternates: { canonical: absoluteUrl(`/articles/${article.slug}`) },
    openGraph: {
      type: "article",
      title: `${article.title} | FretLab`,
      description: article.description,
      url: absoluteUrl(`/articles/${article.slug}`),
      siteName: "FretLab",
      locale: "fr_FR",
      publishedTime: article.date,
      ...(article.updatedAt ? { modifiedTime: article.updatedAt } : {}),
      authors: [article.author],
      section: article.category,
      tags: article.tags,
      images: [SOCIAL_IMAGE],
      ...(article.image
        ? {
            images: [
              {
                url: absoluteUrl(article.image.src),
                alt: article.image.alt,
                width: article.image.width,
                height: article.image.height,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | FretLab`,
      description: article.description,
      images: article.image
        ? [{ url: absoluteUrl(article.image.src), alt: article.image.alt }]
        : [SOCIAL_IMAGE],
    },
  };
}
export default async function ArticlePage({ params }: Props) {
  const article = getArticleBySlug((await params).slug);
  if (!article) notFound();
  const tool = tools.find((tool) => tool.slug === article.tool)!;
  return (
    <Container>
      <nav aria-label="Fil d’Ariane" className={styles.breadcrumbs}>
        <Link href="/">Accueil</Link>
        <span aria-hidden="true">/</span>
        <Link href="/articles">Articles</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{article.title}</span>
      </nav>
      <article className={styles.article}>
        <header className={styles.header}>
          <p className="eyebrow">{article.category}</p>
          <h1>{article.title}</h1>
          <p className={styles.lead}>{article.description}</p>
          <div className={styles.metadata}>
            <span>Par {article.author}</span>
            <time dateTime={article.date}>
              {formatArticleDate(article.date)}
            </time>
            <span>{article.readingMinutes} min de lecture</span>
            {article.updatedAt && (
              <span>
                Mis à jour le{" "}
                <time dateTime={article.updatedAt}>
                  {formatArticleDate(article.updatedAt)}
                </time>
              </span>
            )}
          </div>
          {article.image && (
            <Image
              className={styles.cover}
              {...article.image}
              alt={article.image.alt}
              sizes="(max-width: 800px) 100vw, 760px"
            />
          )}
        </header>
        {article.headings.length > 1 && (
          <nav className={styles.toc} aria-label="Sommaire">
            <h2>Dans cet article</h2>
            <ol>
              {article.headings.map((heading) => (
                <li
                  key={heading.id}
                  className={
                    heading.depth === 3 ? styles.subheading : undefined
                  }
                >
                  <a href={`#${heading.id}`}>{heading.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <MarkdownContent content={article.content} />
        <section className={styles.toolCta} aria-label="Passer à la pratique">
          <div>
            <h2>À vous de jouer.</h2>
            <p>
              Retrouvez {tool.name.toLowerCase()} dans votre boîte à outils.
            </p>
          </div>
          <Button href={`/outils/${article.tool}`}>{tool.name}</Button>
        </section>
        <div className={styles.tags} aria-label="Sujets de cet article">
          {article.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </article>
      <section className={styles.related}>
        <div className={styles.listHeading}>
          <h2>Articles similaires</h2>
          <Link href="/articles" className="text-link">
            Tous les articles →
          </Link>
        </div>
        <ArticleGrid articles={getRelatedArticles(article.slug)} />
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(articleStructuredData(article)),
        }}
      />
    </Container>
  );
}
