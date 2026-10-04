import { noteName, type AccidentalPreference } from "./pitch.ts";

export const A4_FREQUENCY = 440;
export function targetFrequency(midi: number): number {
  return A4_FREQUENCY * 2 ** ((midi - 69) / 12);
}
export function frequencyToMidi(frequency: number): number | null {
  return Number.isFinite(frequency) && frequency > 0
    ? 69 + 12 * Math.log2(frequency / A4_FREQUENCY)
    : null;
}
export function midiToNote(midi: number, preference: AccidentalPreference = "sharps") {
  const rounded = Math.round(midi);
  return { midi: rounded, note: noteName(rounded, preference), octave: Math.floor(rounded / 12) - 1, frequency: targetFrequency(rounded) };
}
export function frequencyToNote(frequency: number) {
  const midi = frequencyToMidi(frequency);
  return midi === null ? null : midiToNote(midi);
}
