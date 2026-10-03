"use client";

import { useState } from "react";
import { useMetronome } from "./useMetronome";
import {
  MAX_BPM,
  MIN_BPM,
  SIGNATURES,
  beatsPerBar,
  isTimeSignature,
  parseBpm,
} from "./rhythm";
import styles from "./metronome.module.css";

export function Metronome() {
  const { settings, update, status, beat, error, toggle } = useMetronome();
  const [draft, setDraft] = useState<string | null>(null);
  const playing = status === "playing";
  const count = beatsPerBar(settings.signature);
  const changeBpm = (value: number) => {
    setDraft(null);
    update({ bpm: value });
  };
  function commitDraft() {
    const value = parseBpm(draft ?? String(settings.bpm));
    if (value !== null) update({ bpm: value });
    setDraft(null);
  }

  return (
    <section className={styles.panel} aria-label="Métronome">
      <div className={styles.topline}>
        <span>VOTRE TEMPO, VOTRE PROGRESSION</span>
        <span className={playing ? styles.playing : ""}>
          {playing
            ? "En lecture"
            : status === "starting"
              ? "Démarrage…"
              : "À l’arrêt"}
        </span>
      </div>
      <div
        className={styles.tempo}
        aria-label={`${settings.bpm} battements par minute`}
      >
        <strong>{settings.bpm}</strong>
        <span>BPM</span>
      </div>
      <p className={styles.unit}>
        {settings.signature === "6/8"
          ? "À la noire pointée · 2 pulsations, 6 croches"
          : "À la noire · un clic par temps"}
      </p>
      <div className={styles.beats} aria-label={`${count} temps par mesure`}>
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`${styles.beat} ${index === beat && playing ? styles.active : ""} ${index === 0 && settings.accent ? styles.accent : ""}`}
          >
            <span />
            {index + 1}
          </span>
        ))}
      </div>
      <div className={styles.transport}>
        <button
          type="button"
          className={styles.start}
          onClick={() => void toggle()}
          aria-label={
            status === "stopped"
              ? "Démarrer le métronome"
              : "Arrêter le métronome"
          }
        >
          <span aria-hidden="true">{status === "stopped" ? "▶" : "■"}</span>
          {status === "stopped" ? "Démarrer" : "Arrêter"}
        </button>
        <p>Barre espace pour démarrer ou arrêter</p>
      </div>
      <div role="status" className={styles.status}>
        {error ||
          (playing
            ? "Métronome en lecture"
            : status === "starting"
              ? "Activation de l’audio…"
              : "Prêt à jouer")}
      </div>
      <div className={styles.controls}>
        <div className={styles.tempoControls}>
          <label htmlFor="bpm-slider">
            Tempo{" "}
            <span>
              {MIN_BPM}–{MAX_BPM} BPM
            </span>
          </label>
          <input
            id="bpm-slider"
            type="range"
            min={MIN_BPM}
            max={MAX_BPM}
            value={settings.bpm}
            onChange={(event) => changeBpm(Number(event.target.value))}
          />
          <div className={styles.steps}>
            <button
              type="button"
              onClick={() => changeBpm(settings.bpm - 5)}
              disabled={settings.bpm === MIN_BPM}
              aria-label="Réduire le tempo de 5 BPM"
            >
              −5
            </button>
            <button
              type="button"
              onClick={() => changeBpm(settings.bpm - 1)}
              disabled={settings.bpm === MIN_BPM}
              aria-label="Réduire le tempo de 1 BPM"
            >
              −1
            </button>
            <div className={styles.numeric}>
              <label htmlFor="bpm-number" className={styles.srOnly}>
                Tempo en BPM
              </label>
              <input
                id="bpm-number"
                type="number"
                inputMode="numeric"
                min={MIN_BPM}
                max={MAX_BPM}
                step={1}
                value={draft ?? settings.bpm}
                onChange={(event) => {
                  setDraft(event.target.value);
                  const value = Number(event.target.value);
                  if (
                    event.target.value !== "" &&
                    value >= MIN_BPM &&
                    value <= MAX_BPM
                  )
                    update({ bpm: value });
                }}
                onBlur={commitDraft}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    commitDraft();
                    event.currentTarget.blur();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => changeBpm(settings.bpm + 1)}
              disabled={settings.bpm === MAX_BPM}
              aria-label="Augmenter le tempo de 1 BPM"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => changeBpm(settings.bpm + 5)}
              disabled={settings.bpm === MAX_BPM}
              aria-label="Augmenter le tempo de 5 BPM"
            >
              +5
            </button>
          </div>
        </div>
        <div className={styles.options}>
          <div className={styles.signature}>
            <label htmlFor="signature">Signature rythmique</label>
            <select
              id="signature"
              value={settings.signature}
              onChange={(event) => {
                if (isTimeSignature(event.target.value))
                  update({ signature: event.target.value });
              }}
            >
              {SIGNATURES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={settings.accent}
              onChange={(event) => update({ accent: event.target.checked })}
            />
            Accentuer le premier temps
          </label>
          <label className={styles.volume} htmlFor="metronome-volume">
            Volume <span>{Math.round(settings.volume * 100)} %</span>
          </label>
          <input
            id="metronome-volume"
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.volume * 100)}
            onChange={(event) =>
              update({ volume: Number(event.target.value) / 100 })
            }
          />
        </div>
      </div>
      <p className={styles.note}>
        Clics générés dans votre navigateur · Aucun fichier audio à charger
      </p>
    </section>
  );
}
