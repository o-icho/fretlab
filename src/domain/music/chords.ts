import { parseNote, transposeNote, type AccidentalPreference } from "./pitch.ts";
// Explicit musical grammar: never accept arbitrary letters following a root.
const CHORD =
  /^([A-G][#b♯♭]?)((?:(?:maj|min|m|dim|aug|sus2|sus4|sus|add(?:2|4|9|11|13)|M|Δ|ø|°|\+|-)?(?:5|6|7|9|11|13)?)(?:(?:add|no|omit)(?:2|3|4|5|6|7|9|11|13)|[#b](?:5|9|11|13)|sus[24]|\((?:[#b]?(?:5|6|7|9|11|13))(?:,[#b]?(?:5|6|7|9|11|13))*\))*)(?:\/([A-G][#b♯♭]?))?$/;

export function parseChord(value: string) {
  const match = CHORD.exec(value);
  if (!match) return null;
  return { root: { ...parseNote(match[1])!, name: match[1] }, suffix: match[2], bass: match[3] ? { ...parseNote(match[3])!, name: match[3] } : null };
}
export type Chord = NonNullable<ReturnType<typeof parseChord>>;
export function isChord(value: string): boolean { return parseChord(value) !== null; }
export function transposeChord(chord: string, semitones: number, preference: AccidentalPreference = "sharps"): string {
  const parsed = parseChord(chord);
  if (!parsed) return chord;
  return transposeNote(parsed.root.name, semitones, preference) + parsed.suffix + (parsed.bass ? "/" + transposeNote(parsed.bass.name, semitones, preference) : "");
}
