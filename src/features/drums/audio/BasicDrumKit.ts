import type { DrumInstrument } from "../../../domain/rhythm/drums";
import type { DrumSoundProvider } from "./DrumSoundProvider";

type Voice = { source: AudioScheduledSourceNode; gain: GainNode; nodes: AudioNode[]; instrument: DrumInstrument | "click" };
/** Synthetic practice kit. No samples, requests or claim of acoustic realism. */
export class BasicDrumKit implements DrumSoundProvider {
  private voices = new Set<Voice>();
  private noise: AudioBuffer;
  constructor(private context: AudioContext, private output: AudioNode) {
    this.noise = context.createBuffer(1, Math.ceil(context.sampleRate * 1.5), context.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  trigger(instrument: DrumInstrument, time: number, velocity: number) {
    const v = Math.max(0, Math.min(1, velocity));
    if (instrument === "closed-hat" || instrument === "open-hat") {
      for (const voice of this.voices) if (voice.instrument === "open-hat") {
        voice.gain.gain.cancelScheduledValues(time);
        voice.gain.gain.setTargetAtTime(0.0001, time, 0.003);
        voice.source.stop(time + 0.02);
      }
    }
    switch (instrument) {
      case "kick": this.tone(instrument, time, 150, 45, 0.3, v * 0.65); break;
      case "snare":
        this.noisy(instrument, time, 1500, "highpass", 0.16, v * 0.23);
        this.tone(instrument, time, 180, 110, 0.12, v * 0.16); break;
      case "closed-hat": this.noisy(instrument, time, 7000, "highpass", 0.06, v * 0.14); break;
      case "open-hat": this.noisy(instrument, time, 6500, "highpass", 0.4, v * 0.17); break;
      case "crash": this.noisy(instrument, time, 2600, "highpass", 1.2, v * 0.2); break;
      case "ride": this.noisy(instrument, time, 4200, "bandpass", 0.5, v * 0.13); break;
      case "tom-low": this.tone(instrument, time, 130, 75, 0.32, v * 0.4); break;
      case "tom-high": this.tone(instrument, time, 230, 130, 0.24, v * 0.35); break;
    }
  }
  click(time: number, accent: boolean) {
    this.tone("click", time, accent ? 1400 : 850, accent ? 1400 : 850, 0.035, 0.18);
  }
  private tone(instrument: Voice["instrument"], time: number, from: number, to: number, duration: number, amplitude: number) {
    const source = this.context.createOscillator();
    source.frequency.setValueAtTime(from, time);
    source.frequency.exponentialRampToValueAtTime(to, time + Math.min(duration, 0.15));
    this.voice(instrument, source, [], time, duration, amplitude);
  }
  private noisy(instrument: DrumInstrument, time: number, frequency: number, type: BiquadFilterType, duration: number, amplitude: number) {
    const source = this.context.createBufferSource();
    source.buffer = this.noise;
    const filter = this.context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = 0.7;
    this.voice(instrument, source, [filter], time, duration, amplitude);
  }
  private voice(instrument: Voice["instrument"], source: AudioScheduledSourceNode, filters: AudioNode[], time: number, duration: number, amplitude: number) {
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(amplitude, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    const chain = [source, ...filters, gain];
    chain.forEach((node, index) => node.connect(chain[index + 1] ?? this.output));
    const voice: Voice = { source, gain, nodes: chain, instrument };
    this.voices.add(voice);
    source.onended = () => {
      for (const node of voice.nodes) node.disconnect();
      this.voices.delete(voice);
    };
    source.start(time);
    source.stop(time + duration + 0.005);
  }
  stop() {
    for (const voice of this.voices) {
      voice.source.onended = null;
      voice.source.stop();
      for (const node of voice.nodes) node.disconnect();
    }
    this.voices.clear();
  }
  dispose() { this.stop(); }
}
