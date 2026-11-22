import type { DrumPattern, DrumEvent } from "../../domain/rhythm/drums.ts";
import { SIGNATURE_INFO, type TimeSignature } from "../../domain/rhythm/meter.ts";

// All positions are eighth notes from the downbeat, including in compound time.
// The hats articulate the grouping while the kick and snare supply the groove.
type Groove = { name: string; accents: number[]; kicks: number[]; snares: number[] };
const GROOVES: Record<TimeSignature, Groove> = {
  "2/4": { name: "Marche", accents: [0, 2], kicks: [0], snares: [2] },
  "3/4": { name: "Valse", accents: [0, 2, 4], kicks: [0], snares: [2, 4] },
  "4/4": { name: "Rock binaire", accents: [0, 2, 4, 6], kicks: [0, 4, 5], snares: [2, 6] },
  "7/4": { name: "Groove en 4 + 3", accents: [0, 8], kicks: [0, 4, 8], snares: [2, 6, 12] },
  "5/8": { name: "Groove en 3 + 2", accents: [0, 3], kicks: [0], snares: [3] },
  "6/8": { name: "Balancement ternaire", accents: [0, 3], kicks: [0], snares: [3] },
  "7/8": { name: "Groove en 2 + 2 + 3", accents: [0, 2, 4], kicks: [0, 4], snares: [2] },
  "9/8": { name: "Valse ternaire", accents: [0, 3, 6], kicks: [0], snares: [3, 6] },
  "12/8": { name: "Blues ternaire", accents: [0, 3, 6, 9], kicks: [0, 6, 8], snares: [3, 9] },
};

export function metronomeGroove(signature: TimeSignature): DrumPattern {
  const groove = GROOVES[signature];
  const meter = SIGNATURE_INFO[signature];
  const quarterNotes = meter.unit === "quarter";
  const subdivision = quarterNotes ? 2 : 1;
  const lastEighth = meter.steps * subdivision - 1;
  function hit(eighth: number, velocity: number): DrumEvent {
    const beat = Math.floor(eighth / subdivision);
    return { position: { bar: 0, beat, part: eighth % subdivision }, velocity };
  }
  const kicks = groove.kicks.map(eighth => {
    if (eighth === 0) return hit(eighth, 1);
    return hit(eighth, groove.accents.includes(eighth) ? 0.88 : 0.68);
  });
  const snares = groove.snares.map((eighth, index) => hit(eighth, index % 2 === 0 ? 0.9 : 0.82));
  const closedHats = Array.from({ length: lastEighth }, (_, eighth) =>
    hit(eighth, groove.accents.includes(eighth) ? 0.7 : 0.43));

  return {
    id: `metronome-${signature}`,
    name: groove.name,
    description: `${groove.name} en ${signature}`,
    style: signature === "12/8" ? "blues" : "rock",
    meter: { beats: meter.steps, beatUnit: quarterNotes ? 4 : 8, pulseBeats: meter.subdivisions },
    bars: 1,
    subdivision,
    tracks: [
      { instrument: "kick", events: kicks },
      { instrument: "snare", events: snares },
      { instrument: "closed-hat", events: closedHats },
      { instrument: "open-hat", events: [hit(lastEighth, 0.5)] },
    ],
  };
}
