import { featureRouteFallback } from "@/config/requireFeature";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/metadata";
import { DrumMachine } from "@/features/drums/DrumMachine";
export const metadata = pageMetadata(
  "Boîte à rythmes en ligne · Éditeur de batterie",
  "Composez une boucle de batterie sur neuf pistes. Réglez la signature et le tempo, placez les frappes et sauvegardez vos rythmes sur cet appareil.",
  "/outils/boite-a-rythmes",
);
export default function Page() {
  const fallback = featureRouteFallback("drumMachine"); if (fallback) return fallback;
  return <Container>
    <section className="page-intro">
      <h1>Boîte à rythmes</h1>
      <p>Cliquez sur les cases pour placer vos frappes, puis écoutez la boucle.</p>
    </section>
    <DrumMachine />
  </Container>;
}
