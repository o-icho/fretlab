import { parseNote, SHARP_NOTES } from "../../domain/music/pitch.ts";

export type BackingTrackKeyRoot = typeof SHARP_NOTES[number];
// Reuse the shared chromatic reference rather than duplicate the note table.
export const BACKING_TRACK_KEYS = SHARP_NOTES.map(id => ({ id, label: id }));

/** Filter-only normalization. Stored spelling and mode are preserved. */
export function normalizeBackingTrackKeyRoot(key: string): BackingTrackKeyRoot | undefined {
  const match = /^([A-G][#b♯♭]?)(?:m|\s+(?:minor|major|mineur|majeur))?$/.exec(key.trim());
  const note = match ? parseNote(match[1]) : null;
  return note ? SHARP_NOTES[note.pitchClass] : undefined;
}
