import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/metadata";
import { ScaleVisualizer } from "@/features/scales/components/ScaleVisualizer";
import styles from "@/features/scales/components/scales.module.css";

export const metadata = pageMetadata(
  "Gammes guitare : visualiseur interactif du manche",
  "Visualisez les gammes et leurs intervalles sur le manche de guitare dans différentes tonalités et accordages.",
  "/outils/gammes",
);

export default function Page() {
  return (
    <Container>
      <section className="page-intro">
        <p className="eyebrow">LA BOÎTE À OUTILS / 05</p>
        <h1>Visualiseur de gammes guitare</h1>
        <p>Repérez les notes de votre gamme, partout sur le manche.</p>
      </section>
      <Suspense fallback={<div className={styles.loading} role="status">Chargement du manche…</div>}>
        <ScaleVisualizer />
      </Suspense>
      <section className={styles.learn}>
        <h2>Une gamme, des repères pour jouer</h2>
        <p>Choisissez une fondamentale et une gamme, puis repérez ses notes sur les six cordes.
          Le double cercle marque la fondamentale. Les intervalles indiquent la place des notes
          par rapport à cette note de départ : 1, b3, 4, 5, b7 pour une pentatonique mineure.</p>
        <p>Explorez une petite zone à la fois. Vérifiez votre accordage avec l’<Link href="/outils/accordeur">accordeur</Link>,
          puis pratiquez lentement au <Link href="/outils/metronome">métronome</Link>.
          Pour retrouver les doigtés des accords, ouvrez le <Link href="/outils/accords">dictionnaire d’accords</Link>.</p>
      </section>
    </Container>
  );
}
