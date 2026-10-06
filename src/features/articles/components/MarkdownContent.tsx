import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import Image from "next/image";
import { isFeatureHrefEnabled } from "@/config/features";
import { remarkHeadingIds } from "../lib/content";
import styles from "./articles.module.css";
export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className={styles.prose}>
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm, remarkHeadingIds]}
        components={{
          a: ({ href, children }) =>
            href && !isFeatureHrefEnabled(href) ? <>{children}</> : href?.startsWith("/") ? (
              <Link href={href}>{children}</Link>
            ) : (
              <a href={href}>{children}</a>
            ),
          table: ({ children }) => (
            <div
              className={styles.tableScroll}
              role="region"
              aria-label="Tableau de l’article"
              tabIndex={0}
            >
              <table>{children}</table>
            </div>
          ),
          blockquote: ({ children }) => (
            <blockquote className={styles.advice}>{children}</blockquote>
          ),
          img: ({ src, alt }) =>
            typeof src === "string" &&
            src.startsWith("/") &&
            !src.startsWith("//") ? (
              <Image
                src={src}
                alt={alt ?? ""}
                width={1200}
                height={675}
                sizes="(max-width: 800px) 100vw, 760px"
              />
            ) : null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
