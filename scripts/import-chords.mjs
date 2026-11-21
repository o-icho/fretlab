import { QUALITIES, ROOT_PITCH, QUALITY_SUFFIXES } from "../src/domain/music/catalog.ts";
import { CHORD_TONE_INTERVALS } from "../src/domain/music/harmony.ts";
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
// Reuse the shared musical catalog, parser pitch identities and standard tuning.
const intervals = Object.fromEntries(QUALITIES.map(quality => [quality, CHORD_TONE_INTERVALS[quality].map(note => note % 12)]));
const pitches = ROOT_PITCH;
const tuning = STANDARD_TUNING.strings;
const suffixes = QUALITY_SUFFIXES;
// Explicit guitar voicing omissions: extensions need not fit every theoretical
// chord tone on six strings. The root and defining color remain mandatory.
const omitted = {
  "7": [7], maj7: [7], m7: [7], "7sus4": [7], "7#9": [7],
  "11": [4, 7, 2], "13": [7, 2, 5],
};
const chords = [];
const rejected = [];
for (const entries of Object.values(source.chords))
  for (const chord of entries) {
    if (!(chord.suffix in intervals)) continue;
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
        const actual = [
          ...new Set(
            midi.map((note) => (note - pitches[chord.key] + 120) % 12),
          ),
        ].sort((a, b) => a - b);
        const expected = intervals[chord.suffix];
        const essential = expected.filter(note => !(omitted[chord.suffix] ?? []).includes(note));
        if (
          actual.some((note) => !expected.includes(note)) ||
          essential.some((note) => !actual.includes(note))
        )
          throw Error("chord tones");
        const barres = (position.barres ?? []).map((relative) => {
          const fret = relative + baseFret - 1;
          const strings = frets.flatMap((value, i) =>
            value === fret ? [i] : [],
          );
          if (strings.length < 2) throw Error("barre endpoints");
          const fromString = strings[0],
            toString = strings.at(-1),
            finger = fingers[fromString];
          if (
            !finger ||
            strings.some((i) => fingers[i] !== finger) ||
            frets.slice(fromString, toString + 1).some((value) => value < fret)
          )
            throw Error("barre span");
          return { fret, fromString, toString, finger };
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
  `// Imported from chords-db ${revision}; see PROVENANCE.json and LICENSE.chords-db.txt.\nimport type { GuitarChord } from "../../features/chords/lib/model.ts";\nexport const CHORDS = ${JSON.stringify(chords, null, 2)} as const satisfies readonly GuitarChord[];\n`,
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
        "Low E to high e; frets converted from relative to absolute; barre spans derived from upstream endpoints. Shared chord-tone definitions; seventh voicings may omit the perfect fifth; 11 requires root, fourth and minor seventh; 13 requires root, major third, minor seventh and sixth. Optional tones must belong to the theoretical chord. No invented positions.",
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
