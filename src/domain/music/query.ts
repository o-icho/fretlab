import { QUALITIES, ROOT_PITCH, QUALITY_SUFFIXES, type ChordRoot, type ChordQuality } from "./catalog.ts";
import { parseChord } from "./chords.ts";
import { parseNote } from "./pitch.ts";

// Search aliases are an input adapter; strict musical parsing remains in chords.ts.
const SUFFIXES = new Map<string, ChordQuality>(QUALITIES.map(quality => [QUALITY_SUFFIXES[quality], quality]));
for (const [alias, quality] of Object.entries({
  M: "major", major: "major", majeur: "major", maj: "major",
  min: "minor", minor: "minor", mineur: "minor", M7: "maj7", Δ7: "maj7",
  min7: "m7", "°": "dim", ø: "m7b5", ø7: "m7b5",
} as const)) SUFFIXES.set(alias, quality);

export type ChordQuery = { root: ChordRoot; quality: ChordQuality; name: string };

export function normalizeChordName(input: string): string {
  return input.trim().replace(/[♯＃]/g, "#").replace(/♭/g, "b").replace(/\s+/g, "");
}

export function resolveChordQuality(suffix: string): ChordQuality | null {
  const exact = SUFFIXES.get(suffix);
  if (exact) return exact;
  if (/^M\d/.test(suffix)) {
    const extension = suffix.slice(1);
    return SUFFIXES.get(extension.startsWith("6") ? extension : "maj" + extension) ?? null;
  }
  return SUFFIXES.get(suffix.toLowerCase()) ?? null;
}

export function parseChordName(input: string): ChordQuery | null {
  const normalized = normalizeChordName(input).replace(/6\/9(?=\/|$)/, "69");
  const match = /^([a-gA-G])([#b]?)([^/]*)(?:\/([a-gA-G][#b]?))?$/.exec(normalized);
  if (!match) return null;
  const root = (match[1].toUpperCase() + match[2]) as ChordRoot;
  const base = resolveChordQuality(match[3]);
  if (!Object.hasOwn(ROOT_PITCH, root) || !base) return null;

  const bass = match[4] ? match[4][0].toUpperCase() + match[4].slice(1) : "";
  const symbol = QUALITY_SUFFIXES[base] + (bass ? "/" + bass : "");
  let quality = SUFFIXES.get(symbol);
  if (!quality && bass) {
    const pitch = parseNote(bass)!.pitchClass;
    // E.g. C/Gb uses the same source positions as the catalogued C/F#.
    quality = QUALITIES.find(candidate => {
      const [prefix, bassName] = QUALITY_SUFFIXES[candidate].split("/");
      return bassName && prefix === QUALITY_SUFFIXES[base] && parseNote(bassName)?.pitchClass === pitch;
    });
  }
  const name = root + symbol;
  return quality && parseChord(name) ? { root, quality, name } : null;
}
