import { targetFrequency } from "./midi.ts";
import { STANDARD_TUNING, type Tuning } from "./tuning.ts";

export const STRING_INSTRUMENTS = [
  { id: "electric", label: "Guitare électrique" },
  { id: "folk", label: "Guitare folk (acier)" },
  { id: "classical", label: "Guitare classique (nylon)" },
] as const;
export type StringInstrument = (typeof STRING_INSTRUMENTS)[number]["id"];

export const STRING_GOALS = [
  { id: "balanced", label: "Un jeu polyvalent" },
  { id: "softer", label: "Des barrés plus faciles" },
  { id: "bends", label: "Des bends plus souples" },
  { id: "firmer-bass", label: "Des graves plus fermes" },
] as const;
export type StringGoal = (typeof STRING_GOALS)[number]["id"];

type SixStrings = readonly [number, number, number, number, number, number];
export type StringSet = {
  id: string;
  instrument: StringInstrument;
  label: string;
  model: string;
  sourceUrl: string;
  /** Diameters in thousandths of an inch, low E to high E, as listed by the manufacturer. */
  gauges: SixStrings;
  /** Manufacturer's published tensions (lbf) at E standard, same string order. */
  referenceLbs: SixStrings;
};

// D’Addario product specifications. Within each instrument all sets belong to
// the same series and use the same reference scale. No steel/nylon conversion.
function set(instrument: StringInstrument, id: string, label: string, product: string, gauges: SixStrings, referenceLbs: SixStrings): StringSet {
  const series = { electric: "XL Nickel", folk: "Phosphor Bronze", classical: "Pro-Arté Nylon" };
  return {
    instrument, id, label, gauges, referenceLbs,
    model: `D’Addario ${series[instrument]} ${id.toUpperCase()}`,
    sourceUrl: `https://www.daddario.com/products/${product}`,
  };
}

const catalogue = {
  electric: [
    set("electric", "exl120", "9–42", "exl120-xl-nickel-wound-electric-guitar-strings-super-light-09-42",
      [42, 32, 24, 16, 11, 9], [14.4, 15.5, 15.7, 14.7, 11, 13.1]),
    set("electric", "exl125", "9–46", "exl125-xl-nickel-wound-electric-guitar-strings-super-light-top-regular-bottom-09-46",
      [46, 36, 26, 16, 11, 9], [16.9, 19, 18.4, 14.7, 11, 13.1]),
    set("electric", "exl110", "10–46", "exl110-xl-nickel-wound-electric-guitar-strings-regular-light-10-46",
      [46, 36, 26, 17, 13, 10], [16.9, 19, 18.4, 16.6, 15.4, 16.2]),
    set("electric", "exl140", "10–52", "exl140-xl-nickel-wound-electric-guitar-strings-light-topheavy-bottom-10-52",
      [52, 42, 30, 17, 13, 10], [21.1, 25.6, 24.7, 16.6, 15.4, 16.2]),
    set("electric", "exl115", "11–49", "exl115-xl-nickel-wound-electric-guitar-strings-mediumblues-jazz-rock-11-49",
      [49, 38, 28, 18, 14, 11], [19, 21, 21.1, 18.6, 17.8, 19.6]),
  ],
  folk: [
    set("folk", "ej15", "10–47", "acoustic-guitar-strings-phosphor-bronze-ej15-extra-light-10-47",
      [47, 39, 30, 23, 14, 10], [19.9, 24.7, 26.7, 27.9, 17.8, 16.2]),
    set("folk", "ej26", "11–52", "ej26-phosphor-bronze-acoustic-guitar-strings-custom-light-11-52",
      [52, 42, 32, 22, 15, 11], [24.2, 28.9, 29.9, 25.4, 20.5, 19.6]),
    set("folk", "ej16", "12–53", "ej16-phosphor-bronze-acoustic-guitar-strings-light-12-53",
      [53, 42, 32, 24, 16, 12], [24.9, 28.9, 29.9, 30.1, 23.3, 23.4]),
    set("folk", "ej17", "13–56", "ej17-phosphor-bronze-acoustic-guitar-strings-medium-13-56",
      [56, 45, 35, 26, 17, 13], [27.8, 32.8, 35.9, 35.1, 26.3, 27.4]),
  ],
  classical: [
    // The individual trebles list the exact gauges; set tension charts round them to .001".
    // https://www.daddario.com/products/pro-arte-trebles
    set("classical", "ej43", "Tension légère", "ej43-pro-arte-nylon-classical-guitar-strings-light-tension",
      [42, 33, 28, 39.7, 31.7, 27.5], [13, 13.8, 14.1, 11.5, 11.7, 15.7]),
    set("classical", "ej45", "Tension normale", "ej45-pro-arte-nylon-classical-guitar-strings-normal-tension",
      [43, 35, 29, 40.3, 32.2, 28], [14.2, 15.9, 15.6, 11.9, 12, 16.2]),
    set("classical", "ej46", "Tension forte", "ej46-pro-arte-nylon-classical-guitar-strings-hard-tension",
      [44, 36, 30, 41, 32.7, 28.5], [15.2, 17, 16.2, 12.3, 12.4, 16.8]),
  ],
} satisfies Record<StringInstrument, StringSet[]>;

export function getStringSets(instrument: StringInstrument): readonly StringSet[] {
  return catalogue[instrument];
}

const defaults = { electric: "exl110", folk: "ej16", classical: "ej45" };
export function getDefaultStringSet(instrument: StringInstrument): StringSet {
  return catalogue[instrument].find(candidate => candidate.id === defaults[instrument])!;
}

