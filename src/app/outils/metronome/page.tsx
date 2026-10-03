import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/Container";
import { Metronome } from "@/features/metronome/Metronome";
export const metadata = pageMetadata(
  "Métronome en ligne gratuit pour guitare",
  "Un métronome gratuit, précis et simple pour travailler la guitare et votre rythme.",
  "/outils/metronome",
);
export default function Page() {
  return (
    <Container>
      <section className="page-intro">
        <p className="eyebrow">LA BOÎTE À OUTILS / 02</p>
        <h1>Métronome en ligne</h1>
        <p>Travaillez votre rythme avec un métronome simple et précis.</p>
      </section>
      <Metronome />
    </Container>
  );
}
