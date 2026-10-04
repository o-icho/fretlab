import { midiToNote } from "./midi.ts";
import type { AccidentalPreference } from "./pitch.ts";

/** MIDI pitches in low-to-high string order; independent of the instrument UI. */
export type Tuning = {
  id: string;
  name: string;
  strings: readonly number[];
  notation: AccidentalPreference;
};
export const STANDARD_TUNING = {
  id: "standard", name: "Standard E", strings: [40, 45, 50, 55, 59, 64], notation: "sharps",
} as const satisfies Tuning;
export const TUNINGS = [
  STANDARD_TUNING,
  { id: "eb-standard", name: "Eb Standard", strings: [39, 44, 49, 54, 58, 63], notation: "flats" },
  { id: "drop-d", name: "Drop D", strings: [38, 45, 50, 55, 59, 64], notation: "sharps" },
] as const satisfies readonly Tuning[];
export type TuningId = (typeof TUNINGS)[number]["id"];

export function tuningNotes(tuning: Tuning) {
  return tuning.strings.map((midi) => midiToNote(midi, tuning.notation));
}
