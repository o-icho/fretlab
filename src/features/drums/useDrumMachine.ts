"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { clampBpm } from "../../domain/rhythm/tempo";
import type { DrumInstrument } from "../../domain/rhythm/drums";
import { useAudioPause } from "../audio/useAudioPause";
import { DrumPlayer, type DrumSettings } from "./audio/DrumPlayer";
import { DRUM_PATTERNS } from "./presets";
import { createPlaybackStore } from "./playbackStore";

export function useDrumMachine() {
  const [settings, setSettings] = useState<DrumSettings>({ bpm: 120, volume: 1, pattern: DRUM_PATTERNS[0], countIn: 0 });
  const [status, setStatus] = useState<"stopped" | "starting" | "playing">("stopped");
  const [error, setError] = useState("");
  const [playback] = useState(createPlaybackStore);
  const settingsRef = useRef(settings);
  const statusRef = useRef(status);
  const engine = useRef<DrumPlayer | null>(null);
  const request = useRef(0);
  const stop = useCallback(() => {
    request.current++;
    engine.current?.stop();
    statusRef.current = "stopped";
    setStatus("stopped");
    playback.set(null);
  }, [playback]);
  useAudioPause(stop);
  useEffect(() => () => { request.current++; engine.current?.dispose(); engine.current = null; }, []);
  function update(patch: Partial<DrumSettings>) {
    const next = { ...settingsRef.current, ...patch };
    next.bpm = clampBpm(next.bpm);
    settingsRef.current = next;
    engine.current?.configure(next);
    setSettings(next);
  }
  function getPlayer() {
    engine.current ??= new DrumPlayer(settingsRef.current, playback.set, () => {
      stop();
      setError("L’audio a été interrompu. Appuyez sur Lecture pour reprendre.");
    });
    return engine.current;
  }
  async function preview(instrument: DrumInstrument, velocity: number) {
    if (statusRef.current !== "stopped") return;
    const token = request.current;
    try {
      await getPlayer().preview(instrument, velocity);
    } catch {
      if (request.current === token) setError("Impossible de lire la frappe.");
    }
  }
  async function toggle() {
    if (statusRef.current !== "stopped") { stop(); return; }
    const token = ++request.current;
    statusRef.current = "starting";
    setStatus("starting");
    setError("");
    try {
      const started = await getPlayer().start();
      if (token !== request.current) return;
      statusRef.current = started ? "playing" : "stopped";
      setStatus(statusRef.current);
    } catch {
      if (token !== request.current) return;
      stop();
      setError("Impossible d’activer l’audio. Réessayez avec le bouton Lecture.");
    }
  }
  return { settings, update, status, error, toggle, playback, preview };
}
