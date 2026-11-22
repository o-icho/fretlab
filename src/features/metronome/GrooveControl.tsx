"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { useAudioPause } from "../audio/useAudioPause";
import { metronomeGroove } from "./groove";
import { createGroovePlayer } from "./GroovePlayer";
import type { TimeSignature } from "./rhythm";
import styles from "./groove-control.module.css";

type GrooveControlProps = {
  bpm: number;
  signature: TimeSignature;
  volume: number;
  onOpen: () => void;
};

export function GrooveControl({ bpm, signature, volume, onOpen }: GrooveControlProps) {
  const titleId = useId();
  const patternName = useMemo(() => metronomeGroove(signature).name, [signature]);
  const dialog = useRef<HTMLDialogElement>(null);
  const player = useRef<ReturnType<typeof createGroovePlayer> | null>(null);
  const [status, setStatus] = useState<"starting" | "playing" | "paused" | "error">("paused");

  const disposePlayer = useCallback(() => {
    const current = player.current;
    player.current = null;
    current?.dispose();
  }, []);
  const pause = useCallback(() => {
    disposePlayer();
    setStatus("paused");
  }, [disposePlayer]);
  useAudioPause(pause);

  const close = useCallback(() => {
    pause();
    dialog.current?.close();
  }, [pause]);
  useEffect(() => {
    function onBack(event: Event) {
      if (!dialog.current?.open) return;
      event.preventDefault();
      close();
    }
    window.addEventListener("fretlab:back", onBack);
    return () => {
      window.removeEventListener("fretlab:back", onBack);
      disposePlayer();
    };
  }, [close, disposePlayer]);

  async function play() {
    if (player.current) return;
    const engine = createGroovePlayer({ bpm, signature, volume }, () => {
      if (player.current === engine) pause();
    });
    player.current = engine;
    setStatus("starting");
    try {
      const started = await engine.start();
      if (player.current !== engine) return;
      if (started) setStatus("playing");
      else pause();
    } catch {
      if (player.current !== engine) return;
      disposePlayer();
      setStatus("error");
    }
  }
  function open() {
    onOpen();
    dialog.current?.showModal();
    void play();
  }

  const active = status === "starting" || status === "playing";
  return <>
    <button type="button" className={styles.trigger} aria-haspopup="dialog" onClick={open}>
      <Icon name="drums" size={20} />Lancer la batterie
    </button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId}
      onCancel={pause} onClose={() => { if (!dialog.current?.open) pause(); }}>
      <header className={styles.header}>
        <h2 id={titleId}>Boucle de batterie</h2>
        <button type="button" className={styles.close} aria-label="Fermer la boucle de batterie" onClick={close}>×</button>
      </header>
      <p className={styles.pattern}>{patternName}</p>
      <p className={styles.settings}>{signature} · {bpm} BPM</p>
      {status === "error" && <p role="alert">Lecture audio impossible. Vérifiez le son puis réessayez.</p>}
      <button type="button" className={styles.playback}
        onClick={() => active ? pause() : void play()}>
        <span aria-hidden="true">{active ? "Ⅱ" : "▶"}</span>
        {active ? "Mettre en pause" : status === "error" ? "Réessayer" : "Relancer la boucle"}
      </button>
    </dialog>
  </>;
}
