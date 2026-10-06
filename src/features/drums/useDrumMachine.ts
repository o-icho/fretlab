"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { clampBpm } from "../../domain/rhythm/tempo";
import { useAudioPause } from "../audio/useAudioPause";
import { DrumPlayer, type DrumSettings } from "./audio/DrumPlayer";
import { DRUM_PATTERNS } from "./presets";
import { createPlaybackStore } from "./playbackStore";

export function useDrumMachine() {
  const [settings, setSettings] = useState<DrumSettings>({ bpm: 120, volume: 0.5, pattern: DRUM_PATTERNS[0], countIn: 0 });
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
  async function toggle() {
    if (statusRef.current !== "stopped") { stop(); return; }
    const token = ++request.current;
    statusRef.current = "starting";
    setStatus("starting");
    setError("");
    try {
      if (!engine.current) engine.current = new DrumPlayer(settingsRef.current, playback.set, () => { stop(); setError("L’audio a été interrompu. Appuyez sur Lecture pour reprendre."); });
      engine.current.configure(settingsRef.current);
      const started = await engine.current.start();
      if (token !== request.current) return;
      statusRef.current = started ? "playing" : "stopped";
      setStatus(statusRef.current);
    } catch {
      if (token !== request.current) return;
      stop();
      setError("Impossible d’activer l’audio. Réessayez avec le bouton Lecture.");
    }
  }
  return { settings, update, status, error, toggle, playback };
}
