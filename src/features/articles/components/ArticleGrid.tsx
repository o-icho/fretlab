import Link from "next/link";
import Image from "next/image";
import { ChordDiagram } from "@/components/ChordDiagram";
import { formatArticleDate, type ArticleSummary } from "../lib/content";
export function ArticleGrid({ articles }: { articles: ArticleSummary[] }) {
  return (
    <div className="article-grid">
      {articles.map((article) => (
        <article className="article-card" key={article.slug}>
          <div className={`article-art ${article.art}`} aria-hidden="true">
            {article.image ? (
              <Image
                src={article.image.src}
                alt=""
                width={article.image.width}
                height={article.image.height}
                sizes="(max-width: 700px) 100vw, 33vw"
              />
            ) : article.art === "chord" ? (
              <>
                <span className="art-letter">
                  C<span>maj</span>
                </span>
                <ChordDiagram />
              </>
            ) : article.art === "rhythm" ? (
              <>
                <div className="rhythm-bars">
                  {[25, 45, 75, 45, 25, 60, 95, 60, 25, 45, 75, 45, 25].map(
                    (height, index) => (
                      <span key={index} style={{ height: `${height}%` }} />
                    ),
                  )}
                </div>
                <span className="art-tempo">1 · 2 · 3 · 4</span>
              </>
            ) : (
              <>
                <div className="string-lines">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <span key={index} />
                  ))}
                </div>
                <span className="art-notes">E · A · D · G · B · E</span>
              </>
            )}
          </div>
          <div className="article-body">
            <div className="article-meta">
              <span>{article.category}</span>
              <span>{article.readingMinutes} min de lecture</span>
            </div>
            <h3>
              <Link href={`/articles/${article.slug}`}>{article.title}</Link>
            </h3>
            <p>{article.description}</p>
            <time className="article-date" dateTime={article.date}>
              {formatArticleDate(article.date)}
            </time>
            <Link
              className="article-read"
              href={`/articles/${article.slug}`}
              aria-label={`Lire : ${article.title}`}
            >
              Lire l’article <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
