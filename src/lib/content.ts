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
] as const;
export type Tool = (typeof tools)[number];
