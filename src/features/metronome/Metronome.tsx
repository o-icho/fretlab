"use client";

import { useState } from "react";
import { useMetronome } from "./useMetronome";
import { TapTempo } from "./TapTempoControl";
import {
  MAX_BPM,
  MIN_BPM,
  SIGNATURES,
  beatsPerBar,
  isTimeSignature,
  parseBpm,
  nextBeatSound,
  signatureDescription,
} from "./rhythm";
import styles from "./metronome.module.css";

const SOUND_LABELS = {
  accent: "son accentué",
  normal: "son normal",
  silent: "silence",
} as const;

export function Metronome() {
  const { settings, update, cycleBeat, status, beat, error, toggle } = useMetronome();
  const [draft, setDraft] = useState<string | null>(null);
  const playing = status === "playing";
  const count = beatsPerBar(settings.signature);
  const beatUnit = settings.signature.endsWith("/8") ? "Croche" : "Temps";
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
      <div
        className={styles.tempo}
        aria-label={`${settings.bpm} battements par minute`}
      >
        <strong>{settings.bpm}</strong>
        <span>BPM</span>
      </div>
      <p className={styles.unit}>
        {signatureDescription(settings.signature)}
      </p>
      <div
        className={styles.beats}
        role="group"
        aria-label={`Sons des ${count} ${beatUnit === "Croche" ? "croches" : "temps"} de la mesure`}
      >
        {settings.beatSounds.map((sound, index) => {
          const current = index === beat && playing;
          return (
            <button
              key={index}
              type="button"
              aria-label={`${beatUnit} ${index + 1} : ${SOUND_LABELS[sound]}. Passer au ${SOUND_LABELS[nextBeatSound(sound)]}.`}
              aria-current={current ? "step" : undefined}
              title={`${SOUND_LABELS[sound]} → ${SOUND_LABELS[nextBeatSound(sound)]}`}
              onClick={() => cycleBeat(index)}
              className={`${styles.beat} ${styles[sound]} ${current ? styles.active : ""}`}
            >
              <span className={styles.circle} aria-hidden="true">
                {sound === "accent" ? ">" : sound === "normal" ? "•" : ""}
              </span>
              <span aria-hidden="true">{index + 1}</span>
            </button>
          );
        })}
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
      </div>
      <div role="status" className={styles.status}>
        {error ||
          (playing
            ? "Métronome en lecture"
            : status === "starting"
              ? "Activation de l’audio…"
              : null)}
      </div>
      <TapTempo onTempo={changeBpm} />
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
      <p className={styles.note}>
        Données de tempo des morceaux :{" "}
        <a href="https://getsongbpm.com/">GetSongBPM</a>.
      </p>
    </section>
  );
}
