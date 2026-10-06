import { featureRouteFallback } from "@/config/requireFeature";
import { FeatureLink } from "@/components/FeatureLink";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/metadata";
import { DrumMachine } from "@/features/drums/DrumMachine";
export const metadata = pageMetadata(
  "Boîte à rythmes en ligne pour guitare",
  "Travaillez la guitare avec des grooves de batterie rock, blues, funk, metal et pop, réglables au tempo de votre choix.",
  "/outils/boite-a-rythmes",
);
export default function Page() {
  const fallback = featureRouteFallback("drumMachine"); if (fallback) return fallback;
  return <Container>
    <section className="page-intro"><p className="eyebrow">LA BOÎTE À OUTILS / 07</p><h1>Boîte à rythmes</h1><p>Choisissez un groove, trouvez votre tempo et jouez par-dessus.</p></section>
    <DrumMachine />
    <section className="page-intro"><h2>Un groove pour travailler votre guitare</h2><p>Commencez lentement, puis augmentez le tempo quand vos changements d’accords deviennent réguliers. Retrouvez une grille dans le <FeatureLink featureId="chordProgressions">générateur de progressions</FeatureLink> ou travaillez votre pulsation avec le <FeatureLink featureId="metronome">métronome</FeatureLink>.</p></section>
  </Container>;
}
