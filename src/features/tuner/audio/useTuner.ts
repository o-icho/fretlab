"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioPause } from "@/features/audio/useAudioPause";
import { MicrophoneTuner, microphoneError } from "./MicrophoneTuner";
import { tunerLog, type TunerStopReason } from "./diagnostics";

export function useTuner(onFreshSample?: (frequency: number | null) => void) {
  const [status, setStatus] = useState<"stopped" | "starting" | "listening">(
    "stopped",
  );
  const [frequency, setFrequency] = useState<number | null>(null);
  const [error, setError] = useState("");
  const engine = useRef<MicrophoneTuner | null>(null);
  const request = useRef(0);
  const active = useRef(false);
  const onSample = useRef(onFreshSample);
  useEffect(() => { onSample.current = onFreshSample; }, [onFreshSample]);
  useEffect(
    () => () => {
      request.current++;
      active.current = false;
      engine.current?.stop("component-unmount");
      engine.current = null;
    },
    [],
  );
  const stop = useCallback((reason: TunerStopReason) => {
    tunerLog("stop requested by UI/lifecycle", { reason });
    request.current++;
    active.current = false;
    engine.current?.stop(reason);
    onSample.current?.(null);
    setFrequency(null);
    setStatus("stopped");
  }, []);
  useAudioPause(stop);
  async function toggle() {
    if (active.current) {
      stop("user-button");
      return;
    }
    const generation = ++request.current;
    active.current = true;
    setStatus("starting");
    setError("");
    setFrequency(null);
    if (!engine.current)
      engine.current = new MicrophoneTuner(
        (displayHz, freshHz) => {
          setFrequency(displayHz);
          onSample.current?.(freshHz);
        },
        (message) => {
          stop("error");
          setError(message);
        },
      );
    try {
      const started = await engine.current.start();
      if (generation !== request.current) return;
      active.current = started;
      setStatus(started ? "listening" : "stopped");
    } catch (error) {
      if (generation === request.current) {
        stop("error");
        setError(microphoneError(error));
      }
    }
  }
  return { status, frequency, error, toggle };
}
