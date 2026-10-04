import { buildHarmonyChord, chordFromSymbol, chordInKey, createKey, diatonicChord, type Key, type KeyMode } from "./harmony.ts";
import type { Progression, ProgressionBar, ProgressionFamily, ProgressionLength, ProgressionTemplate } from "./progression-model.ts";
import { PROGRESSION_TEMPLATES } from "./progression-templates.ts";
export type { Progression, ProgressionBar, ProgressionFamily, ProgressionLength } from "./progression-model.ts";
export type RandomSource = () => number;

export function matchingTemplates(mode: KeyMode, family: ProgressionFamily, length: ProgressionLength) {
  return PROGRESSION_TEMPLATES.filter((template) => template.mode === mode && template.families.includes(family) && template.lengths.includes(length));
}
export function availableLengths(mode: KeyMode, family: ProgressionFamily): ProgressionLength[] {
  return ([4, 8, 12] as const).filter((length) => matchingTemplates(mode, family, length).length > 0);
}

export function progressionFromTemplate(key: Key, template: ProgressionTemplate, family: ProgressionFamily, length: ProgressionLength): Progression {
  if (template.mode !== key.mode || !template.families.includes(family) || !template.lengths.includes(length) || !template.steps.length || length % template.steps.length !== 0) {
    throw new RangeError("Template incompatible avec ces réglages.");
  }
  const bars = Array.from({ length }, (_, index): ProgressionBar => {
    const step = template.steps[index % template.steps.length];
    const chord = step.quality
      ? buildHarmonyChord(key.scale.notes[step.degree - 1].name, step.quality)
      : diatonicChord(key, step.degree, step.seventh);
    const analysis = chordInKey(key, chord);
    if (analysis.isDiatonic === false && !step.alteration) throw new RangeError("Accord non diatonique sans altération déclarée.");
    return { chord, ...analysis, alteration: step.alteration ?? null, locked: false, edited: false };
  });
  return { key, family, bars, generatedFromTemplate: { id: template.id, name: template.name, description: template.description } };
}

function sameChord(a: ProgressionBar, b: ProgressionBar): boolean {
  return a.chord.parsed.root.pitchClass === b.chord.parsed.root.pitchClass &&
    (a.chord.quality !== null && b.chord.quality !== null ? a.chord.quality === b.chord.quality : a.chord.parsed.suffix === b.chord.parsed.suffix) &&
    a.chord.parsed.bass?.pitchClass === b.chord.parsed.bass?.pitchClass;
}
export type GenerationResult =
  | { ok: true; progression: Progression }
  | { ok: false; reason: "unavailable" | "locked-settings" | "locked-template" | "no-alternative"; message: string };

/** Select a whole verified template; never patch incompatible bars with arbitrary chords. */
export function generateProgression(options: {
  root: string; mode: KeyMode; family: ProgressionFamily; length: ProgressionLength;
  random: RandomSource; previous?: Progression;
}): GenerationResult {
  const key = createKey(options.root, options.mode);
  const previous = options.previous;
  const hasLocks = previous?.bars.some((bar) => bar.locked) ?? false;
  if (hasLocks && previous && (previous.key.tonic.name !== key.tonic.name || previous.key.mode !== key.mode || previous.bars.length !== options.length)) {
    return { ok: false, reason: "locked-settings", message: "Déverrouillez les mesures avant de changer la tonalité, le mode ou la longueur." };
  }
  const candidates = matchingTemplates(options.mode, options.family, options.length).map((template) => progressionFromTemplate(key, template, options.family, options.length));
  if (!candidates.length) return { ok: false, reason: "unavailable", message: "Aucun template ne correspond à ces réglages." };
  const compatible = candidates.filter((candidate) => !hasLocks || previous!.bars.every((bar, index) => !bar.locked || sameChord(bar, candidate.bars[index])));
  if (!compatible.length) return { ok: false, reason: "locked-template", message: "Les mesures verrouillées ne correspondent à aucun template compatible. Déverrouillez une mesure pour continuer." };
  const alternatives = compatible.filter((candidate) => !previous || previous.key.tonic.name !== key.tonic.name || previous.key.mode !== key.mode || previous.bars.length !== candidate.bars.length || candidate.bars.some((bar, index) => !sameChord(bar, previous.bars[index])));
  if (!alternatives.length) return { ok: false, reason: "no-alternative", message: hasLocks ? "Aucune autre progression ne respecte ces verrous. Déverrouillez une mesure pour explorer d’autres templates." : "Cette sélection ne propose pas d’autre progression. Essayez une autre famille ou tonalité." };
  const sample = options.random();
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) throw new RangeError("La source aléatoire doit retourner une valeur entre 0 inclus et 1 exclu.");
  const selected = alternatives[Math.floor(sample * alternatives.length)];
  return { ok: true, progression: { ...selected, bars: selected.bars.map((bar, index) => hasLocks && previous?.bars[index].locked ? previous.bars[index] : bar) } };
}

export function createSeededRandom(seed: number): RandomSource {
  if (!Number.isInteger(seed)) throw new RangeError("Seed entier requis.");
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function requireBar(progression: Progression, index: number) {
  if (!Number.isInteger(index) || !progression.bars[index]) throw new RangeError("Mesure invalide.");
  return progression.bars[index];
}
export function toggleBarLock(progression: Progression, index: number): Progression {
  const bar = requireBar(progression, index);
  return { ...progression, bars: progression.bars.map((value, i) => i === index ? { ...bar, locked: !bar.locked } : value) };
}
export function unlockProgression(progression: Progression): Progression {
  return { ...progression, bars: progression.bars.map((bar) => ({ ...bar, locked: false })) };
}
export function editProgressionBar(progression: Progression, index: number, input: string): Progression {
  const bar = requireBar(progression, index);
  if (bar.locked) throw new RangeError("Déverrouillez cette mesure avant de la modifier.");
  const chord = chordFromSymbol(input);
  if (!chord) throw new RangeError("Accord invalide. Essayez Am, Bbmaj7 ou C/E.");
  const analysis = chordInKey(progression.key, chord);
  return { ...progression, bars: progression.bars.map((value, i) => i === index ? { chord, ...analysis, locked: false, edited: true, alteration: null } : value) };
}
export function formatProgression(progression: Progression, withDegrees = false): string {
  const chords = progression.bars.map((bar) => bar.chord.symbol).join(" | ");
  return withDegrees ? `${chords}\n${progression.bars.map((bar) => bar.roman ?? "—").join(" | ")}` : chords;
}
