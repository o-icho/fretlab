import Link from "next/link";
import { Container } from "./Container";
import { Icon } from "./Icon";
import { tools } from "@/lib/content";
export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand">
              <span className="brand-mark">
                <Icon name="logo" />
              </span>
              FretLab<span className="brand-dot">.</span>
            </Link>
            <p>Des outils simples pour mieux jouer.</p>
            <span className="footer-small">
              Pensé pour la musique. Conçu pour tous.
            </span>
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
              <Link key={t.slug} href={`/outils/${t.slug}`}>
                {t.name}
              </Link>
            ))}
          </nav>
          <nav aria-label="Articles de pied de page">
            <h2>Le journal</h2>
            <Link href="/articles">Tous les articles</Link>
            <span>Apprendre. Pratiquer. Explorer.</span>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FretLab</span>
          <span>FretLab — des outils simples pour mieux jouer.</span>
          <span>
            Fait pour les guitaristes <span className="amber">✳</span>
          </span>
        </div>
      </Container>
    </footer>
  );
}
