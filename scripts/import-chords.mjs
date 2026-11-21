import { QUALITIES, ROOT_PITCH, QUALITY_SUFFIXES } from "../src/domain/music/catalog.ts";
import { CHORD_TONE_INTERVALS } from "../src/domain/music/harmony.ts";
import { parseChord } from "../src/domain/music/chords.ts";
import { pitchClass } from "../src/domain/music/pitch.ts";
import { STANDARD_TUNING } from "../src/domain/music/tuning.ts";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
// Usage: node scripts/import-chords.mjs source.json revision-sha
// Imports existing fingerings only. No generated or transposed chord shapes.
const [sourcePath, revision] = process.argv.slice(2);
if (!sourcePath || !/^[a-f0-9]{40}$/.test(revision ?? ""))
  throw Error("Supply the upstream JSON and its full Git revision.");
const raw = await readFile(sourcePath, "utf8");
const source = JSON.parse(raw);
if (source.suffixes.length !== QUALITIES.length || source.suffixes.some(suffix => !QUALITIES.includes(suffix)))
  throw Error("The source and dictionary suffix lists differ; review the catalog.");
const pitches = ROOT_PITCH;
const tuning = STANDARD_TUNING.strings;
const suffixes = QUALITY_SUFFIXES;
// Explicit guitar voicing omissions: extensions need not fit every theoretical
// chord tone on six strings. The root and defining color remain mandatory.
const optionalIntervals = {
  "6": [7], m6: [7], "69": [7], m69: [7], add11: [7],
  "7": [7], maj7: [7], m7: [7], "7sus4": [7], "7#9": [7], "7b9": [7],
  "9": [7], m9: [7], maj9: [7], mmaj9: [7], "9#11": [7, 2],
  "11": [4, 7, 2], m11: [7, 2], mmaj11: [7, 2], maj11: [7, 2],
  "13": [7, 2, 5], maj13: [7, 2, 5],
};
function validateVoicing(chord, midi) {
  const parsed = parseChord(chord.key + suffixes[chord.suffix]);
  const base = parsed.suffix || "major";
  // In chords-db only, "alt" denotes the major triad with a flattened fifth.
  const quality = base === "alt" ? "(b5)" : base === "m" ? "minor" : base;
  const tones = CHORD_TONE_INTERVALS[quality].map(pitchClass);
  const optional = optionalIntervals[quality] ?? [];
  let required = tones.filter(tone => !optional.includes(tone));
  if (parsed.bass) {
    if (pitchClass(Math.min(...midi)) !== parsed.bass.pitchClass) throw Error("slash bass");
    const bassInterval = pitchClass(parsed.bass.pitchClass - parsed.root.pitchClass);
    tones.push(bassInterval);
    // The source's m9 over its minor seventh often omits the third. Keep the
    // fifth mandatory in these four-tone voicings; a major third is never allowed.
    if (quality === "m9" && bassInterval === 10 && !midi.some(note => pitchClass(note - parsed.root.pitchClass) === 3))
      required = [0, 7, 10, 2];
  }
  const actual = new Set(midi.map(note => pitchClass(note - pitches[chord.key])));
  if ([...actual].some(note => !tones.includes(note)) || required.some(note => !actual.has(note)))
    throw Error("chord tones");
}
const chords = [];
const rejected = [];
for (const entries of Object.values(source.chords))
  for (const chord of entries) {
    if (!QUALITIES.includes(chord.suffix)) throw Error(`Unknown chord type: ${chord.suffix}`);
    const positions = [];
    for (const [index, position] of chord.positions.entries()) {
      try {
        const { baseFret, fingers } = position;
        if (!Number.isInteger(baseFret) || baseFret < 1)
          throw Error("base fret");
        if (position.frets.length !== 6 || fingers.length !== 6)
          throw Error("strings");
        const frets = position.frets.map((fret) =>
          fret > 0 ? fret + baseFret - 1 : fret,
        );
        if (
          frets.some(
            (fret) => !Number.isInteger(fret) || fret < -1 || fret > 24,
          )
        )
          throw Error("frets");
        if (
          fingers.some(
            (finger, i) =>
              !Number.isInteger(finger) ||
              finger < 0 ||
              finger > 4 ||
              (frets[i] <= 0 ? finger !== 0 : finger === 0),
          )
        )
          throw Error("fingers");
        if (
          frets.some(
            (fret) => fret > 0 && (fret < baseFret || fret >= baseFret + 5),
          )
        )
          throw Error("display range");
        const midi = frets.flatMap((fret, i) =>
          fret === -1 ? [] : [tuning[i] + fret],
        );
        if (JSON.stringify(midi) !== JSON.stringify(position.midi))
          throw Error("upstream midi mismatch");
        validateVoicing(chord, midi);
        const barres = (position.barres ?? []).map((relative) => {
          const fret = relative + baseFret - 1;
          // Other fingers sometimes fret a separate string on the same fret.
          // Accept a barre only if its finger and span are unambiguous.
          const candidates = [1, 2, 3, 4].flatMap(finger => {
            const strings = frets.flatMap((value, i) => value === fret && fingers[i] === finger ? [i] : []);
            const fromString = strings[0], toString = strings.at(-1);
            if (strings.length < 2 || frets.slice(fromString, toString + 1).some(value => value < fret))
              return [];
            return [{ fret, fromString, toString, finger }];
          });
          if (candidates.length !== 1) throw Error("barre span");
          return candidates[0];
        });
        const id = `${chord.key}-${chord.suffix}-${index + 1}`;
        if (
          !positions.some(
            (p) => JSON.stringify(p.frets) === JSON.stringify(frets),
          )
        )
          positions.push({ id, frets, fingers, baseFret, barres });
      } catch (error) {
        rejected.push({
          chord: chord.key + chord.suffix,
          position: index + 1,
          reason: error.message,
        });
      }
    }
    if (positions.length)
      chords.push({
        id: `${chord.key}-${chord.suffix}`,
        root: chord.key,
        quality: chord.suffix,
        displayName: chord.key + suffixes[chord.suffix],
        positions,
      });
  }
await writeFile(
  "src/data/chords/dataset.ts",
  `// Imported from chords-db ${revision}; see PROVENANCE.json and LICENSE.chords-db.txt.\nimport type { GuitarChord } from "../../features/chords/lib/model.ts";\nexport const CHORDS: readonly GuitarChord[] = ${JSON.stringify(chords, null, 2)};\n`,
);
await writeFile(
  "src/data/chords/PROVENANCE.json",
  JSON.stringify(
    {
      source: "https://github.com/tombatossals/chords-db",
      revision,
      sourceFile: "lib/guitar.json",
      sha256: createHash("sha256").update(raw).digest("hex"),
      license: "MIT",
      conversion:
        "Low E to high e; absolute frets; barre spans from matching frets and fingers. Source MIDI, chord tones, defining extensions and lowest slash bass verified. Guitar omissions are listed in scripts/import-chords.mjs. No invented or transposed positions.",
      suffixes: source.suffixes,
      chords: chords.length,
      positions: chords.reduce((sum, chord) => sum + chord.positions.length, 0),
      rejected,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `${chords.length} chords, ${chords.reduce((sum, chord) => sum + chord.positions.length, 0)} positions; ${rejected.length} excluded.`,
);
