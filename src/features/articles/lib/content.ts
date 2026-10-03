import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

export type ArticleMetadata = {
  title: string;
  description: string;
  slug: string;
  date: string;
  updatedAt?: string;
  author: string;
  category: string;
  tags: string[];
  tool: "accords" | "metronome" | "accordeur" | "transposeur";
  art: "chord" | "rhythm" | "strings";
  image?: { src: string; alt: string; width: number; height: number };
};
export type ArticleSummary = ArticleMetadata & { readingMinutes: number };
export type ArticleHeading = { id: string; text: string; depth: number };
export type Article = ArticleSummary & {
  content: string;
  headings: ArticleHeading[];
  links: string[];
};
type MarkdownNode = {
  type: string;
  value?: string;
  url?: string;
  depth?: number;
  children?: MarkdownNode[];
  data?: { hProperties?: Record<string, unknown> };
};
function visit(node: MarkdownNode, fn: (node: MarkdownNode) => void) {
  fn(node);
  node.children?.forEach((child) => visit(child, fn));
}
function nodeText(node: MarkdownNode): string {
  return node.value ?? node.children?.map(nodeText).join("") ?? "";
}
export function headingSlug(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "section"
  );
}
export function remarkHeadingIds() {
  return (tree: MarkdownNode) => {
    const counts = new Map<string, number>();
    visit(tree, (node) => {
      if (node.type !== "heading") return;
      const base = headingSlug(nodeText(node));
      const count = (counts.get(base) ?? 0) + 1;
      counts.set(base, count);
      node.data = {
        ...node.data,
        hProperties: {
          ...node.data?.hProperties,
          id: count === 1 ? base : `${base}-${count}`,
        },
      };
    });
  };
}
function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function parseArticle(source: string, filename: string): Article {
  const { data, content } = matter(source);
  const fail = (message: string): never => {
    throw new Error(`${filename}: ${message}`);
  };
  for (const field of ["title", "description", "slug", "author", "category"])
    if (typeof data[field] !== "string" || !data[field].trim())
      fail(`métadonnée ${field} manquante`);
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug) ||
    filename !== `${data.slug}.md`
  )
    fail("slug incohérent avec le nom du fichier");
  if (
    !validDate(data.date) ||
    (data.updatedAt !== undefined &&
      (!validDate(data.updatedAt) || data.updatedAt < data.date))
  )
    fail("date invalide (utiliser une chaîne YYYY-MM-DD)");
  if (
    !Array.isArray(data.tags) ||
    !data.tags.length ||
    data.tags.some((tag: unknown) => typeof tag !== "string" || !tag.trim())
  )
    fail("tags invalides");
  if (!["accords", "metronome", "accordeur", "transposeur"].includes(data.tool))
    fail("outil inconnu");
  if (
    data.art !== undefined &&
    !["chord", "rhythm", "strings"].includes(data.art)
  )
    fail("illustration inconnue");
  if (
    data.image !== undefined &&
    (!data.image ||
      typeof data.image.src !== "string" ||
      !data.image.src.startsWith("/") ||
      data.image.src.startsWith("//") ||
      typeof data.image.alt !== "string" ||
      !data.image.alt.trim() ||
      !Number.isInteger(data.image.width) ||
      data.image.width <= 0 ||
      !Number.isInteger(data.image.height) ||
      data.image.height <= 0)
  )
    fail("image locale invalide");
  if (!content.trim()) fail("contenu vide");
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHeadingIds);
  const tree = processor.runSync(processor.parse(content)) as MarkdownNode;
  const headings: ArticleHeading[] = [],
    links: string[] = [];
  let words = 0;
  visit(tree, (node) => {
    if (node.type === "heading" && node.depth === 1)
      fail("le titre h1 est fourni par la page, utiliser h2/h3");
    if (node.type === "heading" && (node.depth === 2 || node.depth === 3))
      headings.push({
        id: String(node.data?.hProperties?.id),
        text: nodeText(node),
        depth: node.depth,
      });
    if (node.type === "link" && node.url) links.push(node.url);
    if (node.type === "text" || node.type === "code")
      words += node.value?.match(/\S+/g)?.length ?? 0;
  });
  return {
    title: data.title,
    description: data.description,
    slug: data.slug,
    date: data.date,
    ...(data.updatedAt ? { updatedAt: data.updatedAt } : {}),
    author: data.author,
    category: data.category,
    tags: data.tags,
    tool: data.tool,
    art: data.art ?? "chord",
    ...(data.image ? { image: data.image } : {}),
    readingMinutes: Math.max(1, Math.ceil(words / 200)),
    content,
    headings,
    links,
  };
}
export function toSummary(article: Article): ArticleSummary {
  const { content, headings, links, ...summary } = article;
  void content;
  void headings;
  void links;
  return summary;
}
export function loadArticles(
  directory = join(process.cwd(), "content", "articles"),
): Article[] {
  const articles = readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .map((file) =>
      parseArticle(readFileSync(join(directory, file), "utf8"), file),
    );
  const slugs = new Set(articles.map((article) => article.slug));
  if (slugs.size !== articles.length)
    throw new Error("Slugs d’articles dupliqués");
  for (const article of articles) {
    if (!article.links.includes(`/outils/${article.tool}`))
      throw new Error(`${article.slug}: lien vers l’outil requis`);
    if (
      !article.links.some(
        (link) =>
          link.startsWith("/articles/") &&
          link.split("#")[0] !== `/articles/${article.slug}`,
      )
    )
      throw new Error(`${article.slug}: lien vers un autre article requis`);
    for (const link of article.links.filter((link) =>
      link.startsWith("/articles/"),
    )) {
      const [path, anchor] = link.split("#");
      const target = articles.find((item) => `/articles/${item.slug}` === path);
      if (
        !target ||
        (anchor && !target.headings.some((heading) => heading.id === anchor))
      )
        throw new Error(`${article.slug}: lien cassé ${link}`);
    }
  }
  return articles.sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );
}
export function selectRelatedArticles(
  articles: Article[],
  current: Article,
  limit = 3,
): ArticleSummary[] {
  const score = (article: Article) =>
    (article.category === current.category ? 3 : 0) +
    article.tags.filter((tag) => current.tags.includes(tag)).length;
  return articles
    .filter((article) => article.slug !== current.slug)
    .sort(
      (a, b) =>
        score(b) - score(a) ||
        b.date.localeCompare(a.date) ||
        a.slug.localeCompare(b.slug),
    )
    .slice(0, Math.max(0, limit))
    .map(toSummary);
}
export function formatArticleDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
