import type { ChordRoot, ChordQuality } from "../../../domain/music/catalog.ts";
export * from "../../../domain/music/catalog.ts";
export const ROOT_LABELS: Record<ChordRoot, string> = {
  C: "Do",
  "C#": "Do dièse",
  Db: "Ré bémol",
  D: "Ré",
  "D#": "Ré dièse",
  Eb: "Mi bémol",
  E: "Mi",
  F: "Fa",
  "F#": "Fa dièse",
  Gb: "Sol bémol",
  G: "Sol",
  "G#": "Sol dièse",
  Ab: "La bémol",
  A: "La",
  "A#": "La dièse",
  Bb: "Si bémol",
  B: "Si",
};
// Low E -> high e; -1 = muted, 0 = open, positive frets are absolute.
export type SixStrings<T> = readonly [T, T, T, T, T, T];
export type Finger = 0 | 1 | 2 | 3 | 4;
export type Barre = {
  fret: number;
  fromString: number;
  toString: number;
  finger: Exclude<Finger, 0>;
};
export type ChordPosition = {
  id: string;
  frets: SixStrings<number>;
  fingers?: SixStrings<Finger>;
  baseFret: number;
  barres: readonly Barre[];
};
export type GuitarChord = {
  id: string;
  root: ChordRoot;
  quality: ChordQuality;
  displayName: string;
  positions: readonly ChordPosition[];
};
