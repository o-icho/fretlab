import type { ProgressionTemplate, TemplateStep } from "./progression-model.ts";
import type { HarmonicDegree } from "./harmony.ts";

const triads = (...degrees: HarmonicDegree[]): TemplateStep[] => degrees.map((degree) => ({ degree }));
const blues = (degree: HarmonicDegree): TemplateStep => ({ degree, quality: "7", alteration: "blues-dominant" });
const minorDominant: TemplateStep = { degree: 5, quality: "major", alteration: "harmonic-minor-dominant" };
const minorDominant7: TemplateStep = { ...minorDominant, quality: "7" };
const seventh = (degree: HarmonicDegree): TemplateStep => ({ degree, seventh: true });

// One step = one bar. Only declared lengths are supported; 12-bar forms are explicit.
export const PROGRESSION_TEMPLATES: readonly ProgressionTemplate[] = [
  { id: "pop-axis", name: "I – V – vi – IV", description: "Une boucle majeure avec un passage par le relatif mineur.", mode: "major", families: ["pop", "rock"], lengths: [4, 8], steps: triads(1, 5, 6, 4) },
  { id: "pop-doowop", name: "I – vi – IV – V", description: "Une boucle qui termine sur la dominante avant de revenir au début.", mode: "major", families: ["pop"], lengths: [4, 8], steps: triads(1, 6, 4, 5) },
  { id: "pop-relative", name: "vi – IV – I – V", description: "Les mêmes repères tonals, en commençant par le relatif mineur.", mode: "major", families: ["pop", "rock"], lengths: [4, 8], steps: triads(6, 4, 1, 5) },
  { id: "rock-three", name: "I – IV – V – IV", description: "Trois accords majeurs autour de la tonique et de la dominante.", mode: "major", families: ["rock"], lengths: [4, 8], steps: triads(1, 4, 5, 4) },
  { id: "minor-pop-rock", name: "i – VI – III – VII", description: "Une boucle entièrement issue du mineur naturel.", mode: "minor", families: ["pop", "rock"], lengths: [4, 8], steps: triads(1, 6, 3, 7) },
  { id: "minor-descending", name: "i – VII – VI – VII", description: "Un mouvement descendant avec retour par le septième degré naturel.", mode: "minor", families: ["pop", "rock"], lengths: [4, 8], steps: triads(1, 7, 6, 7) },
  { id: "minor-dominant", name: "i – iv – VI – V", description: "La dominante majeure emprunte la sensible au mineur harmonique.", mode: "minor", families: ["rock"], lengths: [4, 8], steps: [{ degree: 1 }, { degree: 4 }, { degree: 6 }, minorDominant] },
  { id: "blues-major-loop", name: "I7 – IV7 – I7 – V7", description: "Une boucle blues de quatre mesures ; I7 et IV7 apportent des notes hors gamme majeure.", mode: "major", families: ["blues"], lengths: [4, 8], steps: [blues(1), blues(4), blues(1), blues(5)] },
  { id: "blues-major-12", name: "Blues majeur · 12 mesures", description: "Quatre mesures de I7, deux de IV7, retour à I7 puis V7 – IV7 – I7 – V7.", mode: "major", families: ["blues"], lengths: [12], steps: [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5].map((degree) => blues(degree as HarmonicDegree)) },
  { id: "blues-major-quick", name: "Blues majeur · changement rapide", description: "La deuxième mesure passe à IV7, puis retrouve la forme blues de douze mesures.", mode: "major", families: ["blues"], lengths: [12], steps: [1, 4, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5].map((degree) => blues(degree as HarmonicDegree)) },
  { id: "blues-minor-loop", name: "i7 – iv7 – i7 – V7", description: "Une boucle mineure avec dominante majeure explicitement empruntée au mineur harmonique.", mode: "minor", families: ["blues"], lengths: [4, 8], steps: [seventh(1), seventh(4), seventh(1), minorDominant7] },
  { id: "blues-minor-12", name: "Blues mineur · 12 mesures", description: "La forme de douze mesures utilise i7 et iv7, puis une dominante majeure V7.", mode: "minor", families: ["blues"], lengths: [12], steps: [seventh(1), seventh(1), seventh(1), seventh(1), seventh(4), seventh(4), seventh(1), seventh(1), minorDominant7, seventh(4), seventh(1), minorDominant7] },
  { id: "blues-minor-quick", name: "Blues mineur · changement rapide", description: "iv7 dès la deuxième mesure, avec V7 majeur dans la dernière partie.", mode: "minor", families: ["blues"], lengths: [12], steps: [seventh(1), seventh(4), seventh(1), seventh(1), seventh(4), seventh(4), seventh(1), seventh(1), minorDominant7, seventh(4), seventh(1), minorDominant7] },
  { id: "soul-major-vamp", name: "I7 – IV7", description: "Deux accords de septième répétés ; une couleur blues, pas une harmonisation strictement majeure.", mode: "major", families: ["soul-funk", "blues"], lengths: [4, 8], steps: [blues(1), blues(4)] },
  { id: "soul-major-cadence", name: "ii7 – V7 – Imaj7", description: "Une cadence avec septièmes diatoniques ; la tonique occupe les deux dernières mesures.", mode: "major", families: ["soul-funk"], lengths: [4, 8], steps: [seventh(2), seventh(5), seventh(1), seventh(1)] },
  { id: "soul-minor-vamp", name: "i7 – iv7", description: "Un aller-retour mineur en septièmes diatoniques.", mode: "minor", families: ["soul-funk"], lengths: [4, 8], steps: [seventh(1), seventh(4)] },
  { id: "soul-minor-cadence", name: "iiø7 – V7 – i7", description: "Une cadence mineure : ii demi-diminué, dominante majeure V7, puis deux mesures de tonique mineure.", mode: "minor", families: ["soul-funk"], lengths: [4, 8], steps: [seventh(2), minorDominant7, seventh(1), seventh(1)] },
];
