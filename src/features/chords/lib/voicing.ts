import { parseChord } from "../../../domain/music/chords.ts";
import { spellInterval, type Interval } from "../../../domain/music/intervals.ts";
import { noteName, parseNote, pitchClass } from "../../../domain/music/pitch.ts";
import { STANDARD_TUNING } from "../../../domain/music/tuning.ts";
import type { ChordPosition, GuitarChord } from "./model.ts";

// Degrees for the chromatic intervals occurring in the guitar catalogue.
// Three distances have two spellings depending on their role in the chord.
const DEGREES = [1, 2, 2, 3, 3, 4, 5, 5, 5, 6, 7, 7] as const;

export function playedNotes(chord: GuitarChord, position: ChordPosition) {
  const root = parseNote(chord.root)!;
  const bass = parseChord(chord.displayName)?.bass;
  return position.frets.flatMap((fret, stringIndex) => {
    if (fret === -1) return [];
    const midi = STANDARD_TUNING.strings[stringIndex] + fret;
    const semitones = pitchClass(midi - root.pitchClass);
    let degree: Interval["degree"] = DEGREES[semitones];
    if (semitones === 3 && chord.quality === "7#9") degree = 2;
    if (semitones === 6 && chord.quality === "9#11") degree = 4;
    if (semitones === 9 && chord.quality === "dim7") degree = 7;
    const name = bass?.pitchClass === pitchClass(midi)
      ? bass.name
      : spellInterval(root, { degree, semitones })?.name ??
        noteName(midi, root.spelling.accidental === 1 ? "sharps" : "flats");
    return [{ midi, name }];
  });
}
