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

// Ordered for the dictionary selector. Source suffixes and displayed symbols
// differ only for the major and minor triads.
const BASE_QUALITIES = [
  ["major", "Majeur"], ["minor", "Mineur"], ["7", "Septième"],
  ["maj7", "Septième majeure"], ["m7", "Septième mineure"],
  ["sus2", "Suspendu 2"], ["sus4", "Suspendu 4"], ["dim", "Diminué"], ["5", "Power chord"],
  ["add9", "Neuvième ajoutée (add9)"], ["7sus4", "Septième suspendue 4 (7sus4)"],
  ["7#9", "Septième, neuvième augmentée (7#9)"], ["m7b5", "Demi-diminué (m7b5)"],
  ["11", "Onzième (11)"], ["13", "Treizième (13)"],
  ["dim7", "Septième diminuée (dim7)"], ["sus", "Suspendu (sus)"],
  ["sus2sus4", "Seconde et quarte suspendues (sus2sus4)"],
  ["alt", "Majeur à quinte diminuée (alt)"], ["aug", "Augmenté (aug)"],
  ["6", "Sixte (6)"], ["69", "Sixte et neuvième (69)"],
  ["7b5", "Septième, quinte diminuée (7b5)"], ["aug7", "Augmenté septième (aug7)"],
  ["9", "Neuvième (9)"], ["9b5", "Neuvième, quinte diminuée (9b5)"],
  ["aug9", "Neuvième, quinte augmentée (aug9)"], ["7b9", "Septième, neuvième mineure (7b9)"],
  ["9#11", "Neuvième, onzième augmentée (9#11)"],
  ["maj7b5", "Septième majeure, quinte diminuée (maj7b5)"],
  ["maj7#5", "Septième majeure, quinte augmentée (maj7#5)"],
  ["maj7sus2", "Septième majeure suspendue 2 (maj7sus2)"],
  ["maj9", "Neuvième majeure (maj9)"], ["maj11", "Onzième majeure (maj11)"],
  ["maj13", "Treizième majeure (maj13)"], ["m6", "Mineur sixte (m6)"],
  ["m69", "Mineur sixte et neuvième (m69)"], ["m9", "Mineur neuvième (m9)"],
  ["m11", "Mineur onzième (m11)"], ["mmaj7", "Mineur, septième majeure (mmaj7)"],
  ["mmaj7b5", "Mineur, septième majeure et quinte diminuée (mmaj7b5)"],
  ["mmaj9", "Mineur neuvième, septième majeure (mmaj9)"],
  ["mmaj11", "Mineur onzième, septième majeure (mmaj11)"],
  ["madd9", "Mineur, neuvième ajoutée (madd9)"], ["add11", "Onzième ajoutée (add11)"],
] as const;
const SLASH_QUALITIES = [
  "/C", "/C#", "/D", "/D#", "/Eb", "/E", "/F", "/F#", "/G", "/G#", "/Ab", "/A", "/Bb", "/B",
  "m/C", "m/C#", "m/D", "m/D#", "m/Eb", "m/E", "m/F", "m/F#", "m/G", "m/G#", "m/Ab", "m/A", "m/Bb", "m/B",
  "m9/C", "m9/C#", "m9/D", "m9/Eb", "m9/E", "m9/F", "m9/F#", "m9/G", "m9/Ab", "m9/A", "m9/Bb", "m9/B",
  "7/G",
] as const;
type BaseQuality = (typeof BASE_QUALITIES)[number][0];
export type ChordQuality = BaseQuality | (typeof SLASH_QUALITIES)[number];
export const QUALITIES: readonly ChordQuality[] = [...BASE_QUALITIES.map(([quality]) => quality), ...SLASH_QUALITIES];
const slashBaseLabels: Record<string, string> = { "": "Majeur", m: "Mineur", m9: "Mineur neuvième", "7": "Septième" };
export const QUALITY_LABELS = Object.fromEntries([
  ...BASE_QUALITIES,
  ...SLASH_QUALITIES.map(quality => {
    const [symbol, bass] = quality.split("/");
    return [quality, `${slashBaseLabels[symbol]}, basse ${bass} (${quality})`];
  }),
]) as Record<ChordQuality, string>;
export const QUALITY_SUFFIXES = Object.fromEntries(
  QUALITIES.map(quality => [quality, quality === "major" ? "" : quality === "minor" ? "m" : quality]),
) as Record<ChordQuality, string>;
export const ROOT_PITCH = Object.fromEntries(ROOTS.map(root => [root, parseNote(root)!.pitchClass])) as Record<ChordRoot, PitchClass>;
