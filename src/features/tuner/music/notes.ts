export const A4_FREQUENCY = 440;
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export function targetFrequency(midi: number): number {
  return A4_FREQUENCY * 2 ** ((midi - 69) / 12);
}
export function frequencyToMidi(frequency: number): number | null {
  return Number.isFinite(frequency) && frequency > 0
    ? 69 + 12 * Math.log2(frequency / A4_FREQUENCY)
    : null;
}
export function midiToNote(midi: number) {
  const rounded = Math.round(midi);
  return {
    midi: rounded,
    note: NOTES[((rounded % 12) + 12) % 12],
    octave: Math.floor(rounded / 12) - 1,
    frequency: targetFrequency(rounded),
  };
}
export function frequencyToNote(frequency: number) {
  const midi = frequencyToMidi(frequency);
  return midi === null ? null : midiToNote(midi);
}
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
export const STANDARD_STRINGS = [40, 45, 50, 55, 59, 64].map(midiToNote);
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
