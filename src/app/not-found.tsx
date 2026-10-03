import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};
export default function NotFound() {
  return (
    <Container>
      <section className="page-intro">
        <p className="eyebrow">404 · FAUSSE NOTE</p>
        <h1>Cette page n’existe pas.</h1>
        <p>Retrouvez les outils et les articles depuis l’accueil.</p>
        <Button href="/">Retour à l’accueil</Button>
        <p>
          <Link className="text-link" href="/#outils">
            Découvrir les outils
          </Link>{" "}
          ·{" "}
          <Link className="text-link" href="/articles">
            Lire les articles
          </Link>
        </p>
      </section>
    </Container>
  );
}
