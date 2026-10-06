// Editorial bridge: the Python analyser does not own a second musical grammar.
import { FLAT_NOTES } from '../../src/domain/music/pitch.ts';
import { CHORD_TONE_INTERVALS, buildHarmonyChord } from '../../src/domain/music/harmony.ts';

const qualities = process.argv.slice(2);
const chords = FLAT_NOTES.flatMap((root, pitch) => qualities.map(quality => {
  const chord = buildHarmonyChord(root, quality);
  return { symbol: chord.symbol, root: pitch, intervals: CHORD_TONE_INTERVALS[quality], pitches: chord.pitches };
}));
process.stdout.write(JSON.stringify(chords));
