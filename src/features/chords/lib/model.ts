export const ROOTS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
] as const;
export type ChordRoot = (typeof ROOTS)[number];
export const QUALITIES = [
  "major",
  "minor",
  "7",
  "maj7",
  "m7",
  "sus2",
  "sus4",
  "dim",
  "5",
] as const;
export type ChordQuality = (typeof QUALITIES)[number];
export const QUALITY_LABELS: Record<ChordQuality, string> = {
  major: "Majeur",
  minor: "Mineur",
  "7": "Septième",
  maj7: "Septième majeure",
  m7: "Septième mineure",
  sus2: "Suspendu 2",
  sus4: "Suspendu 4",
  dim: "Diminué",
  "5": "Power chord",
};
export const QUALITY_SUFFIXES: Record<ChordQuality, string> = {
  major: "",
  minor: "m",
  "7": "7",
  maj7: "maj7",
  m7: "m7",
  sus2: "sus2",
  sus4: "sus4",
  dim: "dim",
  "5": "5",
};
export const ROOT_PITCH: Record<ChordRoot, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};
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
