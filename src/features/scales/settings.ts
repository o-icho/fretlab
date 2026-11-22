import { ROOTS, type ChordRoot } from "../../domain/music/catalog.ts";
import { isScaleId, SCALE_DEFINITIONS, type ScaleId } from "../../domain/music/scales.ts";
import { TUNINGS, type TuningId } from "../../domain/music/tuning.ts";
import type { FretRange } from "../../domain/music/fretboard.ts";

export const POSITION_STARTS = [0, 3, 5, 7, 9, 12, 15, 17, 20] as const;
export type ScaleDisplay = "notes" | "intervals";
export type ScaleSettings = {
  root: ChordRoot;
  scale: ScaleId;
  hidden: readonly number[]; // Semitone offsets from this scale's root.
  tuning: TuningId;
  display: ScaleDisplay;
  view: "full" | "position";
  start: (typeof POSITION_STARTS)[number];
};
export const DEFAULT_SCALE_SETTINGS: ScaleSettings = {
  root: "A", scale: "minor-pentatonic", hidden: [],
  tuning: "standard", display: "notes", view: "full", start: 5,
};

function hiddenOffsets(scale: ScaleId, tokens: readonly string[]): number[] {
  const definition = SCALE_DEFINITIONS.find((item) => item.id === scale)!;
  return definition.intervals.map((interval) => interval.semitones)
    .filter((offset) => tokens.includes(String(offset)));
}

/** Explicit query parameters with independent fallbacks; no serialized React state. */
export function parseScaleSettings(params: { get(name: string): string | null }): ScaleSettings {
  const root = params.get("root");
  const scaleParam = params.get("scale");
  const scale = scaleParam && isScaleId(scaleParam) ? scaleParam : DEFAULT_SCALE_SETTINGS.scale;
  const tuning = params.get("tuning");
  const start = params.get("start");
  return {
    root: ROOTS.find((value) => value === root) ?? DEFAULT_SCALE_SETTINGS.root,
    scale,
    hidden: hiddenOffsets(scale, params.get("hidden")?.split(",") ?? []),
    tuning: TUNINGS.find((value) => value.id === tuning)?.id ?? "standard",
    display: params.get("display") === "intervals" ? "intervals" : "notes",
    view: params.get("view") === "position" ? "position" : "full",
    start: POSITION_STARTS.find((value) => String(value) === start) ?? DEFAULT_SCALE_SETTINGS.start,
  };
}

export function scaleSearchParams(settings: ScaleSettings, currentSearch = ""): URLSearchParams {
  const params = new URLSearchParams(currentSearch);
  params.set("root", settings.root);
  params.set("scale", settings.scale);
  const hidden = hiddenOffsets(settings.scale, settings.hidden.map(String));
  if (hidden.length) params.set("hidden", hidden.join(","));
  else params.delete("hidden");
  params.delete("notation");
  for (const key of ["tuning", "display", "view"] as const) {
    if (settings[key] === DEFAULT_SCALE_SETTINGS[key]) params.delete(key);
    else params.set(key, settings[key]);
  }
  if (settings.start === DEFAULT_SCALE_SETTINGS.start) params.delete("start");
  else params.set("start", String(settings.start));
  return params;
}

export function scaleFretRange(settings: ScaleSettings): FretRange {
  return settings.view === "full" ? { start: 0, end: 24 } : { start: settings.start, end: settings.start + 4 };
}
