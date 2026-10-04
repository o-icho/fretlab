import { isChord, transposeChord } from "../../domain/music/chords.ts";
import type { AccidentalPreference } from "../../domain/music/pitch.ts";
export { isChord, transposeChord } from "../../domain/music/chords.ts";
export { transposeNote, SHARP_NOTES, FLAT_NOTES, type AccidentalPreference } from "../../domain/music/pitch.ts";

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
