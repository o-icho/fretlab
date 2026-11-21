import { CHORDS } from "../../../data/chords/dataset.ts";
import {
  ROOT_PITCH,
  ROOT_LABELS,
  QUALITY_LABELS,
  QUALITY_SUFFIXES,
  type ChordRoot,
  type ChordQuality,
  type GuitarChord,
} from "./model.ts";

import { parseChordName, resolveChordQuality } from "../../../domain/music/query.ts";
import { parseChord } from "../../../domain/music/chords.ts";
export { normalizeChordName, parseChordName, type ChordQuery } from "../../../domain/music/query.ts";
function lookupKey(root: ChordRoot, quality: ChordQuality) {
  const [symbol, bass] = QUALITY_SUFFIXES[quality].split("/");
  return `${ROOT_PITCH[root]}:${symbol}:${bass ? ROOT_PITCH[bass as ChordRoot] : ""}`;
}
const byPitchAndQuality = new Map(CHORDS.map(chord => [lookupKey(chord.root, chord.quality), chord]));
export function findChord(
  root: ChordRoot,
  quality: ChordQuality,
): GuitarChord | null {
  const source = byPitchAndQuality.get(lookupKey(root, quality));
  return source
    ? { ...source, root, quality, displayName: root + QUALITY_SUFFIXES[quality] }
    : null;
}
export function searchChord(input: string): GuitarChord | null {
  const query = parseChordName(input);
  if (!query) return null;
  const chord = findChord(query.root, query.quality);
  return chord ? { ...chord, displayName: query.name } : null;
}
export function chordDescription(chord: GuitarChord): string {
  const parsed = parseChord(chord.displayName);
  if (parsed?.bass) {
    const base = resolveChordQuality(parsed.suffix)!;
    return `${ROOT_LABELS[chord.root]} ${QUALITY_LABELS[base].toLowerCase()}, basse ${parsed.bass.name}`;
  }
  return `${ROOT_LABELS[chord.root]} ${QUALITY_LABELS[chord.quality].toLowerCase()}`;
}
export function getPosition(chord: GuitarChord, index: number) {
  return Number.isInteger(index) && index >= 0
    ? (chord.positions[index] ?? null)
    : null;
}
