import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { SectionTitle } from "@/components/SectionTitle";
import { ToolCard } from "@/components/ToolCard";
import { ArticleCards } from "@/components/ArticleCards";
import { ChordDiagram } from "@/components/ChordDiagram";
import { tools } from "@/lib/content";
import {
  pageMetadata,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
} from "@/lib/metadata";
export const metadata = pageMetadata(
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  "/",
  true,
);
export default function Home() {
  return (
    <>
      <Container>
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              <span /> LA BOÎTE À OUTILS DU GUITARISTE
            </p>
            <h1>
              Les outils essentiels
              <br />
              du <span>guitariste.</span>
            </h1>
            <p className="hero-description">
              Accords, accordeur, métronome et transposition réunis dans une
              interface simple et gratuite.
            </p>
            <div className="hero-actions">
              <Button href="#outils">
                Découvrir les outils <Icon name="arrow" size={18} />
              </Button>
              <Button href="/articles" secondary>
                Lire les articles
              </Button>
            </div>
            <div className="hero-benefits">
              <span>
                <Icon name="check" size={15} />
                100 % gratuit
              </span>
              <span>
                <Icon name="check" size={15} />
                Sans inscription
              </span>
              <span>
                <Icon name="check" size={15} />À votre rythme
              </span>
            </div>
          </div>
          <div
            className="hero-visual"
            aria-label="Illustration d’un accord de Do majeur, aperçu des futurs outils"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="chord-preview">
              <div className="preview-top">
                <span>
                  <Icon name="chords" size={15} /> LE BON ACCORD
                </span>
                <span className="preview-dots">•••</span>
              </div>
              <div className="chord-heading">
                <div>
                  <strong>
                    C<span>maj</span>
                  </strong>
                  <p>Do majeur</p>
                </div>
                <span className="chord-tag">POSITION OUVERTE</span>
              </div>
              <ChordDiagram />
              <div className="chord-notes">
                <span>Do</span>
                <span>Mi</span>
                <span>Sol</span>
                <span className="note-caption">Simple. Essentiel.</span>
              </div>
            </div>
            <div className="floating-tempo">
              <span className="tempo-icon">
                <Icon name="metronome" size={24} />
              </span>
              <div>
                <strong>
                  120 <small>BPM</small>
                </strong>
                <span>À chaque temps, un progrès.</span>
              </div>
              <div className="mini-bars">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <span className="visual-caption">
              MOINS DE DISTRACTIONS. PLUS DE MUSIQUE.
            </span>
            <span className="visual-spark" aria-hidden="true">
              ✳
            </span>
          </div>
        </section>
        <section id="outils" className="tools-section">
          <div className="section-heading">
            <SectionTitle
              eyebrow="VOTRE PROCHAINE SESSION COMMENCE ICI"
              title="Six outils. Toutes les possibilités."
              description="L’essentiel à portée de main, pour vous concentrer sur le plaisir de jouer."
            />
            <span className="section-aside">
              Pensés pour votre pratique <Icon name="arrow" size={17} />
            </span>
          </div>
          <div className="tool-grid">
            {tools.map((tool) => (
              <ToolCard tool={tool} key={tool.slug} />
            ))}
          </div>
          <p className="tools-note">
            <span /> Six outils gratuits pour accompagner votre pratique avec
            FretLab.
          </p>
        </section>
        <section className="content-section">
          <div className="section-heading">
            <SectionTitle
              eyebrow="UN PEU DE LECTURE, BEAUCOUP DE PRATIQUE"
              title="Progresser à la guitare"
              description="Des repères simples pour avancer, quel que soit votre niveau."
            />
            <Link href="/articles" className="text-link">
              Tous les articles <Icon name="arrow" size={18} />
            </Link>
          </div>
          <ArticleCards />
        </section>
        <section className="final-cta">
          <div className="cta-decoration" aria-hidden="true">
            ✳
          </div>
          <p className="eyebrow">À VOUS DE JOUER</p>
          <h2>
            Travaillez. Jouez. <span>Progressez.</span>
          </h2>
          <p>
            Une guitare, un peu de curiosité et les bons outils.
            <br />
            Le reste commence avec vous.
          </p>
          <Button href="#outils">
            Trouver mon outil <Icon name="arrow" size={18} />
          </Button>
        </section>
      </Container>
    </>
  );
}
