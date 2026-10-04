import { NOTE_LETTERS, pitchClass, spellPitchClass, type NoteSpelling, type PitchClass } from "./pitch.ts";

/** Degree and chromatic distance are both necessary for a diatonic spelling. */
export type Interval = {
  degree: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  semitones: number;
  label: string;
};

export function spellInterval(root: { spelling: NoteSpelling; pitchClass: PitchClass }, interval: Interval) {
  const letterIndex = NOTE_LETTERS.indexOf(root.spelling.letter);
  const letter = NOTE_LETTERS[(letterIndex + interval.degree - 1) % 7];
  return spellPitchClass(pitchClass(root.pitchClass + interval.semitones), letter);
}
