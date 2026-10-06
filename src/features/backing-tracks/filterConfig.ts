import styles from "../../data/backing-tracks/backing-track-styles.json" with { type: "json" };
export interface BackingTrackStyle { id: string; label: string }
export function validateStyles(values: readonly BackingTrackStyle[]): void {
  if (values.some(s => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.id) || !s.label.trim()) || new Set(values.map(s => s.id)).size !== values.length) throw new Error("Styles de backing tracks invalides ou identifiants dupliqués.");
}
validateStyles(styles);
export const BACKING_TRACK_STYLES: readonly BackingTrackStyle[] = styles;
/** Old local imports may contain labels. New content uses the stable id in style. */
export function styleId(value?: string): string | undefined {
  return BACKING_TRACK_STYLES.find(s => s.id === value || s.label.toLowerCase() === value?.toLowerCase())?.id;
}
export function styleLabel(value?: string): string {
  return BACKING_TRACK_STYLES.find(s => s.id === styleId(value))?.label ?? value ?? "Style non renseigné";
}
export const BACKING_TRACK_TEMPO_RANGES = [
  { id: "under-60", label: "Moins de 60 BPM", min: null, max: 60, minInclusive: false, maxInclusive: false },
  { id: "60-90", label: "60 - 90 BPM", min: 60, max: 90, minInclusive: true, maxInclusive: false },
  { id: "90-120", label: "90 - 120 BPM", min: 90, max: 120, minInclusive: true, maxInclusive: false },
  { id: "120-180", label: "120 - 180 BPM", min: 120, max: 180, minInclusive: true, maxInclusive: false },
  { id: "180-220", label: "180 - 220 BPM", min: 180, max: 220, minInclusive: true, maxInclusive: true },
  { id: "over-220", label: "Plus de 220 BPM", min: 220, max: null, minInclusive: false, maxInclusive: false },
] as const;
export type BackingTrackTempoRangeId = typeof BACKING_TRACK_TEMPO_RANGES[number]["id"];
export function matchesTempoRange(bpm: number, rangeId?: string): boolean {
  const range = BACKING_TRACK_TEMPO_RANGES.find(r => r.id === rangeId);
  if (!range) return true;
  return (range.min === null || (range.minInclusive ? bpm >= range.min : bpm > range.min)) && (range.max === null || (range.maxInclusive ? bpm <= range.max : bpm < range.max));
}
