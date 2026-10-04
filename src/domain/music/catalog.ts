import { parseNote, type PitchClass } from "./pitch.ts";
export const ROOTS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
] as const;
export type ChordRoot = (typeof ROOTS)[number];
export const QUALITIES = [
  "major",
  "minor",
  "7",
  "maj7",
  "m7",
  "sus2",
  "sus4",
  "dim",
  "5",
] as const;
export type ChordQuality = (typeof QUALITIES)[number];
export const QUALITY_LABELS: Record<ChordQuality, string> = {
  major: "Majeur",
  minor: "Mineur",
  "7": "Septième",
  maj7: "Septième majeure",
  m7: "Septième mineure",
  sus2: "Suspendu 2",
  sus4: "Suspendu 4",
  dim: "Diminué",
  "5": "Power chord",
};
export const QUALITY_SUFFIXES: Record<ChordQuality, string> = {
  major: "",
  minor: "m",
  "7": "7",
  maj7: "maj7",
  m7: "m7",
  sus2: "sus2",
  sus4: "sus4",
  dim: "dim",
  "5": "5",
};
export const ROOT_PITCH = Object.fromEntries(ROOTS.map(root => [root, parseNote(root)!.pitchClass])) as Record<ChordRoot, PitchClass>;
