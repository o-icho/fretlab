import { absoluteUrl } from "../../../lib/site.ts";
import type { Article } from "./content.ts";
export function articleStructuredData(article: Article) {
  const url = absoluteUrl(`/articles/${article.slug}`);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${url}#article`,
      mainEntityOfPage: url,
      headline: article.title,
      description: article.description,
      datePublished: article.date,
      ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
      author: { "@type": "Organization", name: article.author },
      publisher: { "@type": "Organization", name: "FretLab" },
      inLanguage: "fr-FR",
      articleSection: article.category,
      keywords: article.tags.join(", "),
      ...(article.image ? { image: absoluteUrl(article.image.src) } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Articles",
          item: absoluteUrl("/articles"),
        },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];
}
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
