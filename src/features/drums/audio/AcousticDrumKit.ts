import { DRUM_INSTRUMENTS, type DrumInstrument } from "../../../domain/rhythm/drums.ts";
import { BasicDrumKit } from "./BasicDrumKit.ts";
import type { DrumSoundProvider } from "./DrumSoundProvider";

// Peaks are normalized in the recordings; these gains set the kit balance.
const LEVELS: Record<DrumInstrument, number> = {
  kick: 0.72, snare: 0.62,
  "closed-hat": 0.30, "open-hat": 0.32,
  "tom-low": 0.55, "tom-mid": 0.47, "tom-high": 0.54,
  ride: 0.36, crash: 0.41,
};
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
  private limiter: DynamicsCompressorNode | null = null;
  private trim: GainNode | null = null;
  private instruments: readonly DrumInstrument[];
  constructor(context: AudioContext, output: AudioNode, instruments: readonly DrumInstrument[] = DRUM_INSTRUMENTS) {
    this.context = context;
    this.instruments = instruments;
    // An editor step can stack all nine accented sounds on one transient.
    if (instruments.length === DRUM_INSTRUMENTS.length) {
      this.limiter = context.createDynamicsCompressor();
      this.limiter.threshold.value = -3;
      this.limiter.knee.value = 1;
      this.limiter.ratio.value = 20;
      this.limiter.attack.value = 0;
      this.limiter.release.value = 0.1;
      // Leave 3 dB of output headroom after the compressor's automatic makeup gain.
      this.trim = context.createGain();
      this.trim.gain.value = 0.708;
      this.limiter.connect(this.trim);
      this.trim.connect(output);
    }
    this.output = this.limiter ?? output;
  }

  prepare() {
    this.loading ??= this.load();
    return this.loading;
  }

  private async load() {
    const signal = this.abort.signal;
    try {
      const samples = await Promise.all(this.instruments.map(async (instrument) => {
        const response = await fetch(`/audio/metronome-kit/${instrument}.wav`, { signal });
        if (!response.ok) throw new Error("Échantillon de batterie indisponible.");
        const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
        return { instrument, buffer, level: LEVELS[instrument] };
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
    this.limiter?.disconnect();
    this.trim?.disconnect();
  }
}
