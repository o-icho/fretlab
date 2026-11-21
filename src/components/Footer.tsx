import Link from "next/link";
import { Container } from "./Container";
import { Brand } from "./Brand";
import { tools, toolHref } from "@/lib/content";
export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-grid">
          <div>
            <Link href="/" aria-label="FretLab, accueil">
              <Brand />
            </Link>
          </div>
          <nav aria-label="Navigation de pied de page">
            <h2>Explorer</h2>
            <Link href="/">Accueil</Link>
            <Link href="/#outils">Les outils</Link>
            <Link href="/a-propos">À propos</Link>
          </nav>
          <nav aria-label="Outils de pied de page">
            <h2>Les outils</h2>
            {tools.map((t) => (
              <Link key={t.slug} href={toolHref(t.slug)}>
                {t.name}
              </Link>
            ))}
          </nav>
          <nav aria-label="Articles de pied de page">
            <h2>Le journal</h2>
            <Link href="/articles">Tous les articles</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FretLab</span>
        </div>
      </Container>
    </footer>
  );
}
