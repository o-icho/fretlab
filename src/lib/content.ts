export const tools = [
  {
    slug: "accords",
    name: "Dictionnaire d’accords",
    short: "Trouvez le bon accord.",
    description:
      "Explorez les positions et enrichissez votre vocabulaire à la guitare.",
    icon: "chords",
    color: "amber",
    number: "01",
  },
  {
    slug: "metronome",
    name: "Métronome",
    short: "Gardez le rythme.",
    description:
      "Prenez le tempo et développez votre régularité, une mesure à la fois.",
    icon: "metronome",
    color: "teal",
    number: "02",
  },
  {
    slug: "accordeur",
    name: "Accordeur",
    short: "Partez sur la bonne note.",
    description: "Une guitare bien accordée, pour le plaisir de chaque note.",
    icon: "tuner",
    color: "blue",
    number: "03",
  },
  {
    slug: "transposeur",
    name: "Transposeur",
    short: "Changez de tonalité.",
    description:
      "Adaptez vos accords à votre voix et jouez les morceaux à votre façon.",
    icon: "transpose",
    color: "purple",
    number: "04",
  },
  {
    slug: "gammes",
    name: "Visualiseur de gammes",
    short: "Explorez votre manche.",
    description:
      "Repérez les notes et les intervalles de vos gammes, dans plusieurs accordages.",
    icon: "scales",
    color: "teal",
    number: "05",
  },
  {
    slug: "progressions",
    name: "Générateur de progressions",
    short: "Composez votre prochaine grille.",
    description: "Explorez des progressions cohérentes et adaptez chaque mesure à vos idées.",
    icon: "progression",
    color: "amber",
    number: "06",
  },
  {
    slug: "boite-a-rythmes",
    name: "Boîte à rythmes",
    short: "Jouez sur un groove.",
    description: "Accompagnez votre guitare avec des rythmes rock, blues, funk, metal et pop.",
    icon: "drums",
    color: "teal",
    number: "07",
  },
  { slug: "backing-tracks", name: "Backing tracks", short: "Jouez accompagné.", description: "Suivez les accords et alternez accompagnement et exemple complet.", icon: "tuner", color: "purple", number: "08" },
] as const;
export type Tool = (typeof tools)[number];
export function toolHref(slug: string) { return slug === "backing-tracks" ? "/backing-tracks/" : `/outils/${slug}`; }
