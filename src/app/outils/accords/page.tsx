import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/Container";
import { ChordDictionary } from "@/features/chords/components/ChordDictionary";
export const metadata = pageMetadata(
  "Dictionnaire d’accords guitare",
  "Consultez les positions et doigtés des principaux accords de guitare.",
  "/outils/accords",
);
export default function Page() {
  return (
    <Container>
      <section className="page-intro">
        <p className="eyebrow">LA BOÎTE À OUTILS / 01</p>
        <h1>Dictionnaire d’accords guitare</h1>
        <p>Retrouvez rapidement les positions des accords sur le manche.</p>
      </section>
      <ChordDictionary />
    </Container>
  );
}
