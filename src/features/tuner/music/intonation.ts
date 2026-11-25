import { targetFrequency } from "../../../domain/music/midi.ts";
import type { Tuning } from "../../../domain/music/tuning.ts";
import { centsDifference } from "./notes.ts";

const STABLE_FRAMES = 5;
export const OPEN_TOLERANCE_CENTS = 5;
export const FRETTED_WINDOW_CENTS = 75;

type Reading = { open: number; fretted?: number };
type Session = {
  tuning: Tuning;
  index: number;
  readings: Partial<Record<number, Reading>>;
  measuringFret: boolean;
  samples: number[];
};
type Action =
  | { type: "sample"; frequency: number | null }
  | { type: "string"; index: number }
  | { type: "tuning"; tuning: Tuning }
  | { type: "arm-fret" | "repeat" };

export function createIntonationSession(tuning: Tuning): Session {
  return { tuning, index: 0, readings: {}, measuringFret: false, samples: [] };
}

export function measurementStage(session: Session) {
  const reading = session.readings[session.index];
  if (!reading) return "open";
  if (reading.fretted !== undefined) return "done";
  return session.measuringFret ? "fretted" : "ready";
}

export function intonationCents(openHz: number, frettedHz: number): number | null {
  return centsDifference(frettedHz, openHz * 2);
}

export function verdict(cents: number) {
  if (Math.abs(cents) <= OPEN_TOLERANCE_CENTS) return "Juste à la 12ᵉ case";
  return cents > 0 ? "Trop aigu à la 12ᵉ case" : "Trop grave à la 12ᵉ case";
}

export function intonationReducer(session: Session, action: Action): Session {
  if (action.type === "tuning") return createIntonationSession(action.tuning);
  if (action.type === "string") {
    if (action.index === session.index || !Number.isInteger(action.index) ||
        action.index < 0 || action.index >= session.tuning.strings.length) return session;
    return { ...session, index: action.index, samples: [], measuringFret: false };
  }
  if (action.type === "repeat") {
    const readings = { ...session.readings };
    delete readings[session.index];
    return { ...session, readings, samples: [], measuringFret: false };
  }
  const stage = measurementStage(session);
  if (action.type === "arm-fret")
    return stage === "ready" ? { ...session, measuringFret: true, samples: [] } : session;
  if (action.type !== "sample" || stage === "ready" || stage === "done") return session;

  const open = session.readings[session.index]?.open;
  const target = open === undefined ? targetFrequency(session.tuning.strings[session.index]) : open * 2;
  const frequency = action.frequency;
  const distance = frequency === null ? null : centsDifference(frequency, target);
  const tolerance = stage === "open" ? OPEN_TOLERANCE_CENTS : FRETTED_WINDOW_CENTS;
  if (frequency === null || distance === null || Math.abs(distance) > tolerance)
    return session.samples.length ? { ...session, samples: [] } : session;

  // Reject attack transients and held display values. Samples come only from
  // newly accepted microphone frames, including when their pitch is identical.
  const samples = [...session.samples, frequency];
  while (samples.length > 1 && centsDifference(Math.max(...samples), Math.min(...samples))! > 5)
    samples.shift();
  if (samples.length < STABLE_FRAMES) return { ...session, samples };
  const median = samples.sort((a, b) => a - b)[Math.floor(samples.length / 2)];
  const reading = open === undefined ? { open: median } : { open, fretted: median };
  return {
    ...session, readings: { ...session.readings, [session.index]: reading },
    samples: [], measuringFret: false,
  };
}
