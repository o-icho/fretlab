import type { DrumInstrument } from "../../../domain/rhythm/drums";

/** Implementations schedule their own voices at absolute AudioContext times.
 * A future sample kit can implement this contract without changing transport.
 */
export interface DrumSoundProvider {
  trigger(instrument: DrumInstrument, time: number, velocity: number): void;
  click(time: number, accent: boolean): void;
  stop(): void;
  dispose(): void;
}
export type DrumKitFactory = (context: AudioContext, output: AudioNode) => DrumSoundProvider;
