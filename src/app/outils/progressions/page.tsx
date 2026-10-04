import Link from "next/link";
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
          <Link href="/outils/gammes"> notes de votre gamme sur le manche</Link>.
          Retrouvez les doigtés dans le <Link href="/outils/accords">dictionnaire d’accords</Link>,
          puis pratiquez la grille au <Link href="/outils/metronome">métronome</Link>.</p>
      </section>
    </Container>
  );
}
