import { MidiNotePlayer } from "../audio/MidiNotePlayer.ts";

const STRING_SPACING_SECONDS = 0.6;

export class ChordAudio extends MidiNotePlayer {
  constructor() {
    super((count, together) =>
      Array.from({ length: count }, (_, index) => together ? 0 : index * STRING_SPACING_SECONDS),
    );
  }
}
