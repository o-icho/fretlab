import type { DrumInstrument } from "../../../domain/rhythm/drums";
import { BasicDrumKit } from "./BasicDrumKit.ts";
import type { DrumSoundProvider } from "./DrumSoundProvider";

// Peaks are normalized in the recordings; these gains set the kit balance.
const SAMPLES = [
  { instrument: "kick", level: 0.72 },
  { instrument: "snare", level: 0.62 },
  { instrument: "closed-hat", level: 0.30 },
  { instrument: "open-hat", level: 0.32 },
] as const;
type Voice = { source: AudioBufferSourceNode; gain: GainNode };

export class AcousticDrumKit implements DrumSoundProvider {
  private samples = new Map<DrumInstrument, { buffer: AudioBuffer; level: number }>();
  private loading: Promise<void> | null = null;
  private abort = new AbortController();
  private fallback: BasicDrumKit | null = null;
  private voices = new Set<Voice>();
  private openHat: Voice | null = null;

  private context: AudioContext;
  private output: AudioNode;
  constructor(context: AudioContext, output: AudioNode) {
    this.context = context;
    this.output = output;
  }

  prepare() {
    this.loading ??= this.load();
    return this.loading;
  }

  private async load() {
    const signal = this.abort.signal;
    try {
      const samples = await Promise.all(SAMPLES.map(async ({ instrument, level }) => {
        const response = await fetch(`/audio/metronome-kit/${instrument}.wav`, { signal });
        if (!response.ok) throw new Error("Échantillon de batterie indisponible.");
        const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
        return { instrument, buffer, level };
      }));
      if (!signal.aborted) {
        for (const sample of samples) this.samples.set(sample.instrument, sample);
      }
    } catch {
      // The local synth can still play when a browser cannot fetch or decode a recording.
    }
  }

  private synth() {
    this.fallback ??= new BasicDrumKit(this.context, this.output);
    return this.fallback;
  }

  trigger(instrument: DrumInstrument, time: number, velocity: number) {
    const sample = this.samples.get(instrument);
    if (!sample) {
      this.synth().trigger(instrument, time, velocity);
      return;
    }
    if ((instrument === "closed-hat" || instrument === "open-hat") && this.openHat) {
      this.openHat.gain.gain.setTargetAtTime(0, time, 0.004);
      this.openHat.source.stop(time + 0.025);
      this.openHat = null;
    }
    const source = this.context.createBufferSource();
    source.buffer = sample.buffer;
    // Small timbre differences between strikes without moving them off the beat.
    source.playbackRate.value = 0.985 + velocity * 0.018 + Math.random() * 0.014;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(sample.level * velocity, time);
    source.connect(gain);
    gain.connect(this.output);

    const voice = { source, gain };
    this.voices.add(voice);
    if (instrument === "open-hat") this.openHat = voice;
    source.onended = () => {
      if (this.openHat === voice) this.openHat = null;
      this.voices.delete(voice);
      source.disconnect();
      gain.disconnect();
    };
    source.start(time);
  }

  click(time: number, accent: boolean) {
    this.synth().click(time, accent);
  }

  stop() {
    for (const { source, gain } of this.voices) {
      source.onended = null;
      source.stop();
      source.disconnect();
      gain.disconnect();
    }
    this.voices.clear();
    this.openHat = null;
    this.fallback?.stop();
  }

  dispose() {
    this.abort.abort();
    this.stop();
    this.samples.clear();
    this.fallback = null;
  }
}
