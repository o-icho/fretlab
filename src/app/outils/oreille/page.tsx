import { Container } from "@/components/Container";
import { featureRouteFallback } from "@/config/requireFeature";
import { pageMetadata } from "@/lib/metadata";
import { EarTraining } from "@/features/ear-training/EarTraining";

export const metadata = pageMetadata("Test de l’oreille : accords et intervalles", "Entraînez votre oreille musicale : écoutez des accords et des intervalles dans la tonalité de votre choix, puis révélez la réponse.", "/outils/oreille");
export default function Page() {
  const fallback = featureRouteFallback("earTraining"); if (fallback) return fallback;
  return <Container>
    <section className="page-intro"><p className="eyebrow">LA BOÎTE À OUTILS / 09</p><h1>Entraînez votre oreille</h1><p>Reconnaissez les accords et les intervalles, une écoute à la fois.</p></section>
    <EarTraining />
    <section className="page-intro"><h2>Un peu d’écoute, chaque jour</h2><p>Écoutez sans regarder la réponse, chantez les notes, puis vérifiez votre intuition. La tonalité désigne ici la fondamentale de l’accord ou la première note de l’intervalle, sans restriction de mode. Les accords de trois et quatre notes sont mélangés, sans renversement. Les intervalles vont de l’unisson à l’octave dans les deux sens. Écoutez note par note pour reconnaître le sens, ou les notes ensemble pour travailler leur couleur. Chaque tirage est indépendant : une répétition est possible.</p></section>
  </Container>;
}
