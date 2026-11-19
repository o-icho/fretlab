import { buildHarmonyChord, CHORD_TONE_INTERVALS } from "./harmony.ts";
import { NOTE_LETTERS, noteName, parseNote, pitchClass, spellPitchClass } from "./pitch.ts";

export type EarExerciseKind = "chord" | "interval";
export type EarChordSize = "mixed" | "3" | "4";
export type EarIntervalDirection = "mixed" | "ascending" | "descending";
export type EarExerciseOptions = { chordSize?: EarChordSize; direction?: EarIntervalDirection };
export type EarExercise = { id: string; kind: EarExerciseKind; answer: string; detail: string; notes: string[]; midi: number[] };
/** Common explicit 3/4-note voicings, one entry per sound (no synonymous duplicates). */
export const EAR_CHORDS = [
  { quality: "major", label: "Majeur", degrees: [1, 3, 5] },
  { quality: "minor", label: "Mineur", degrees: [1, 3, 5] },
  { quality: "dim", label: "Diminué", degrees: [1, 3, 5] },
  { quality: "aug", label: "Augmenté", degrees: [1, 3, 5] },
  { quality: "sus2", label: "Suspendu seconde", degrees: [1, 2, 5] },
  { quality: "sus4", label: "Suspendu quarte", degrees: [1, 4, 5] },
  { quality: "(b5)", label: "Majeur, quinte diminuée", degrees: [1, 3, 5] },
  { quality: "7", label: "Septième de dominante", degrees: [1, 3, 5, 7] },
  { quality: "maj7", label: "Septième majeure", degrees: [1, 3, 5, 7] },
  { quality: "m7", label: "Mineur septième", degrees: [1, 3, 5, 7] },
  { quality: "m7b5", label: "Demi-diminué", degrees: [1, 3, 5, 7] },
  { quality: "dim7", label: "Septième diminuée", degrees: [1, 3, 5, 7] },
  { quality: "mMaj7", label: "Mineur, septième majeure", degrees: [1, 3, 5, 7] },
  { quality: "6", label: "Sixte majeure", degrees: [1, 3, 5, 6] },
  { quality: "m6", label: "Mineur sixte", degrees: [1, 3, 5, 6] },
  { quality: "add9", label: "Neuvième ajoutée", degrees: [1, 3, 5, 9] },
  { quality: "madd9", label: "Mineur, neuvième ajoutée", degrees: [1, 3, 5, 9] },
  { quality: "add11", label: "Onzième ajoutée", degrees: [1, 3, 5, 11] },
  { quality: "7sus2", label: "Septième suspendue seconde", degrees: [1, 2, 5, 7] },
  { quality: "7sus4", label: "Septième suspendue quarte", degrees: [1, 4, 5, 7] },
  { quality: "7b5", label: "Septième, quinte diminuée", degrees: [1, 3, 5, 7] },
  { quality: "7#5", label: "Septième, quinte augmentée", degrees: [1, 3, 5, 7] },
  { quality: "maj7b5", label: "Septième majeure, quinte diminuée", degrees: [1, 3, 5, 7] },
  { quality: "maj7#5", label: "Septième majeure, quinte augmentée", degrees: [1, 3, 5, 7] },
] as const;
// One entry per audible distance: enharmonic names do not double the probability.
const INTERVALS = [
  [0, 1, "Unisson juste"], [1, 2, "Seconde mineure"], [2, 2, "Seconde majeure"],
  [3, 3, "Tierce mineure"], [4, 3, "Tierce majeure"], [5, 4, "Quarte juste"],
  [6, 4, "Triton"], [7, 5, "Quinte juste"], [8, 6, "Sixte mineure"],
  [9, 6, "Sixte majeure"], [10, 7, "Septième mineure"], [11, 7, "Septième majeure"],
  [12, 8, "Octave juste"],
] as const;

/** Selected root = chord fundamental or first interval note, regardless of mode. */
function buildEarExercises(root: string, kind: EarExerciseKind): EarExercise[] {
  const parsed = parseNote(root);
  if (!parsed) throw new RangeError("Fondamentale invalide.");
  const base = 60 + parsed.pitchClass;
  const spelled = (distance: number, degreeOffset: number) => {
    const letter = NOTE_LETTERS[(NOTE_LETTERS.indexOf(parsed.spelling.letter) + degreeOffset + 14) % 7];
    const pc = pitchClass(parsed.pitchClass + distance);
    // Shared spelling supports single accidentals; use an enharmonic fallback otherwise.
    return spellPitchClass(pc, letter)?.name ?? noteName(pc, root.includes("b") ? "flats" : "sharps");
  };
  if (kind === "chord") return EAR_CHORDS.map(({ quality, label, degrees }) => {
    const tones = CHORD_TONE_INTERVALS[quality];
    return { id: `chord-${quality}`, kind, answer: buildHarmonyChord(root, quality).symbol,
      detail: `${label} · ${tones.length} notes · position fondamentale`,
      notes: tones.map((distance, index) => spelled(distance, degrees[index] - 1)), midi: tones.map(distance => base + distance) };
  });
  if (kind !== "interval") throw new RangeError("Exercice invalide.");
  return INTERVALS.flatMap(([distance, degree, name]): EarExercise[] =>
    (distance === 0 ? [1] : [1, -1]).map(direction => ({
      id: `interval-${distance}-${direction}`, kind,
      answer: distance === 0 ? name : `${name} ${direction === 1 ? "ascendant" : "descendant"}${name === "Triton" ? "" : "e"}`,
      detail: `${distance} demi-ton${distance > 1 ? "s" : ""}`,
      notes: [root, spelled(distance * direction, (degree - 1) * direction)],
      midi: [base, base + distance * direction],
    })));
}

/** Filter before drawing so each eligible exercise keeps the same probability. */
export function earExercises(root: string, kind: EarExerciseKind, options: EarExerciseOptions = {}): EarExercise[] {
  const size = options.chordSize ?? "mixed", direction = options.direction ?? "mixed";
  if (!["mixed", "3", "4"].includes(size) || !["mixed", "ascending", "descending"].includes(direction)) throw new RangeError("Filtre invalide.");
  return buildEarExercises(root, kind).filter(exercise => {
    if (kind === "chord") return size === "mixed" || exercise.midi.length === Number(size);
    const distance = exercise.midi[1] - exercise.midi[0];
    // Unison has no direction and belongs only to the mixed pool.
    return direction === "mixed" || (direction === "ascending" ? distance > 0 : distance < 0);
  });
}

/** Independent equiprobable draws, including immediate repetitions. */
export function drawEarExercise(pool: readonly EarExercise[], random = Math.random): EarExercise {
  const value = random();
  if (!pool.length || !Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError("Tirage invalide.");
  return pool[Math.floor(value * pool.length)];
}
export const EAR_NOTE_SPACING_SECONDS = 0.7;
export function earNoteStarts(count: number, together = false): number[] {
  if (!Number.isInteger(count) || count < 1 || count > 4) throw new RangeError("Nombre de notes invalide.");
  return Array.from({ length: count }, (_, index) => together ? 0 : index * EAR_NOTE_SPACING_SECONDS);
}
