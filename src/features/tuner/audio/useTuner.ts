"use client";
import { useEffect, useRef, useState } from "react";
import { MicrophoneTuner, microphoneError } from "./MicrophoneTuner";

export function useTuner() {
  const [status, setStatus] = useState<"stopped" | "starting" | "listening">(
    "stopped",
  );
  const [frequency, setFrequency] = useState<number | null>(null);
  const [error, setError] = useState("");
  const engine = useRef<MicrophoneTuner | null>(null);
  const request = useRef(0);
  const active = useRef(false);
  useEffect(
    () => () => {
      request.current++;
      engine.current?.stop();
      engine.current = null;
    },
    [],
  );
  function stop() {
    request.current++;
    active.current = false;
    engine.current?.stop();
    setFrequency(null);
    setStatus("stopped");
  }
  async function toggle() {
    if (active.current) {
      stop();
      return;
    }
    const generation = ++request.current;
    active.current = true;
    setStatus("starting");
    setError("");
    setFrequency(null);
    if (!engine.current)
      engine.current = new MicrophoneTuner(setFrequency, (message) => {
        stop();
        setError(message);
      });
    try {
      const started = await engine.current.start();
      if (generation !== request.current) return;
      active.current = started;
      setStatus(started ? "listening" : "stopped");
    } catch (error) {
      if (generation === request.current) {
        stop();
        setError(microphoneError(error));
      }
    }
  }
  return { status, frequency, error, toggle };
}
