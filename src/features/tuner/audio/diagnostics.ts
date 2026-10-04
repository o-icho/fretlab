export type TunerStopReason =
  | "user-button"
  | "component-unmount"
  | "visibilitychange"
  | "app-background"
  | "error"
  | "track-ended"
  | "audio-context-state"
  | "restart"
  | "late-permission-result";

/** Temporary opt-in diagnostics. No audio, device labels or identifiers are logged. */
export function tunerLog(event: string, details: Record<string, unknown> = {}) {
  if (
    typeof window === "undefined" ||
    new URLSearchParams(window.location.search).get("tunerDebug") !== "1"
  ) return;
  console.info(`[TUNER] ${event}`, {
    time: Math.round(performance.now()),
    ...details,
  });
}

export function stopTunerTracks(
  stream: MediaStream,
  reason: TunerStopReason,
  session: number,
) {
  for (const track of stream.getTracks()) {
    track.onended = null;
    track.onmute = null;
    track.onunmute = null;
    tunerLog("track.stop called by application", {
      reason, session, readyState: track.readyState,
    });
    track.stop();
  }
}
