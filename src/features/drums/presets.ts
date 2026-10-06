import { validatePattern, type DrumPattern, type DrumStyle, type DrumTrack, type Meter } from "../../domain/rhythm/drums.ts";

const FOUR: Meter = { beats: 4, beatUnit: 4, pulseBeats: 1 };
const THREE: Meter = { beats: 3, beatUnit: 4, pulseBeats: 1 };
const SIX: Meter = { beats: 6, beatUnit: 8, pulseBeats: 3 };
// Compact authoring helper only: the public model stores bar/beat/part + velocity.
function track(instrument: DrumTrack["instrument"], steps: (number | [number, number])[], subdivision: number, bar = 0): DrumTrack {
  return { instrument, events: steps.map((value) => {
    const [step, velocity] = typeof value === "number" ? [value, 0.8] : value;
    return { position: { bar, beat: Math.floor(step / subdivision), part: step % subdivision }, velocity };
  }) };
}
function pattern(id: string, name: string, style: DrumStyle, description: string, meter: Meter, subdivision: number, tracks: DrumTrack[]): DrumPattern {
  const value = { id, name, style, description, meter, subdivision, bars: 1, tracks };
  validatePattern(value);
  // Presets are immutable at runtime, including nested positions and velocities.
  for (const item of value.tracks) {
    for (const event of item.events) { Object.freeze(event.position); Object.freeze(event); }
    Object.freeze(item.events); Object.freeze(item);
  }
  Object.freeze(value.tracks); Object.freeze(value.meter);
  return Object.freeze(value);
}
const eighthHats = () => track("closed-hat", [0, [2, 0.55], 4, [6, 0.55], 8, [10, 0.55], 12, [14, 0.55]], 4);
export const DRUM_PATTERNS: readonly DrumPattern[] = [
  pattern("basic-rock", "Basic Rock", "rock", "Grosse caisse sur 1 et 3, caisse claire sur 2 et 4, charleston en croches.", FOUR, 4, [track("kick", [0, 8], 4), track("snare", [4, 12], 4), eighthHats()]),
  pattern("driving-rock", "Driving Rock", "rock", "Croches continues et relances de grosse caisse avant les temps 3 et 4.", FOUR, 4, [track("kick", [0, 6, 8, 10], 4), track("snare", [4, 12], 4), eighthHats(), track("crash", [[0, 0.35]], 4)]),
  pattern("half-time-rock", "Half-Time Rock", "rock", "Caisse claire sur le troisième temps : sensation half-time, BPM inchangé.", FOUR, 4, [track("kick", [0, 6, 12], 4), track("snare", [8], 4), eighthHats()]),
  pattern("straight-blues", "Straight Blues", "blues", "Croches droites, grosse caisse sur chaque temps et backbeat sur 2 et 4.", FOUR, 4, [track("kick", [[0, 0.8], [4, 0.55], [8, 0.8], [12, 0.55]], 4), track("snare", [4, 12], 4), eighthHats()]),
  pattern("shuffle-blues", "Shuffle Blues", "blues", "Triolets : charleston sur la première et la troisième subdivision de chaque temps.", FOUR, 3, [track("kick", [0, 6], 3), track("snare", [3, 9], 3), track("closed-hat", [0, [2, 0.5], 3, [5, 0.5], 6, [8, 0.5], 9, [11, 0.5]], 3)]),
  pattern("basic-funk", "Basic Funk", "funk", "Grosse caisse syncopée, ghost notes de caisse claire et charleston en doubles croches.", FOUR, 4, [track("kick", [0, 3, 6, 10], 4), track("snare", [4, [7, 0.25], [11, 0.3], 12], 4), track("closed-hat", Array.from({ length: 16 }, (_, i) => [i, i % 2 ? 0.35 : 0.65] as [number, number]), 4)]),
  pattern("heavy", "Heavy", "metal", "Grosse caisse groupée en doubles croches et caisse claire sur 2 et 4.", FOUR, 4, [track("kick", [0, 1, 2, 8, 9, 10], 4), track("snare", [4, 12], 4), eighthHats(), track("crash", [[0, 0.5]], 4)]),
  pattern("thrash", "Thrash", "metal", "Grosse caisse en croches et caisse claire sur chaque contretemps en croche.", FOUR, 4, [track("kick", [0, 2, 4, 6, 8, 10, 12, 14], 4), track("snare", [2, 6, 10, 14], 4), eighthHats(), track("crash", [[0, 0.45]], 4)]),
  pattern("basic-pop", "Basic Pop", "pop", "Grosse caisse sur chaque temps, backbeat et ouverture de charleston en fin de mesure.", FOUR, 4, [track("kick", [0, 4, 8, 12], 4), track("snare", [4, 12], 4), track("closed-hat", [0, 2, 4, 6, 8, 10, 12], 4), track("open-hat", [[14, 0.6]], 4)]),
  pattern("pop-waltz", "Pop Waltz · 3/4", "pop", "Trois noires : grosse caisse sur 1, caisse claire sur 2 et 3.", THREE, 2, [track("kick", [0], 2), track("snare", [[2, 0.65], [4, 0.65]], 2), track("closed-hat", [0, [1, 0.4], 2, [3, 0.4], 4, [5, 0.4]], 2)]),
  pattern("slow-blues", "Slow Blues · 6/8", "blues", "Deux noires pointées : grosse caisse sur la première, caisse claire sur la seconde, six croches.", SIX, 1, [track("kick", [0], 1), track("snare", [3], 1), track("closed-hat", [0, [1, 0.4], [2, 0.4], 3, [4, 0.4], [5, 0.4]], 1)]),
];
export const DRUM_STYLES: { id: DrumStyle; name: string }[] = [
  { id: "rock", name: "Rock" }, { id: "blues", name: "Blues" }, { id: "funk", name: "Funk" }, { id: "metal", name: "Metal" }, { id: "pop", name: "Pop" },
];
