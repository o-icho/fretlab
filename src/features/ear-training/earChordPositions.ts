import { CHORDS } from "../../data/chords/dataset.ts";
import type { EarExercise } from "../../domain/music/earTraining.ts";
import { pitchClass } from "../../domain/music/pitch.ts";
import type { ChordPosition, GuitarChord } from "../chords/lib/model.ts";
import { searchChord } from "../chords/lib/search.ts";
import { playedNotes } from "../chords/lib/voicing.ts";

/** Compare chord tones independently of spelling, octave and doubled strings. */
function pitchSetKey(notes: readonly number[]) {
  return [...new Set(notes.map(pitchClass))].sort((a, b) => a - b).join(",");
}

export function earChordPositions(exercise: EarExercise): readonly ChordPosition[] {
  if (exercise.kind !== "chord") return [];
  const tones = pitchSetKey(exercise.midi);
  const root = pitchClass(exercise.midi[0]);
  function matchingPositions(chords: readonly GuitarChord[]) {
    const rootPositions: ChordPosition[] = [];
    const inversions: ChordPosition[] = [];
    const seen = new Set<string>();
    for (const chord of chords) {
      for (const position of chord.positions) {
        const notes = playedNotes(chord, position).map(note => note.midi);
        if (pitchSetKey(notes) !== tones) continue;
        const frets = position.frets.join(",");
        if (seen.has(frets)) continue;
        seen.add(frets);
        const group = pitchClass(Math.min(...notes)) === root ? rootPositions : inversions;
        group.push(position);
      }
    }
    return [...rootPositions, ...inversions];
  }
  const named = searchChord(exercise.answer);
  const positions = named && matchingPositions([named]);
  // Some sounds appear only under another catalogue symbol (e.g. C7sus2 as Gm/C).
  return positions?.length ? positions : matchingPositions(CHORDS);
}
