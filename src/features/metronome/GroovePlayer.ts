import { METRONOME_BPM_RANGE } from "../../domain/rhythm/tempo.ts";
import { DrumPlayer } from "../drums/audio/DrumPlayer.ts";
import { AcousticDrumKit } from "../drums/audio/AcousticDrumKit.ts";
import { metronomeGroove } from "./groove.ts";
import type { MetronomeSettings } from "./rhythm";

export function createGroovePlayer(
  { bpm, signature, volume }: Pick<MetronomeSettings, "bpm" | "signature" | "volume">,
  onInterrupted: () => void,
) {
  return new DrumPlayer(
    { bpm, volume, pattern: metronomeGroove(signature), countIn: 0 },
    null,
    onInterrupted,
    (context, output) => new AcousticDrumKit(context, output),
    METRONOME_BPM_RANGE,
  );
}
