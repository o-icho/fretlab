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

const SUFFIXES: Record<string, ChordQuality> = {
  "": "major",
  M: "major",
  major: "major",
  majeur: "major",
  maj: "major",
  m: "minor",
  min: "minor",
  minor: "minor",
  mineur: "minor",
  "7": "7",
  maj7: "maj7",
  M7: "maj7",
  Δ7: "maj7",
  m7: "m7",
  min7: "m7",
  sus2: "sus2",
  sus4: "sus4",
  dim: "dim",
  "°": "dim",
  "5": "5",
};
export type ChordQuery = {
  root: ChordRoot;
  quality: ChordQuality;
  name: string;
};
export function normalizeChordName(input: string): string {
  return input
    .trim()
    .replace(/[♯＃]/g, "#")
    .replace(/♭/g, "b")
    .replace(/\s+/g, "");
}
export function parseChordName(input: string): ChordQuery | null {
  const match = /^([a-gA-G])([#b]?)(.*)$/.exec(normalizeChordName(input));
  if (!match) return null;
  const root = (match[1].toUpperCase() + match[2]) as ChordRoot;
  if (!(root in ROOT_PITCH)) return null;
  const quality = SUFFIXES[match[3]] ?? SUFFIXES[match[3].toLowerCase()];
  if (!quality) return null;
  return { root, quality, name: root + QUALITY_SUFFIXES[quality] };
}
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
