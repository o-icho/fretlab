"use client";
import { useState } from "react";
import { useTuner } from "../audio/useTuner";
import {
  STANDARD_STRINGS,
  frequencyToNote,
  nearestGuitarString,
  midiToNote,
  centsDifference,
  clampCents,
  tuningStatus,
} from "../music/notes";
import styles from "./tuner.module.css";

export function Tuner() {
  const { status, frequency, error, toggle } = useTuner();
  const [mode, setMode] = useState<"chromatic" | "guitar">("chromatic");
  const [selected, setSelected] = useState<number | null>(null);
  const note = frequency === null ? null : frequencyToNote(frequency);
  const target =
    mode === "chromatic"
      ? note
      : selected === null
        ? frequency === null
          ? null
          : nearestGuitarString(frequency)
        : midiToNote(selected);
  const cents =
    frequency !== null && target
      ? centsDifference(frequency, target.frequency)
      : null;
  const state =
    cents === null
      ? status === "listening"
        ? "Signal trop faible ou note non détectée"
        : "Prêt à accorder"
      : tuningStatus(cents);
  const inTune = cents !== null && Math.abs(cents) <= 5;
  function changeMode(value: "chromatic" | "guitar") {
    setMode(value);
    setSelected(null);
  }
  return (
    <section className={styles.panel} aria-label="Accordeur chromatique">
      <fieldset className={styles.mode}>
        <legend>Mode d’accordage</legend>
        {(
          [
            ["chromatic", "Chromatique"],
            ["guitar", "Accordage standard"],
          ] as const
        ).map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name="tuner-mode"
              value={value}
              checked={mode === value}
              onChange={() => changeMode(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <div className={styles.reading}>
        <p className={styles.detected}>NOTE DÉTECTÉE</p>
        <div className={styles.note}>
          {note ? (
            <>
              {note.note}
              <span>{note.octave}</span>
            </>
          ) : (
            "—"
          )}
        </div>
        <p className={styles.frequency}>
          {frequency === null
            ? "Jouez une corde à la fois"
            : `${frequency.toFixed(1)} Hz`}
        </p>
      </div>
      <div
        className={`${styles.gauge} ${inTune ? styles.inTune : ""}`}
        role={cents !== null ? "meter" : undefined}
        aria-label="Écart à la note cible"
        aria-valuemin={cents !== null ? -50 : undefined}
        aria-valuemax={cents !== null ? 50 : undefined}
        aria-valuenow={cents !== null ? clampCents(cents) : undefined}
        aria-valuetext={
          cents !== null ? `${Math.round(cents)} cents. ${state}` : undefined
        }
      >
        <div className={styles.scale} aria-hidden="true">
          <span>−50</span>
          <span>−25</span>
          <span>0</span>
          <span>+25</span>
          <span>+50</span>
        </div>
        <div className={styles.track} aria-hidden="true">
          <span className={styles.center} />
          {cents !== null && (
            <span
              className={styles.needle}
              style={{ left: `${clampCents(cents) + 50}%` }}
            />
          )}
        </div>
        <div className={styles.directions} aria-hidden="true">
          <span>Trop bas</span>
          <span>Juste</span>
          <span>Trop haut</span>
        </div>
      </div>
      <p className={`${styles.cents} ${inTune ? styles.just : ""}`}>
        {cents === null
          ? "— cents"
          : `${cents > 0 ? "+" : ""}${Math.round(cents)} cents`}
      </p>
      <p className={`${styles.tuningState} ${inTune ? styles.just : ""}`}>
        {state}
      </p>
      <p className={styles.target}>
        Note cible :{" "}
        <strong>
          {target
            ? `${target.note}${target.octave} · ${target.frequency.toFixed(1)} Hz`
            : "—"}
        </strong>
      </p>
      {mode === "guitar" && (
        <div className={styles.strings}>
          <p>
            Choisissez une corde, ou laissez la cible se sélectionner
            automatiquement.
          </p>
          <div>
            {STANDARD_STRINGS.map((string, index) => (
              <button
                key={string.midi}
                type="button"
                aria-pressed={selected === string.midi}
                aria-label={`Corde ${6 - index}, ${string.note}${string.octave}`}
                className={
                  target?.midi === string.midi ? styles.targetString : ""
                }
                onClick={() => setSelected(string.midi)}
              >
                <span>{6 - index}</span>
                <strong>
                  {string.note}
                  <small>{string.octave}</small>
                </strong>
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.auto}
            aria-pressed={selected === null}
            onClick={() => setSelected(null)}
          >
            Cible automatique
          </button>
        </div>
      )}
      <div className={styles.transport}>
        <button
          type="button"
          className={styles.start}
          onClick={() => void toggle()}
        >
          {status === "stopped" ? "Activer le microphone" : "Arrêter"}
        </button>
        <p role="status">
          {error ||
            (status === "starting"
              ? "Autorisez le microphone dans la fenêtre du navigateur…"
              : status === "listening"
                ? "Microphone actif · Écoute en cours"
                : "Microphone arrêté")}
        </p>
      </div>
      <p className={styles.privacy}>
        Le son de votre microphone est traité uniquement sur votre appareil.
      </p>
      <p className={styles.help}>
        Référence La4 = 440 Hz · Juste à ±5 cents
        <br />
        Jouez une seule note et laissez-la résonner. La jauge est limitée à ±50
        cents ; la valeur affichée conserve l’écart réel.
      </p>
    </section>
  );
}
