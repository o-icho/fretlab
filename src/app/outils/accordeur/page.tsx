import { featureRouteFallback } from "@/config/requireFeature";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/Container";
import { Suspense } from "react";
import { Tuner, TunerFromQuery } from "@/features/tuner/components/Tuner";
export const metadata = pageMetadata(
  "Accordeur guitare et basse en ligne gratuit",
  "Accordez gratuitement votre guitare ou votre basse 4 ou 5 cordes grâce au microphone de votre ordinateur ou smartphone.",
  "/outils/accordeur",
);
export default function Page() {
  const fallback = featureRouteFallback("tuner"); if (fallback) return fallback;
  return (
    <Container>
      <section className="page-intro">
        <p className="eyebrow">LA BOÎTE À OUTILS / 03</p>
        <h1>Accordeur chromatique</h1>
        <p>Accordez votre guitare ou votre basse 4 ou 5 cordes, une note à la fois.</p>
      </section>
      <Suspense fallback={<Tuner />}><TunerFromQuery /></Suspense>
    </Container>
  );
}
