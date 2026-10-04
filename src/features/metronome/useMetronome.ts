"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioPause } from "@/features/audio/useAudioPause";
import { MetronomeAudio } from "./audio";
import { DEFAULT_SETTINGS, clampBpm, type MetronomeSettings } from "./rhythm";

export function useMetronome() {
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [status, setStatus] = useState<"stopped" | "starting" | "playing">(
    "stopped",
  );
  const [beat, setBeat] = useState(-1);
  const [error, setError] = useState("");
  const engine = useRef<MetronomeAudio | null>(null);
  const statusRef = useRef(status);
  const settingsRef = useRef(settings);
  const request = useRef(0);

  useEffect(
    () => () => {
      request.current++;
      engine.current?.dispose();
      engine.current = null;
    },
    [],
  );

  function update(patch: Partial<MetronomeSettings>) {
    const next = { ...settingsRef.current, ...patch };
    next.bpm = clampBpm(next.bpm);
    next.volume = Math.max(0, Math.min(1, next.volume));
    settingsRef.current = next;
    engine.current?.configure(next);
    setSettings(next);
  }

  const stop = useCallback(() => {
    request.current++;
    engine.current?.stop();
    statusRef.current = "stopped";
    setStatus("stopped");
    setBeat(-1);
  }, []);
  useAudioPause(stop);

  async function toggle() {
    if (statusRef.current !== "stopped") {
      stop();
      return;
    }
    const currentRequest = ++request.current;
    statusRef.current = "starting";
    setStatus("starting");
    setError("");
    try {
      if (!engine.current)
        engine.current = new MetronomeAudio(setBeat, () => {
          stop();
          setError(
            "L’audio a été interrompu. Appuyez sur Démarrer pour reprendre.",
          );
        });
      engine.current.configure(settingsRef.current);
      const started = await engine.current.start();
      if (currentRequest !== request.current) return;
      statusRef.current = started ? "playing" : "stopped";
      setStatus(statusRef.current);
    } catch {
      if (currentRequest !== request.current) return;
      stop();
      setError(
        "Impossible de démarrer l’audio. Vérifiez les autorisations de votre navigateur et réessayez.",
      );
    }
  }

  const toggleRef = useRef(toggle);
  useEffect(() => {
    toggleRef.current = toggle;
  });
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (
        event.code !== "Space" ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      // Native buttons, selects and editable controls keep their own keyboard behavior.
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest(
            "input,textarea,select,button,a,summary,[role='button']",
          ))
      )
        return;
      event.preventDefault();
      void toggleRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { settings, update, status, beat, error, toggle };
}
