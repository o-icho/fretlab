"use client";
import { useEffect, useState } from "react";
import type { BackingTrack, BackingTrackSummary } from "@/domain/music/backingTracks";
import { BackingTrackPlayer } from "./BackingTrackPlayer";
import { loadTrackDetail } from "./detail";
export function TrackDetailPlayer({ summary, localTrack }: { summary: BackingTrackSummary; localTrack?: BackingTrack }) {
  const [track, setTrack] = useState<BackingTrack | undefined>(localTrack);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (localTrack) return;
    const controller = new AbortController();
    void loadTrackDetail(summary, controller.signal).then(value => {
      if (!controller.signal.aborted) setTrack(value);
    }).catch(() => { if (!controller.signal.aborted) setError("Le détail du morceau est indisponible ou invalide."); });
    return () => controller.abort();
  }, [summary, localTrack, attempt]);
  if (track) return <BackingTrackPlayer track={track} />;
  if (error) return <div role="status"><p>{error}</p><button onClick={() => { setError(""); setAttempt(a => a + 1); }}>Réessayer</button></div>;
  return <p role="status">Chargement du morceau…</p>;
}
