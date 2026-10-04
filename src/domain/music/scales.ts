import { FLAT_NOTES, SHARP_NOTES, noteName, parseNote, pitchClass, type AccidentalPreference, type NoteSpelling, type PitchClass } from "./pitch.ts";
import { spellInterval, type Interval } from "./intervals.ts";

export type ScaleDefinition = {
  id: string;
  name: string;
  intervals: readonly Interval[];
};

// Degrees are relative to the major scale, including the lowered fifth in blues.
export const SCALE_DEFINITIONS = [
  { id: "major", name: "Majeure", intervals: [
    { degree: 1, semitones: 0, label: "1" }, { degree: 2, semitones: 2, label: "2" },
    { degree: 3, semitones: 4, label: "3" }, { degree: 4, semitones: 5, label: "4" },
    { degree: 5, semitones: 7, label: "5" }, { degree: 6, semitones: 9, label: "6" },
    { degree: 7, semitones: 11, label: "7" },
  ] },
  { id: "natural-minor", name: "Mineure naturelle", intervals: [
    { degree: 1, semitones: 0, label: "1" }, { degree: 2, semitones: 2, label: "2" },
    { degree: 3, semitones: 3, label: "b3" }, { degree: 4, semitones: 5, label: "4" },
    { degree: 5, semitones: 7, label: "5" }, { degree: 6, semitones: 8, label: "b6" },
    { degree: 7, semitones: 10, label: "b7" },
  ] },
  { id: "major-pentatonic", name: "Pentatonique majeure", intervals: [
    { degree: 1, semitones: 0, label: "1" }, { degree: 2, semitones: 2, label: "2" },
    { degree: 3, semitones: 4, label: "3" }, { degree: 5, semitones: 7, label: "5" },
    { degree: 6, semitones: 9, label: "6" },
  ] },
  { id: "minor-pentatonic", name: "Pentatonique mineure", intervals: [
    { degree: 1, semitones: 0, label: "1" }, { degree: 3, semitones: 3, label: "b3" },
    { degree: 4, semitones: 5, label: "4" }, { degree: 5, semitones: 7, label: "5" },
    { degree: 7, semitones: 10, label: "b7" },
  ] },
  { id: "minor-blues", name: "Blues mineure", intervals: [
    { degree: 1, semitones: 0, label: "1" }, { degree: 3, semitones: 3, label: "b3" },
    { degree: 4, semitones: 5, label: "4" }, { degree: 5, semitones: 6, label: "b5" },
    { degree: 5, semitones: 7, label: "5" }, { degree: 7, semitones: 10, label: "b7" },
  ] },
  { id: "dorian", name: "Dorien", intervals: [
    { degree: 1, semitones: 0, label: "1" }, { degree: 2, semitones: 2, label: "2" },
    { degree: 3, semitones: 3, label: "b3" }, { degree: 4, semitones: 5, label: "4" },
    { degree: 5, semitones: 7, label: "5" }, { degree: 6, semitones: 9, label: "6" },
    { degree: 7, semitones: 10, label: "b7" },
  ] },
  { id: "mixolydian", name: "Mixolydien", intervals: [
    { degree: 1, semitones: 0, label: "1" }, { degree: 2, semitones: 2, label: "2" },
    { degree: 3, semitones: 4, label: "3" }, { degree: 4, semitones: 5, label: "4" },
    { degree: 5, semitones: 7, label: "5" }, { degree: 6, semitones: 9, label: "6" },
    { degree: 7, semitones: 10, label: "b7" },
  ] },
] as const satisfies readonly ScaleDefinition[];

export type ScaleId = (typeof SCALE_DEFINITIONS)[number]["id"];
export type ScaleNotation = "auto" | AccidentalPreference;
export type ScaleNote = {
  pitchClass: PitchClass;
  name: string;
  spelling: NoteSpelling;
  interval: Interval;
  isRoot: boolean;
};
export type Scale = {
  definition: ScaleDefinition;
  requestedRoot: string;
  root: { name: string; pitchClass: PitchClass; spelling: NoteSpelling };
  notation: ScaleNotation;
  notes: readonly ScaleNote[];
};

export function isScaleId(value: string): value is ScaleId {
  return SCALE_DEFINITIONS.some((definition) => definition.id === value);
}

/** Auto preserves the chosen root unless it would require double accidentals. */
export function generateScale(rootName: string, id: ScaleId, notation: ScaleNotation = "auto"): Scale {
  const root = parseNote(rootName);
  const definition = SCALE_DEFINITIONS.find((item) => item.id === id);
  if (!root || !definition) throw new RangeError("Fondamentale ou gamme invalide.");
  if (!["auto", "sharps", "flats"].includes(notation)) throw new RangeError("Notation invalide.");
  let displayedRoot = rootName;
  let spellings = definition.intervals.map((interval) => spellInterval(root, interval));
  if (notation === "auto" && spellings.some((spelling) => spelling === null)) {
    const candidates = [FLAT_NOTES[root.pitchClass], SHARP_NOTES[root.pitchClass]];
    const alternative = candidates.find((name) => definition.intervals.every((interval) => spellInterval(parseNote(name)!, interval)));
    if (!alternative) throw new RangeError("Orthographe de gamme non prise en charge.");
    displayedRoot = alternative;
    spellings = definition.intervals.map((interval) => spellInterval(parseNote(alternative)!, interval));
  } else if (notation !== "auto") {
    displayedRoot = noteName(root.pitchClass, notation);
  }
  const notes = definition.intervals.map((interval, index): ScaleNote => {
    const notePitch = pitchClass(root.pitchClass + interval.semitones);
    const spelling = notation === "auto"
      ? spellings[index]!
      : { name: noteName(notePitch, notation), spelling: parseNote(noteName(notePitch, notation))!.spelling };
    return { ...spelling, pitchClass: notePitch, interval, isRoot: interval.semitones === 0 };
  });
  return { definition, requestedRoot: rootName, root: { ...parseNote(displayedRoot)!, name: displayedRoot }, notation, notes };
}
