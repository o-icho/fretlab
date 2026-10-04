"use client";
import { useEffect } from "react";
export type AudioPauseReason = "visibilitychange" | "app-background";
export function useAudioPause(stop: (reason: AudioPauseReason) => void) {
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) stop("visibilitychange");
    };
    const onBackground = () => stop("app-background");
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("fretlab:pause", onBackground);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("fretlab:pause", onBackground);
    };
  }, [stop]);
}
