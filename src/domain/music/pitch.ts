export type AccidentalPreference = "sharps" | "flats";

export const SHARP_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;
export const FLAT_NOTES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;
export const NOTE_LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
export type NoteLetter = (typeof NOTE_LETTERS)[number];
const NATURAL_PITCH: Record<NoteLetter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};
const NOTE = /^([A-G])([#b♯♭]?)$/;
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type NoteSpelling = { letter: NoteLetter; accidental: -1 | 0 | 1 };
export function pitchClass(value: number): PitchClass {
  if (!Number.isInteger(value)) throw new RangeError("Une pitch class exige un entier.");
  return (((value % 12) + 12) % 12) as PitchClass;
}
export function parseNote(note: string): { pitchClass: PitchClass; spelling: NoteSpelling } | null {
  const match = NOTE.exec(note);
  if (!match) return null;
  const accidental = match[2] === "#" || match[2] === "♯" ? 1 : match[2] === "b" || match[2] === "♭" ? -1 : 0;
  const letter = match[1] as NoteLetter;
  return { pitchClass: pitchClass(NATURAL_PITCH[letter] + accidental), spelling: { letter, accidental } };
}

export function noteName(value: number, preference: AccidentalPreference = "sharps"): string {
  return (preference === "flats" ? FLAT_NOTES : SHARP_NOTES)[pitchClass(value)];
}

/** Diatonic spelling with at most one accidental; null signals a double accidental. */
export function spellPitchClass(value: PitchClass, letter: NoteLetter): { name: string; spelling: NoteSpelling } | null {
  const offset = pitchClass(value - NATURAL_PITCH[letter]);
  const accidental = offset === 11 ? -1 : offset;
  if (accidental !== -1 && accidental !== 0 && accidental !== 1) return null;
  return { name: letter + (accidental === -1 ? "b" : accidental === 1 ? "#" : ""), spelling: { letter, accidental } };
}
export function transposeNote(note: string, semitones: number, preference: AccidentalPreference = "sharps"): string {
  if (!Number.isInteger(semitones)) throw new RangeError("La transposition doit être un nombre entier de demi-tons.");
  const parsed = parseNote(note);
  if (!parsed) return note;
  return noteName(parsed.pitchClass + semitones, preference);
}
