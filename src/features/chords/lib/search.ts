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

import { parseChordName } from "../../../domain/music/query.ts";
export { normalizeChordName, parseChordName, type ChordQuery } from "../../../domain/music/query.ts";
export function findChord(
  root: ChordRoot,
  quality: ChordQuality,
): GuitarChord | null {
  const source = CHORDS.find(
    (chord) =>
      ROOT_PITCH[chord.root] === ROOT_PITCH[root] && chord.quality === quality,
  );
  return source
    ? { ...source, root, displayName: root + QUALITY_SUFFIXES[quality] }
    : null;
}
export function searchChord(input: string): GuitarChord | null {
  const query = parseChordName(input);
  return query ? findChord(query.root, query.quality) : null;
}
export function chordDescription(chord: GuitarChord): string {
  return `${ROOT_LABELS[chord.root]} ${QUALITY_LABELS[chord.quality].toLowerCase()}`;
}
export function getPosition(chord: GuitarChord, index: number) {
  return Number.isInteger(index) && index >= 0
    ? (chord.positions[index] ?? null)
    : null;
}
