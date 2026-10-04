import type { HarmonyChord, HarmonicDegree, HarmonicQuality, Key, KeyMode } from "./harmony.ts";

export type ProgressionFamily = "pop" | "rock" | "blues" | "soul-funk";
export type ProgressionLength = 4 | 8 | 12;
export type TemplateStep = {
  degree: HarmonicDegree;
  seventh?: boolean;
  quality?: HarmonicQuality;
  alteration?: "harmonic-minor-dominant" | "blues-dominant";
};
export type ProgressionTemplate = {
  id: string;
  name: string;
  description: string;
  mode: KeyMode;
  families: readonly ProgressionFamily[];
  lengths: readonly ProgressionLength[];
  steps: readonly TemplateStep[];
};
export type ProgressionBar = {
  chord: HarmonyChord;
  degree: HarmonicDegree | null;
  roman: string | null;
  isDiatonic: boolean | null;
  alteration: TemplateStep["alteration"] | null;
  locked: boolean;
  edited: boolean;
};
export type Progression = {
  key: Key;
  family: ProgressionFamily;
  bars: readonly ProgressionBar[];
  generatedFromTemplate: { id: string; name: string; description: string };
};
