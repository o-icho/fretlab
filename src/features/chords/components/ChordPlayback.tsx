"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioPause } from "../../audio/useAudioPause";
import { ChordAudio } from "../ChordAudio";
import styles from "./playback.module.css";

type PlaybackMode = "together" | "arpeggio";

export function ChordPlayback({ notes }: { notes: readonly number[] }) {
  const [mode, setMode] = useState<PlaybackMode>("together");

  return (
    <div className={styles.controls}>
      <label>
        Mode d’écoute
        <select
          value={mode}
          onChange={event => setMode(event.target.value as PlaybackMode)}
        >
          <option value="together">Notes ensemble</option>
          <option value="arpeggio">Note par note</option>
        </select>
      </label>
      <PlayButton key={mode + notes.join(",")} notes={notes} mode={mode} />
    </div>
  );
}

function PlayButton({ notes, mode }: { notes: readonly number[]; mode: PlaybackMode }) {
  const audio = useRef<ChordAudio | null>(null);
  const request = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  const stop = useCallback(() => {
    request.current++;
    audio.current?.stop();
    setPlaying(false);
  }, []);
  useAudioPause(stop);
  useEffect(() => () => {
    request.current++;
    audio.current?.dispose();
    audio.current = null;
  }, []);

  async function play() {
    const token = ++request.current;
    setError(false);
    setPlaying(true);
    try {
      audio.current ??= new ChordAudio();
      await audio.current.play(notes, mode === "together", 0.85, () => {
        if (token === request.current) setPlaying(false);
      });
    } catch {
      if (token === request.current) {
        setPlaying(false);
        setError(true);
      }
    }
  }

  return (
    <>
      <button
        type="button"
        className="button button-primary"
        disabled={!notes.length}
        onClick={playing ? stop : play}
      >
        <span aria-hidden="true">{playing ? "■" : "▶"}</span>
        {playing ? "Arrêter le son" : "Écouter l’accord"}
      </button>
      {error && <p role="alert">Lecture impossible. Vérifiez le son de votre appareil et réessayez.</p>}
    </>
  );
}
