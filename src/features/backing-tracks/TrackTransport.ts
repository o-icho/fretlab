import { mediaTimeMs, getBackingLogicalTimeMs, validAudioUrl, type BackingTrack, type TrackMode } from "../../domain/music/backingTracks.ts";
export interface MediaPort {
  currentTime: number; duration: number; volume: number; paused: boolean; readyState: number;
  readonly ended?: boolean;
  play(): Promise<void>; pause(): void;
}
/** Two media sources, one active clock. No independent timer or musical scheduler. */
export class TrackTransport {
  mode: TrackMode = "BACKING";
  exampleFailed = false;
  backingFailed = false;
  message = "";
  private generation = 0;
  private disposed = false;
  private track: BackingTrack;
  private sources: Record<TrackMode, MediaPort>;
  constructor(track: BackingTrack, backing: MediaPort, example: MediaPort) { this.track = track; this.sources = { BACKING: backing, EXAMPLE: example }; this.volume(0.7); }
  get active() { return this.sources[this.mode]; }
  get logicalTimeMs() { return getBackingLogicalTimeMs(this.active.currentTime, this.mode, this.track.audio.exampleOffsetMs); }
  get timeMs() { return Math.max(0, Math.min(this.track.durationMs, this.logicalTimeMs)); }
  get exampleAvailable() { return validAudioUrl(this.track.audio.exampleUrl) && !this.exampleFailed; }
  get playing() { return !this.active.paused && !this.active.ended; }
  get ready() { return this.active.readyState >= 1 && !this.backingFailed; }
  volume(value: number) { for (const audio of Object.values(this.sources)) audio.volume = Math.max(0, Math.min(1, value)); }
  pause() { this.generation++; for (const audio of Object.values(this.sources)) audio.pause(); }
  async play() {
    if (this.disposed || !this.ready) return;
    const generation = ++this.generation;
    this.message = "";
    try { await this.active.play(); }
    catch { if (generation === this.generation) { this.pause(); this.message = "Lecture impossible. Vérifiez le fichier audio, puis réessayez."; } }
  }
  seek(referenceMs: number) {
    const time = Math.max(0, Math.min(this.track.durationMs, referenceMs));
    // A negative example offset cannot represent the beginning: fall back without losing time.
    if (!this.canSeek(this.mode, time)) {
      if (this.mode === "EXAMPLE" && this.canSeek("BACKING", time)) { void this.switchMode("BACKING", time); return; }
      this.message = "Cette position dépasse la durée disponible du fichier audio."; return;
    }
    this.active.currentTime = mediaTimeMs(time, this.mode, this.track.audio.exampleOffsetMs) / 1000;
  }
  private canSeek(mode: TrackMode, referenceMs: number) {
    const source = this.sources[mode], time = mediaTimeMs(referenceMs, mode, this.track.audio.exampleOffsetMs) / 1000;
    return source.readyState >= 1 && time >= 0 && Number.isFinite(source.duration) && time <= source.duration;
  }
  async switchMode(mode: TrackMode, referenceMs = this.timeMs) {
    if (this.disposed || mode === this.mode) return;
    if (mode === "EXAMPLE" && !this.exampleAvailable) { this.message = "Exemple indisponible. Le backing reste utilisable."; return; }
    if (!this.canSeek(mode, referenceMs)) { this.message = "Cette version n’est pas encore chargée ou ne couvre pas cette position. La lecture actuelle est conservée."; return; }
    const playing = this.playing, volume = this.active.volume;
    this.pause();
    this.mode = mode;
    this.volume(volume);
    this.active.currentTime = mediaTimeMs(referenceMs, mode, this.track.audio.exampleOffsetMs) / 1000;
    this.message = "";
    if (playing) await this.play();
  }
  async failed(mode: TrackMode) {
    if (this.disposed) return;
    if (mode === "EXAMPLE") {
      this.exampleFailed = true;
      if (this.mode === "EXAMPLE") await this.switchMode("BACKING");
      if (this.mode === "EXAMPLE") this.pause();
      this.message = "Exemple inaccessible. Vous pouvez utiliser le backing.";
    } else { this.backingFailed = true; this.pause(); this.message = "Backing inaccessible. Vérifiez son URL et le format audio."; }
  }
  tick() {
    // Let the media emit its native ended event at its own end. Only cut a
    // longer source at the backing reference boundary (e.g. example tail).
    if (this.timeMs >= this.track.durationMs && this.playing && this.active.currentTime < this.active.duration) this.pause();
  }
  dispose() { this.disposed = true; this.pause(); }
}
