import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
export const metadata = pageMetadata(
  "À propos",
  "FretLab, un projet de boîte à outils gratuite pour guitaristes : simple, accessible et sans inscription.",
  "/a-propos",
);
export default function About() {
  return (
    <Container>
      <section className="page-intro">
        <p className="eyebrow">L’ESPRIT FRETLAB</p>
        <h1>Plus de place pour la musique.</h1>
        <p>Des outils simples pour mieux jouer.</p>
      </section>
      <section className="about-panel">
        <h2>Votre guitare. Votre rythme.</h2>
        <p>
          FretLab part d’une idée simple : les outils du quotidien devraient
          vous aider à jouer, sans compliquer votre pratique. Accords, tempo,
          justesse et tonalité : l’essentiel, réuni au même endroit.
        </p>
        <div className="values-grid">
          <div>
            <span>01</span>
            <h3>Accessible à tous</h3>
            <p>
              Une boîte à outils gratuite, sans création de compte, pour les
              premières notes comme pour les habitudes bien installées.
            </p>
          </div>
          <div>
            <span>02</span>
            <h3>Simple par nature</h3>
            <p>
              Une interface lisible et adaptée à votre écran, pour garder votre
              attention sur l’instrument.
            </p>
          </div>
          <div>
            <span>03</span>
            <h3>Au fil de la pratique</h3>
            <p>
              Des outils et des guides pratiques pour accompagner votre
              progression.
            </p>
          </div>
        </div>
        <p>
          Vous découvrez la première version de FretLab. Les outils sont
          fonctionnels et les premiers guides accompagnent votre pratique.
        </p>
        <Button href="/#outils">Découvrir les outils</Button>
      </section>
    </Container>
  );
}
