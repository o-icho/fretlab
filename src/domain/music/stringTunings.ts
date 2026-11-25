import { BASS_4_TUNINGS, BASS_5_TUNINGS, TUNINGS, type Tuning } from "./tuning.ts";

export const STRING_INSTRUMENTS = [
  { id: "electric", label: "Guitare électrique" },
  { id: "folk", label: "Guitare folk (acier)" },
  { id: "classical", label: "Guitare classique (nylon)" },
  { id: "bass-4", label: "Basse 4 cordes" },
  { id: "bass-5", label: "Basse 5 cordes" },
] as const;
export type StringInstrument = (typeof STRING_INSTRUMENTS)[number]["id"];

const instrumentTunings: Record<StringInstrument, readonly [Tuning, ...Tuning[]]> = {
  electric: TUNINGS,
  folk: TUNINGS,
  classical: TUNINGS,
  "bass-4": BASS_4_TUNINGS,
  "bass-5": BASS_5_TUNINGS,
};

export function getStringTunings(instrument: StringInstrument) {
  return instrumentTunings[instrument];
}

export function resolveStringTuning(instrument: StringInstrument, id?: string | null): Tuning {
  const tunings = getStringTunings(instrument);
  return tunings.find(tuning => tuning.id === id) ?? tunings[0];
}

// Older tuner links identify the tuning alone. Six-string tunings are shared
// by all guitars, with electric first as the strings workspace default.
export function resolveStringInstrument(id?: string | null, tuningId?: string | null): StringInstrument {
  const explicit = STRING_INSTRUMENTS.find(instrument => instrument.id === id);
  if (explicit) return explicit.id;
  const inferred = STRING_INSTRUMENTS.find(instrument =>
    getStringTunings(instrument.id).some(tuning => tuning.id === tuningId),
  );
  return inferred?.id ?? "electric";
}
