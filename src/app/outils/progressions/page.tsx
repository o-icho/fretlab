import { featureRouteFallback } from "@/config/requireFeature";
import { FeatureLink } from "@/components/FeatureLink";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/metadata";
import { ProgressionGenerator } from "@/features/progressions/ProgressionGenerator";
import styles from "@/features/progressions/progressions.module.css";

export const metadata = pageMetadata(
  "Générateur de progressions d'accords",
  "Générez des progressions d'accords cohérentes dans différentes tonalités pour composer, improviser et travailler la guitare.",
  "/outils/progressions",
);
export default function Page() {
  const fallback = featureRouteFallback("chordProgressions"); if (fallback) return fallback;
  return (
    <Container>
      <section className="page-intro">
        <p className="eyebrow">LA BOÎTE À OUTILS / 06</p>
        <h1>Générateur de progressions d’accords</h1>
        <p>Un point de départ musical pour composer, improviser et explorer.</p>
      </section>
      <ProgressionGenerator />
      <section className={styles.learn}>
        <h2>Une grille pour commencer à jouer</h2>
        <p>Chaque mesure reçoit un accord issu d’un template défini. Les chiffres romains
          indiquent son degré dans la tonalité : majuscules pour les accords majeurs,
          minuscules pour les mineurs. Les emprunts et couleurs blues sont signalés.</p>
        <p>Gardez les accords qui vous plaisent, modifiez une mesure et explorez les
          <FeatureLink featureId="scales"> notes de votre gamme sur le manche</FeatureLink>.
          Retrouvez les doigtés dans le <FeatureLink featureId="chordDictionary">dictionnaire d’accords</FeatureLink>,
          puis pratiquez la grille au <FeatureLink featureId="metronome">métronome</FeatureLink>.</p>
      </section>
    </Container>
  );
}
