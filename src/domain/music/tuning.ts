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
export const BASS_4_TUNING = {
  id: "bass-4", name: "Mi standard", strings: [28, 33, 38, 43], notation: "sharps",
} as const satisfies Tuning;
export const BASS_5_TUNING = {
  id: "bass-5", name: "Si standard", strings: [23, 28, 33, 38, 43], notation: "sharps",
} as const satisfies Tuning;
export const BASS_4_TUNINGS = [
  BASS_4_TUNING,
  { id: "bass-4-drop-d", name: "Drop D", strings: [26, 33, 38, 43], notation: "sharps" },
] as const satisfies readonly Tuning[];
export const BASS_5_TUNINGS = [
  BASS_5_TUNING,
  { id: "bass-5-drop-a", name: "Drop A", strings: [21, 28, 33, 38, 43], notation: "sharps" },
] as const satisfies readonly Tuning[];
export const TUNINGS = [
  STANDARD_TUNING,
  { id: "eb-standard", name: "Eb Standard", strings: [39, 44, 49, 54, 58, 63], notation: "flats" },
  { id: "drop-d", name: "Drop D", strings: [38, 45, 50, 55, 59, 64], notation: "sharps" },
  { id: "d-standard", name: "Ré standard", strings: [38, 43, 48, 53, 57, 62], notation: "sharps" },
] as const satisfies readonly Tuning[];
export type TuningId = (typeof TUNINGS)[number]["id"];

export function tuningNotes(tuning: Tuning) {
  return tuning.strings.map((midi) => midiToNote(midi, tuning.notation));
}
