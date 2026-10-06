export const featureFlags = {
  chordDictionary: true,
  metronome: true,
  tuner: true,
  transposer: true,
  scales: true,
  chordProgressions: false,
  drumMachine: false,
  backingTracks: true,
} as const;
export type FeatureId = keyof typeof featureFlags;
const definitions = [
  {
    id: "chordDictionary", href: "/outils/accords", slug: "accords",
    name: "Dictionnaire d’accords",
    short: "Trouvez le bon accord.",
    description:
      "Explorez les positions et enrichissez votre vocabulaire à la guitare.",
    icon: "chords",
    color: "amber",
    number: "01",
  },
  {
    id: "metronome", href: "/outils/metronome", slug: "metronome",
    name: "Métronome",
    short: "Gardez le rythme.",
    description:
      "Prenez le tempo et développez votre régularité, une mesure à la fois.",
    icon: "metronome",
    color: "teal",
    number: "02",
  },
  {
    id: "tuner", href: "/outils/accordeur", slug: "accordeur",
    name: "Accordeur",
    short: "Partez sur la bonne note.",
    description: "Une guitare bien accordée, pour le plaisir de chaque note.",
    icon: "tuner",
    color: "blue",
    number: "03",
  },
  {
    id: "transposer", href: "/outils/transposeur", slug: "transposeur",
    name: "Transposeur",
    short: "Changez de tonalité.",
    description:
      "Adaptez vos accords à votre voix et jouez les morceaux à votre façon.",
    icon: "transpose",
    color: "purple",
    number: "04",
  },
  {
    id: "scales", href: "/outils/gammes", slug: "gammes",
    name: "Visualiseur de gammes",
    short: "Explorez votre manche.",
    description:
      "Repérez les notes et les intervalles de vos gammes, dans plusieurs accordages.",
    icon: "scales",
    color: "teal",
    number: "05",
  },
  {
    id: "chordProgressions", href: "/outils/progressions", slug: "progressions",
    name: "Générateur de progressions",
    short: "Composez votre prochaine grille.",
    description: "Explorez des progressions cohérentes et adaptez chaque mesure à vos idées.",
    icon: "progression",
    color: "amber",
    number: "06",
  },
  {
    id: "drumMachine", href: "/outils/boite-a-rythmes", slug: "boite-a-rythmes",
    name: "Boîte à rythmes",
    short: "Jouez sur un groove.",
    description: "Accompagnez votre guitare avec des rythmes rock, blues, funk, metal et pop.",
    icon: "drums",
    color: "teal",
    number: "07",
  },
  { id: "backingTracks", href: "/backing-tracks", slug: "backing-tracks", name: "Backing tracks", short: "Jouez accompagné.", description: "Suivez les accords et alternez accompagnement et exemple complet.", icon: "tuner", color: "purple", number: "08" },
] as const;

export type FeatureDefinition = (typeof definitions)[number];
export function isFeatureEnabled(id: FeatureId): boolean { return featureFlags[id]; }
export function getFeatureDefinition(id: FeatureId): FeatureDefinition {
  return definitions.find(feature => feature.id === id)!;
}
export function getEnabledFeatures(): FeatureDefinition[] {
  return definitions.filter(feature => isFeatureEnabled(feature.id));
}
/** Resolve editorial URLs through registered routes, including their subpages. */
export function isFeatureHrefEnabled(href: string): boolean {
  const url = new URL(href, "https://fretlab.fr");
  if (url.origin !== "https://fretlab.fr") return true;
  const path = url.pathname.replace(/\/+$/, "");
  const feature = definitions.find(feature =>
    path === feature.href || path.startsWith(feature.href + "/") ||
    path === "/outils/" + feature.slug);
  return !feature || isFeatureEnabled(feature.id);
}
