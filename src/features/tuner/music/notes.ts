import { frequencyToMidi } from "../../../domain/music/midi.ts";
import { STANDARD_TUNING, tuningNotes } from "../../../domain/music/tuning.ts";
export { A4_FREQUENCY, targetFrequency, frequencyToMidi, midiToNote, frequencyToNote } from "../../../domain/music/midi.ts";
export function centsDifference(
  frequency: number,
  target: number,
): number | null {
  return frequency > 0 &&
    target > 0 &&
    Number.isFinite(frequency) &&
    Number.isFinite(target)
    ? 1200 * Math.log2(frequency / target)
    : null;
}
export function clampCents(cents: number): number {
  return Math.max(-50, Math.min(50, cents));
}
export function tuningStatus(
  cents: number,
): "Note trop basse" | "Note juste" | "Note trop haute" {
  return Math.abs(cents) <= 5
    ? "Note juste"
    : cents < 0
      ? "Note trop basse"
      : "Note trop haute";
}
export const STANDARD_STRINGS = tuningNotes(STANDARD_TUNING);
export function nearestGuitarString(frequency: number) {
  const midi = frequencyToMidi(frequency);
  return midi === null
    ? null
    : STANDARD_STRINGS.reduce((closest, string) =>
        Math.abs(string.midi - midi) < Math.abs(closest.midi - midi)
          ? string
          : closest,
      );
}
