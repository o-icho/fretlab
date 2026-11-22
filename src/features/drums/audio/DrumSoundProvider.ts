import type { DrumInstrument } from "../../../domain/rhythm/drums";

/** Implementations schedule their own voices at absolute AudioContext times. */
export interface DrumSoundProvider {
  prepare?(): Promise<void>;
  trigger(instrument: DrumInstrument, time: number, velocity: number): void;
  click(time: number, accent: boolean): void;
  stop(): void;
  dispose(): void;
}
export type DrumKitFactory = (context: AudioContext, output: AudioNode) => DrumSoundProvider;
