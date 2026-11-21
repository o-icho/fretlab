import { QUALITY_SUFFIXES, type ChordQuality } from "./catalog.ts";
import { parseChord, type Chord } from "./chords.ts";
import { pitchClass, type PitchClass } from "./pitch.ts";
import { normalizeChordName, resolveChordQuality } from "./query.ts";
import { generateScale, type Scale } from "./scales.ts";

export type KeyMode = "major" | "minor";
export type Key = { tonic: Scale["root"]; mode: KeyMode; scale: Scale };
export const EXTENDED_CHORD_INTERVALS = {
  "(b5)": [0, 4, 6], dim7: [0, 3, 6, 9], mMaj7: [0, 3, 7, 11],
  "6": [0, 4, 7, 9], m6: [0, 3, 7, 9], add9: [0, 4, 7, 14],
  madd9: [0, 3, 7, 14], add11: [0, 4, 7, 17],
  "7sus2": [0, 2, 7, 10], "7sus4": [0, 5, 7, 10],
  "7b5": [0, 4, 6, 10], "7#5": [0, 4, 8, 10],
  maj7b5: [0, 4, 6, 11], "maj7#5": [0, 4, 8, 11],
} as const;
export const CHORD_TONE_INTERVALS = {
  major: [0, 4, 7], minor: [0, 3, 7], dim: [0, 3, 6],
  aug: [0, 4, 8],
  ...EXTENDED_CHORD_INTERVALS,
  "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10], sus2: [0, 2, 7], sus4: [0, 5, 7], "5": [0, 7],
  "7#9": [0, 4, 7, 10, 15],
  "11": [0, 4, 7, 10, 14, 17],
  "13": [0, 4, 7, 10, 14, 17, 21],
  sus: [0, 5, 7], sus2sus4: [0, 2, 5, 7],
  "69": [0, 4, 7, 9, 14], m69: [0, 3, 7, 9, 14], aug7: EXTENDED_CHORD_INTERVALS["7#5"],
  "9": [0, 4, 7, 10, 14], "9b5": [0, 4, 6, 10, 14], aug9: [0, 4, 8, 10, 14],
  "7b9": [0, 4, 7, 10, 13], "9#11": [0, 4, 7, 10, 14, 18],
  maj7sus2: [0, 2, 7, 11], maj9: [0, 4, 7, 11, 14], maj11: [0, 4, 7, 11, 14, 17],
  maj13: [0, 4, 7, 11, 14, 17, 21], m9: [0, 3, 7, 10, 14], m11: [0, 3, 7, 10, 14, 17],
  mmaj7: EXTENDED_CHORD_INTERVALS.mMaj7, mmaj7b5: [0, 3, 6, 11],
  mmaj9: [0, 3, 7, 11, 14], mmaj11: [0, 3, 7, 11, 14, 17],
} as const;
export type HarmonicQuality = keyof typeof CHORD_TONE_INTERVALS;

function knownQuality(value: string | null): value is HarmonicQuality {
  return value !== null && Object.hasOwn(CHORD_TONE_INTERVALS, value);
}
export type HarmonyChord = {
  symbol: string;
  parsed: Chord;
  quality: HarmonicQuality | null;
  pitches: readonly PitchClass[] | null;
};
export type HarmonicDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function createKey(root: string, mode: KeyMode): Key {
  if (mode !== "major" && mode !== "minor") throw new RangeError("Mode invalide.");
  const scale = generateScale(root, mode === "major" ? "major" : "natural-minor");
  return { tonic: scale.root, mode, scale };
}

export function chordFromSymbol(input: string): HarmonyChord | null {
  const normalized = normalizeChordName(input);
  const symbol = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  const parsed = parseChord(symbol);
  if (!parsed) return null;
  const candidate = knownQuality(parsed.suffix) ? parsed.suffix : resolveChordQuality(parsed.suffix);
  const quality = knownQuality(candidate) ? candidate : null;
  const pitches = quality === null ? null : CHORD_TONE_INTERVALS[quality].map((interval) => pitchClass(parsed.root.pitchClass + interval));
  if (pitches && parsed.bass && !pitches.includes(parsed.bass.pitchClass)) pitches.push(parsed.bass.pitchClass);
  return { symbol, parsed, quality, pitches };
}

export function buildHarmonyChord(root: string, quality: HarmonicQuality): HarmonyChord {
  if (!Object.hasOwn(CHORD_TONE_INTERVALS, quality)) throw new RangeError("Qualité d’accord invalide.");
  const suffix = Object.hasOwn(QUALITY_SUFFIXES, quality) ? QUALITY_SUFFIXES[quality as ChordQuality] : quality;
  const chord = chordFromSymbol(root + suffix);
  if (!chord) throw new RangeError("Fondamentale d’accord invalide.");
  return chord;
}

export function diatonicChord(key: Key, degree: HarmonicDegree, seventh = false): HarmonyChord {
  if (!Number.isInteger(degree) || degree < 1 || degree > 7) throw new RangeError("Degré invalide.");
  const root = key.scale.notes[degree - 1];
  const intervals = (seventh ? [0, 2, 4, 6] : [0, 2, 4]).map((offset) =>
    pitchClass(key.scale.notes[(degree - 1 + offset) % 7].pitchClass - root.pitchClass),
  );
  const quality = (Object.keys(CHORD_TONE_INTERVALS) as HarmonicQuality[]).find((candidate) => {
    const expected = CHORD_TONE_INTERVALS[candidate];
    return expected.length === intervals.length && expected.every((value, index) => value === intervals[index]);
  });
  if (!quality) throw new RangeError("Harmonisation non prise en charge.");
  return buildHarmonyChord(root.name, quality);
}

const ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;
export function romanDegree(degree: HarmonicDegree, quality: HarmonicQuality | null): string | null {
  const roman = ROMANS[degree - 1];
  if (!roman || quality === null) return null;
  if (quality === "minor") return roman.toLowerCase();
  if (quality === "dim") return `${roman.toLowerCase()}°`;
  if (quality === "m7") return `${roman.toLowerCase()}7`;
  if (quality === "m7b5") return `${roman.toLowerCase()}ø7`;
  if (quality === "major") return roman;
  return `${roman}${quality}`;
}

export function chordInKey(key: Key, chord: HarmonyChord): {
  degree: HarmonicDegree | null;
  roman: string | null;
  isDiatonic: boolean | null;
} {
  const index = key.scale.notes.findIndex((note) => note.pitchClass === chord.parsed.root.pitchClass);
  const degree = index < 0 ? null : (index + 1) as HarmonicDegree;
  return {
    degree,
    roman: degree === null ? null : romanDegree(degree, chord.quality),
    // Unknown extensions remain valid chord symbols; their harmonic analysis is not guessed.
    isDiatonic: chord.pitches === null ? null : chord.pitches.every((value) => key.scale.notes.some((note) => note.pitchClass === value)),
  };
}
