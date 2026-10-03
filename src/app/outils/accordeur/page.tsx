import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/Container";
import { Tuner } from "@/features/tuner/components/Tuner";
export const metadata = pageMetadata(
  "Accordeur guitare en ligne gratuit",
  "Accordez gratuitement votre guitare grâce au microphone de votre ordinateur ou smartphone.",
  "/outils/accordeur",
);
export default function Page() {
  return (
    <Container>
      <section className="page-intro">
        <p className="eyebrow">LA BOÎTE À OUTILS / 03</p>
        <h1>Accordeur chromatique</h1>
        <p>Accordez votre guitare, une note à la fois.</p>
      </section>
      <Tuner />
    </Container>
  );
}
