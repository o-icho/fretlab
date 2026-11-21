import { earNoteStarts } from "../../domain/music/earTraining.ts";
import { MidiNotePlayer } from "../audio/MidiNotePlayer.ts";

export class EarAudio extends MidiNotePlayer {
  constructor() {
    super(earNoteStarts);
  }
}
