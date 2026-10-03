import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/Container";
import { Transposer } from "@/features/transposer/Transposer";
export const metadata = pageMetadata(
  "Transposeur d’accords guitare gratuit",
  "Transposez instantanément une grille d’accords de guitare dans n’importe quelle tonalité.",
  "/outils/transposeur",
);
export default function Page() {
  return (
    <Container>
      <section className="page-intro">
        <p className="eyebrow">LA BOÎTE À OUTILS / 04</p>
        <h1>Transposeur d’accords</h1>
        <p>Changez instantanément la tonalité d’une grille d’accords.</p>
      </section>
      <Transposer />
    </Container>
  );
}
