"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioPause } from "@/features/audio/useAudioPause";
import { MAX_BPM, MIN_BPM } from "./rhythm";
import { emptyTapSequence, estimateTapTempo, recordTap, TAP_RESET_MS } from "./tapTempo";
import styles from "./metronome.module.css";

export function TapTempo({ onTempo }: { onTempo: (bpm: number) => void }) {
  const sequence = useRef(emptyTapSequence());
  const [current, setCurrent] = useState(emptyTapSequence);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    sequence.current = emptyTapSequence();
    setCurrent(sequence.current);
  }, []);
  useAudioPause(reset);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function tap() {
    const next = recordTap(sequence.current, performance.now());
    sequence.current = next;
    setCurrent(next);
    const estimate = estimateTapTempo(next);
    if (estimate.stable && estimate.inRange && estimate.bpm !== null) onTempo(estimate.bpm);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(reset, TAP_RESET_MS);
  }
  const estimate = estimateTapTempo(current);
  const applied = estimate.stable && estimate.inRange;
  const message = current.lastTap === null
    ? "Tapez au moins 5 pulsations régulières."
    : estimate.bpm === null
      ? `${current.intervals.length + 1} / 5 frappes minimum · continuez à taper.`
      : !estimate.stable
        ? "Rythme irrégulier : continuez à taper pour stabiliser le tempo."
        : !estimate.inRange
          ? `Tempo mesuré hors de la plage ${MIN_BPM}–${MAX_BPM} BPM. Le tempo actuel est conservé.`
          : "Tempo appliqué automatiquement.";

  return (
    <div className={styles.tapTempo}>
      <button
        type="button"
        className={styles.tapButton}
        aria-label="TAP : taper le tempo"
        aria-describedby="tap-help"
        onClick={tap}
        onKeyDown={(event) => {
          // Native click handles pointer, touch and keyboard exactly once.
          if (event.repeat && (event.key === "Enter" || event.key === " ")) event.preventDefault();
        }}
      >
        TAP
      </button>
      <div className={styles.tapInfo}>
        <p className={styles.tapTitle}>Tap Tempo</p>
        <p role="status" aria-atomic="true" className={applied ? styles.tapApplied : undefined}>
          {estimate.bpm !== null && <strong>{estimate.bpm} BPM{!estimate.stable ? " estimés" : ""} · </strong>}
          {message}
        </p>
        <p id="tap-help">Tapez la pulsation affichée ci-dessus. Après 2,5 s de pause, une nouvelle séquence commence. Bouton sélectionné : Entrée ou Espace.</p>
      </div>
    </div>
  );
}
