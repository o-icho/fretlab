import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getArticleBySlug } from "@/features/articles/lib/articles";
import { stringGuidePath, stringsHub, stringTools } from "@/features/strings/pages";
import { pageMetadata } from "@/lib/metadata";
import styles from "./section.module.css";

export const metadata = pageMetadata(stringsHub.name, stringsHub.description, stringsHub.href);

export default function StringsPage() {
  const guide = getArticleBySlug("choisir-le-tirant-de-ses-cordes");
  return (
    <>
      <header className={styles.heading}>
        <Link className={styles.back} href="/#outils">Tous les outils</Link>
        <h1>{stringsHub.name}</h1>
      </header>
      <nav aria-label={stringsHub.name}>
        <ul className={styles.cards}>
          {Object.values(stringTools).map(tool => (
            <li key={tool.href}>
              <Link href={tool.href} className={styles.card}>
                <Icon name={tool.icon} size={32} />
                <h2>{tool.title}</h2>
                <p>{tool.description}</p>
                <span className={styles.arrow}><Icon name="arrow" size={22} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {guide && (
        <Link href={stringGuidePath} className={styles.guide}>
          <span className={styles.thumbnail}>
            <Image src="/images/guitare-studio.webp" alt="" fill sizes="130px" />
          </span>
          <span>
            <span className={styles.caption}>Guide · {guide.readingMinutes} min de lecture</span>
            <strong>{guide.title}</strong>
          </span>
          <Icon name="arrow" size={20} />
        </Link>
      )}
    </>
  );
}
