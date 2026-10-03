export type AccidentalPreference = "sharps" | "flats";

export const SHARP_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;
export const FLAT_NOTES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;
const NATURAL_PITCH: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};
const NOTE = /^([A-G])([#b♯♭]?)$/;
// Explicit musical grammar: never accept arbitrary letters following a root.
const CHORD =
  /^([A-G][#b♯♭]?)((?:(?:maj|min|m|dim|aug|sus2|sus4|sus|add(?:2|4|9|11|13)|M|Δ|ø|°|\+|-)?(?:5|6|7|9|11|13)?)(?:(?:add|no|omit)(?:2|3|4|5|6|7|9|11|13)|[#b](?:5|9|11|13)|sus[24]|\((?:[#b]?(?:5|6|7|9|11|13))(?:,[#b]?(?:5|6|7|9|11|13))*\))*)(?:\/([A-G][#b♯♭]?))?$/;
const mod12 = (value: number) => ((value % 12) + 12) % 12;

export function transposeNote(
  note: string,
  semitones: number,
  preference: AccidentalPreference = "sharps",
): string {
  if (!Number.isInteger(semitones))
    throw new RangeError(
      "La transposition doit être un nombre entier de demi-tons.",
    );
  const match = NOTE.exec(note);
  if (!match) return note;
  const accidental =
    match[2] === "#" || match[2] === "♯"
      ? 1
      : match[2] === "b" || match[2] === "♭"
        ? -1
        : 0;
  const notes = preference === "flats" ? FLAT_NOTES : SHARP_NOTES;
  return notes[mod12(NATURAL_PITCH[match[1]] + accidental + semitones)];
}

export function isChord(value: string): boolean {
  return CHORD.test(value);
}

export function transposeChord(
  chord: string,
  semitones: number,
  preference: AccidentalPreference = "sharps",
): string {
  const match = CHORD.exec(chord);
  if (!match) return chord;
  const [, root, suffix, bass] = match;
  return (
    transposeNote(root, semitones, preference) +
    suffix +
    (bass ? `/${transposeNote(bass, semitones, preference)}` : "")
  );
}

function tokenParts(
  token: string,
): { before: string; chord: string; after: string } | null {
  // Try longest chord first so C7(b9) retains its musical parentheses.
  const before = /^[([{]*/.exec(token)![0];
  const rest = token.slice(before.length);
  for (let end = rest.length; end > 0; end--) {
    const chord = rest.slice(0, end);
    const after = rest.slice(end);
    if (!/^[)\]},;.!?:]*$/.test(after)) break;
    if (isChord(chord)) return { before, chord, after };
  }
  return null;
}

/**
 * Only chord-only lines and explicit [chords] inside prose are musical contexts.
 * Preserve all whitespace, punctuation, line endings and lyric characters exactly.
 * A bare A on its own line is inherently ambiguous and is treated as a chord.
 */
export function transposeText(
  text: string,
  semitones: number,
  preference: AccidentalPreference = "sharps",
): string {
  if (!Number.isInteger(semitones))
    throw new RangeError(
      "La transposition doit être un nombre entier de demi-tons.",
    );
  return text
    .split(/(\r\n|\n|\r)/)
    .map((line) => {
      const tokens = line.split(/([\t ]+|[|:]+)/);
      const musical = tokens.filter(
        (token) => token && !/^[\s|:]+$/.test(token),
      );
      if (
        musical.length > 0 &&
        musical.every((token) => tokenParts(token) !== null)
      ) {
        return tokens
          .map((token) => {
            const parts = tokenParts(token);
            return parts
              ? parts.before +
                  transposeChord(parts.chord, semitones, preference) +
                  parts.after
              : token;
          })
          .join("");
      }
      // Square brackets explicitly mark chords in lyrics; other prose stays intact.
      return line.replace(
        /\[([^\[\]\r\n]+)\]/g,
        (whole: string, chord: string) =>
          isChord(chord)
            ? `[${transposeChord(chord, semitones, preference)}]`
            : whole,
      );
    })
    .join("");
}
