import { pitchClass, type PitchClass } from "./pitch.ts";
import type { Scale, ScaleNote } from "./scales.ts";
import type { Tuning } from "./tuning.ts";

export type FretRange = { start: number; end: number };
export type FretboardNote = {
  stringIndex: number; // Low-to-high, matching Tuning.strings.
  fret: number;
  midi: number;
  pitchClass: PitchClass;
  scaleNote: ScaleNote;
};

export function mapScaleToFretboard(scale: Scale, tuning: Tuning, range: FretRange): FretboardNote[] {
  if (!Number.isInteger(range.start) || !Number.isInteger(range.end) || range.start < 0 || range.end < range.start || range.end > 24) {
    throw new RangeError("Zone du manche invalide (cases 0 à 24).");
  }
  if (!tuning.strings.length || tuning.strings.some((midi) => !Number.isInteger(midi) || midi < 0 || midi > 127)) {
    throw new RangeError("Accordage invalide.");
  }
  const notesByPitch = new Map(scale.notes.map((note) => [note.pitchClass, note]));
  const positions: FretboardNote[] = [];
  tuning.strings.forEach((openMidi, stringIndex) => {
    for (let fret = range.start; fret <= range.end; fret++) {
      const midi = openMidi + fret;
      const notePitch = pitchClass(midi);
      const scaleNote = notesByPitch.get(notePitch);
      if (scaleNote) positions.push({ stringIndex, fret, midi, pitchClass: notePitch, scaleNote });
    }
  });
  return positions;
}
