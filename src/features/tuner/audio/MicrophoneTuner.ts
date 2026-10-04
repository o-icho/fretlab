import { analysePitch } from "./pitch";
import { PitchStabilizer, TRACKING } from "./tracking";
import { musicalAudioConstraints } from "./constraints";
import { frequencyToNote } from "../music/notes";

export function microphoneError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError")
    return "Permission refusée. Autorisez le microphone dans les paramètres du navigateur ou de l’application pour utiliser l’accordeur.";
  if (name === "NotFoundError")
    return "Aucun microphone détecté. Branchez un microphone et réessayez.";
  if (name === "NotReadableError")
    return "Le microphone est indisponible ou utilisé par une autre application.";
  return error instanceof Error
    ? error.message
    : "Impossible d’activer le microphone. Réessayez.";
}

export class MicrophoneTuner {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private buffer: Float32Array<ArrayBuffer> | null = null;
  private frame: number | null = null;
  private generation = 0;
  private lastAnalysis = 0;
  private debug = false;
  private lastDebug = 0;
  private stabilizer = new PitchStabilizer();
  private onReading: (frequency: number | null) => void;
  private onInterrupted: (message: string) => void;
  constructor(
    onReading: (frequency: number | null) => void,
    onInterrupted: (message: string) => void,
  ) {
    this.onReading = onReading;
    this.onInterrupted = onInterrupted;
  }

  async start(): Promise<boolean> {
    this.stop();
    const generation = this.generation;
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof AudioContext === "undefined"
    )
      throw new Error(
        "Votre navigateur ne permet pas l’accès au microphone. Utilisez un navigateur récent en HTTPS ou sur localhost.",
      );
    // Context and resume initiated directly inside the user's activation gesture.
    const context = new AudioContext({ latencyHint: "interactive" });
    this.context = context;
    const resumed = context.resume().then(
      () => null,
      (error: unknown) => error,
    );
    try {
      this.debug =
        process.env.NODE_ENV === "development" &&
        new URLSearchParams(window.location.search).get("tunerDebug") === "1";
      const supported =
        navigator.mediaDevices.getSupportedConstraints?.() ?? {};
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: musicalAudioConstraints(supported),
      });
      if (generation !== this.generation) {
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }
      this.stream = stream;
      const resumeError = await resumed;
      if (generation !== this.generation) return false;
      if (resumeError) throw resumeError;
      if (context.state !== "running")
        throw new Error(
          "L’audio est suspendu. Réessayez d’activer le microphone.",
        );
      const tracks = stream.getAudioTracks();
      if (this.debug)
        console.debug("[FretLab tuner] microphone", {
          requested: musicalAudioConstraints(supported),
          actual: tracks[0]?.getSettings(),
          bufferSize: 4096,
          sampleRate: context.sampleRate,
        });
      if (!tracks.length || tracks.some((track) => track.readyState !== "live"))
        throw new Error(
          "Le microphone a été interrompu. Réactivez-le pour reprendre.",
        );
      tracks.forEach((track) => {
        track.onended = () =>
          this.interrupt(
            "Le microphone a été déconnecté ou sa permission a été retirée.",
          );
        track.onmute = () => {
          this.stabilizer.reset();
          this.onReading(null);
        };
      });
      context.onstatechange = () => {
        if (context.state !== "running")
          this.interrupt(
            "L’audio a été interrompu. Réactivez le microphone pour reprendre.",
          );
      };
      this.source = context.createMediaStreamSource(stream);
      this.analyser = context.createAnalyser();
      this.analyser.fftSize = 4096;
      this.analyser.smoothingTimeConstant = 0;
      this.buffer = new Float32Array(this.analyser.fftSize);
      // Deliberately no connection to destination: microphone sound is never played back.
      this.source.connect(this.analyser);
      this.lastAnalysis = 0;
      this.frame = requestAnimationFrame(this.analyse);
      return true;
    } catch (error) {
      if (generation !== this.generation) return false;
      this.stop();
      throw error;
    }
  }

  private analyse = (now: number) => {
    if (!this.analyser || !this.context || !this.buffer) return;
    if (now - this.lastAnalysis >= 60) {
      this.lastAnalysis = now;
      this.analyser.getFloatTimeDomainData(this.buffer);
      const tracking = this.stabilizer.isTracking;
      const analysis = analysePitch(this.buffer, this.context.sampleRate, {
        minRms: tracking ? TRACKING.releaseRms : TRACKING.acquireRms,
        yinThreshold: tracking
          ? 1 - TRACKING.holdConfidence
          : 1 - TRACKING.acquireConfidence,
        referenceFrequency: this.stabilizer.frequency,
      });
      const retained = this.stabilizer.push(analysis.detection, now);
      this.onReading(retained);
      if (this.debug && now - this.lastDebug >= 250) {
        this.lastDebug = now;
        const note = retained === null ? null : frequencyToNote(retained);
        console.debug("[FretLab tuner] frame", {
          rms: analysis.rms,
          rawPitch: analysis.detection?.frequency ?? null,
          retainedPitch: retained,
          confidence: analysis.detection?.confidence ?? null,
          note: note ? `${note.note}${note.octave}` : null,
          msSinceLastValid: this.stabilizer.age(now),
          accepted: this.stabilizer.decision.accepted,
          reason: analysis.reason ?? this.stabilizer.decision.reason,
        });
      }
    }
    this.frame = requestAnimationFrame(this.analyse);
  };
  private interrupt(message: string) {
    this.stop();
    this.onInterrupted(message);
  }
  stop() {
    this.generation++;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.stream?.getTracks().forEach((track) => {
      track.onended = null;
      track.onmute = null;
      track.stop();
    });
    this.source?.disconnect();
    this.analyser?.disconnect();
    if (this.context) {
      this.context.onstatechange = null;
      if (this.context.state !== "closed")
        void this.context.close().catch(() => {});
    }
    this.stream = null;
    this.source = null;
    this.analyser = null;
    this.buffer = null;
    this.context = null;
    this.stabilizer.reset();
    this.debug = false;
    this.lastDebug = 0;
  }
}
