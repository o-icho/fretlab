import Image from "next/image";
import Link from "next/link";
import { ArticleCards } from "@/components/ArticleCards";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { getFeatureDefinition, isFeatureEnabled, type FeatureId } from "@/config/features";
import { tools } from "@/lib/content";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, pageMetadata } from "@/lib/metadata";
import styles from "./home.module.css";

export const metadata = pageMetadata(DEFAULT_TITLE, DEFAULT_DESCRIPTION, "/", true);

const featuredIds: FeatureId[] = ["tuner", "metronome", "chordDictionary", "scales"];
const featuredTools = featuredIds.filter(isFeatureEnabled).map(getFeatureDefinition);

export default function Home() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.photo}>
          <Image src="/images/guitare-studio.webp" alt="" fill fetchPriority="high"
            loading="eager" sizes="(max-width: 700px) 100vw, 65vw" />
        </div>
        <Container>
          <div className={styles.heroCopy}>
            <h1 id="home-title">L’atelier guitare</h1>
            <p>Des outils pour l’accordage, le rythme et l’harmonie.</p>
            <ul className={styles.featuredTools}>
              {featuredTools.map((tool) => (
                <li key={tool.id}>
                  <Link href={tool.href}>
                    <Icon name={tool.icon} size={25} />
                    <span>{tool.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <a href="#outils" className={styles.allTools}>Tous les outils <Icon name="arrow" size={17} /></a>
          </div>
        </Container>
      </section>
      <Container>
        <section id="outils" className={styles.section} aria-labelledby="tools-title">
          <h2 id="tools-title">Les outils</h2>
          <ul className={styles.tools}>
            {tools.map((tool) => (
              <li key={tool.id}>
                <Link href={tool.href}>
                  <Icon name={tool.icon} size={34} />
                  <span>{tool.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className={styles.section} aria-labelledby="articles-title">
          <div className={styles.sectionHeading}>
            <h2 id="articles-title">Le journal</h2>
            <Link href="/articles">Tous les articles <Icon name="arrow" size={18} /></Link>
          </div>
          <ArticleCards />
        </section>
      </Container>
    </>
  );
}
