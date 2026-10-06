import { decodeBackingTrack, type BackingTrack } from "../../domain/music/backingTracks.ts";
export interface TrackRepository { list(): BackingTrack[]; save(track: BackingTrack): void; remove(id: string): void }
type StoragePort = Pick<Storage, "getItem" | "setItem">;
export const TRACK_STORAGE_KEY = "fretlab.backing-tracks";
export class LocalTrackRepository implements TrackRepository {
  private storage: () => StoragePort;
  constructor(storage: () => StoragePort = () => window.localStorage) { this.storage = storage; }
  list(): BackingTrack[] {
    const json = this.storage().getItem(TRACK_STORAGE_KEY);
    if (json === null) return [];
    if (json.length > 4_000_000) throw new Error("Bibliothèque trop volumineuse.");
    const data = JSON.parse(json);
    if (data?.schemaVersion !== 1 || !Array.isArray(data.tracks) || data.tracks.length > 100) throw new Error("Bibliothèque incompatible. Les données existantes sont conservées.");
    const tracks: BackingTrack[] = data.tracks.map((track: unknown) => decodeBackingTrack(track));
    if (new Set(tracks.map(t => t.id)).size !== tracks.length || new Set(tracks.map(t => t.slug)).size !== tracks.length) throw new Error("Identifiants dupliqués.");
    return tracks;
  }
  private write(tracks: BackingTrack[]) {
    const json = JSON.stringify({ schemaVersion: 1, tracks });
    if (tracks.length > 100 || json.length > 4_000_000) throw new Error("Bibliothèque pleine (100 morceaux maximum).");
    this.storage().setItem(TRACK_STORAGE_KEY, json);
  }
  save(input: BackingTrack) {
    const track = decodeBackingTrack(input), tracks = this.list();
    if (tracks.some(t => t.id !== track.id && t.slug === track.slug)) throw new Error("Ce slug est déjà utilisé.");
    this.write([...tracks.filter(t => t.id !== track.id), track]);
  }
  remove(id: string) { this.write(this.list().filter(t => t.id !== id)); }
}