// Paths encode one practical change at a time. Hybrid electric sets have
// separate treble and bass gauges, so a single light-to-heavy ordering fails.
const alternatives: Record<string, { softer: string; bends: string; "firmer-bass": string }> = {
  exl120: { softer: "exl120", bends: "exl120", "firmer-bass": "exl125" },
  exl125: { softer: "exl120", bends: "exl125", "firmer-bass": "exl140" },
  exl110: { softer: "exl120", bends: "exl125", "firmer-bass": "exl140" },
  exl140: { softer: "exl110", bends: "exl125", "firmer-bass": "exl140" },
  exl115: { softer: "exl110", bends: "exl110", "firmer-bass": "exl140" },
  ej15: { softer: "ej15", bends: "ej15", "firmer-bass": "ej26" },
  ej26: { softer: "ej15", bends: "ej15", "firmer-bass": "ej16" },
  ej16: { softer: "ej26", bends: "ej26", "firmer-bass": "ej17" },
  ej17: { softer: "ej16", bends: "ej16", "firmer-bass": "ej17" },
  ej43: { softer: "ej43", bends: "ej43", "firmer-bass": "ej45" },
  ej45: { softer: "ej43", bends: "ej43", "firmer-bass": "ej46" },
  ej46: { softer: "ej45", bends: "ej45", "firmer-bass": "ej46" },
};

export function recommendStringSet(instrument: StringInstrument, tuning: Tuning, goal: StringGoal, currentSetId?: string) {
  const sets = getStringSets(instrument);
  const current = sets.find(candidate => candidate.id === currentSetId);
  const inStandardD = instrument === "electric" && tuning.id === "d-standard";
  const defaultSet = inStandardD
    ? sets.find(candidate => candidate.id === "exl115")!
    : getDefaultStringSet(instrument);
  if (goal === "balanced") {
    if (current) return { set: current, explanation: "Si le toucher vous convient dans cet accordage, reprendre le même jeu conserve vos repères." };
    const explanations = {
      electric: inStandardD
        ? "En ré standard, les six cordes descendent d’un ton. Le 11–49 redonne de la tenue aux accords."
        : "Le 10–46 donne de la tenue aux accords et garde des aigus assez souples pour les solos.",
      folk: "Le 12–53 offre de la résistance au médiator et convient aussi aux arpèges sur une folk à cordes acier.",
      classical: "La tension normale est un point de départ pour trouver vos repères sur des cordes en nylon.",
    };
    return { set: defaultSet, explanation: explanations[instrument] };
  }

  const reference = current ?? defaultSet;
  const nextId = alternatives[reference.id][goal];
  const next = sets.find(candidate => candidate.id === nextId)!;
  if (current?.id === next.id) {
    const explanation = goal === "firmer-bass"
      ? "Votre jeu a déjà les graves les plus fermes de cette sélection pour cet instrument."
      : "Votre jeu est déjà parmi les plus souples de cette sélection pour ce geste.";
    return { set: next, explanation };
  }
  if (instrument === "electric" && goal === "firmer-bass" && next.id === "exl140" && reference.id === "exl110") {
    return { set: next, explanation: tuning.id === "drop-d"
      ? "En Drop D, la corde de 52 donne plus de tenue au ré grave. Les trois cordes aiguës gardent les mêmes diamètres que sur un 10–46."
      : "Les trois basses gagnent en fermeté sous le médiator. Les trois aiguës ont les mêmes diamètres que sur un 10–46." };
  }
  const explanations = {
    softer: "Ce jeu réduit l’effort pour plaquer les accords et tenir un barré.",
    bends: "Ses cordes aiguës se tirent plus facilement pour faire monter la note pendant un solo.",
    "firmer-bass": "La corde grave oppose davantage de résistance sous les doigts ou le médiator.",
  };
  const explanation = next.id === "ej17"
    ? "Le 13–56 offre plus de résistance dans les graves. Vérifiez que le fabricant de votre folk prévoit ce tirant."
    : explanations[goal];
  return { set: next, explanation };
}

export function compareStringSets(firstSet: StringSet, firstTuning: Tuning, secondSet: StringSet, secondTuning: Tuning) {
  if (firstSet.instrument !== secondSet.instrument) throw new RangeError("Choisissez deux jeux pour le même instrument.");
  for (const tuning of [firstTuning, secondTuning]) {
    if (tuning.strings.length !== 6 || tuning.strings.some(note => !Number.isInteger(note) || note < 0 || note > 127)) {
      throw new RangeError("Un accordage de guitare à six cordes est requis.");
    }
  }
  return firstTuning.strings.map((firstMidi, index) => {
    const secondMidi = secondTuning.strings[index];
    // Same guitar: scale length cancels. Tension ∝ linear mass × frequency².
    // At the same standard pitch the reference tension ratio is the mass ratio.
    const referenceRatio = secondSet.referenceLbs[index] / firstSet.referenceLbs[index];
    const pitchRatio = targetFrequency(secondMidi) / targetFrequency(firstMidi);
    const changePercent = Math.round(100 * (referenceRatio * pitchRatio ** 2 - 1)) || 0;
    const direction: "same" | "softer" | "firmer" = changePercent === 0 ? "same" : changePercent < 0 ? "softer" : "firmer";
    return {
      stringNumber: STANDARD_TUNING.strings.length - index,
      firstMidi, secondMidi,
      firstGauge: firstSet.gauges[index], secondGauge: secondSet.gauges[index],
      changePercent, direction,
    };
  });
}
