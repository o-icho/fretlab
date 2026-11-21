import { ROOT_PITCH, QUALITY_SUFFIXES, type ChordRoot, type ChordQuality } from "./catalog.ts";
import { parseChord } from "./chords.ts";
// Search aliases are an input adapter; strict musical parsing remains in chords.ts.
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
  add9: "add9",
  "7sus4": "7sus4",
  "7#9": "7#9",
  m7b5: "m7b5",
  "ø": "m7b5",
  "ø7": "m7b5",
  "11": "11",
  "13": "13",
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
export function resolveChordQuality(suffix: string): ChordQuality | null {
  if (Object.hasOwn(SUFFIXES, suffix)) return SUFFIXES[suffix];
  const lower = suffix.toLowerCase();
  return Object.hasOwn(SUFFIXES, lower) ? SUFFIXES[lower] : null;
}
export function parseChordName(input: string): ChordQuery | null {
  const match = /^([a-gA-G])([#b]?)(.*)$/.exec(normalizeChordName(input));
  if (!match) return null;
  const root = (match[1].toUpperCase() + match[2]) as ChordRoot;
  if (!(root in ROOT_PITCH)) return null;
  const quality = resolveChordQuality(match[3]);
  if (!quality) return null;
  const chord = parseChord(root + QUALITY_SUFFIXES[quality]);
  return chord ? { root, quality, name: chord.root.name + chord.suffix } : null;
}
