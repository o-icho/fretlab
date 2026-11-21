import Image from "next/image";
import Link from "next/link";
import { ArticleCards } from "@/components/ArticleCards";
import { Container } from "@/components/Container";
import { Icon } from "@/components/Icon";
import { tools } from "@/lib/content";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, pageMetadata } from "@/lib/metadata";
import styles from "./home.module.css";

export const metadata = pageMetadata(DEFAULT_TITLE, DEFAULT_DESCRIPTION, "/", true);

export default function Home() {
  const tuner = tools.find((tool) => tool.id === "tuner");
  const directory = tuner ? [tuner, ...tools.filter((tool) => tool !== tuner)] : tools;

  return (
    <>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.photo}>
          <Image src="/images/guitare-studio.webp" alt="" fill fetchPriority="high"
            loading="eager" sizes="(max-width: 700px) 100vw, 65vw" />
        </div>
        <Container>
          <div className={styles.heroCopy}>
            <h1 id="home-title">Prends ta<br />guitare.</h1>
            <p>Accorde-toi, trouve un accord et travaille ton rythme.</p>
            <Link href={tuner?.href ?? "#outils"} className={styles.action}>
              {tuner ? "Ouvrir l’accordeur" : "Découvrir les outils"}
              <Icon name="arrow" size={23} />
            </Link>
          </div>
        </Container>
      </section>
      <Container>
        <section id="outils" className={styles.section} aria-labelledby="tools-title">
          <h2 id="tools-title">Les outils</h2>
          <ul className={styles.tools}>
            {directory.map((tool) => (
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
