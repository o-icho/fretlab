"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isFeatureHrefEnabled } from "@/config/features";
import { useTuner } from "../audio/useTuner";
import {
  frequencyToNote,
  nearestString,
  midiToNote,
  centsDifference,
  clampCents,
  tuningStatus,
} from "../music/notes";
import { tuningNotes } from "@/domain/music/tuning";
import { getStringTunings, resolveStringInstrument, resolveStringTuning, type StringInstrument } from "@/domain/music/stringTunings";
import styles from "./tuner.module.css";

type InstrumentMode = "guitar" | "bass-4" | "bass-5";
type TunerMode = "chromatic" | InstrumentMode;

export function TunerFromQuery() {
  const query = useSearchParams();
  const instrument = resolveStringInstrument(query.get("instrument"), query.get("tuning"));
  const preset = resolveStringTuning(instrument, query.get("tuning"));
  const hasPreset = query.get("instrument") === instrument || query.get("tuning") === preset.id;
  return <Tuner key={hasPreset ? `${instrument}/${preset.id}` : "chromatic"}
    initialInstrument={hasPreset ? instrument : undefined} initialTuning={preset.id} initialQuery={query.toString()} />;
}

export function Tuner({ initialInstrument, initialTuning, initialQuery }: {
  initialInstrument?: StringInstrument;
  initialTuning?: string;
  initialQuery?: string;
}) {
  const { status, frequency, error, toggle } = useTuner();
  const initialMode = initialInstrument === "bass-4" || initialInstrument === "bass-5" ? initialInstrument : "guitar";
  const [mode, setMode] = useState<TunerMode>(initialInstrument ? initialMode : "chromatic");
  const [selectedTunings, setSelectedTunings] = useState<Partial<Record<InstrumentMode, string>>>({
    [initialMode]: initialTuning,
  });
  const [selected, setSelected] = useState<number | null>(null);
  const isBass = mode === "bass-4" || mode === "bass-5";
  const instrument = isBass ? mode : initialMode === "guitar" ? initialInstrument ?? "electric" : "electric";
  const presets = getStringTunings(instrument);
  const preset = resolveStringTuning(instrument, selectedTunings[mode === "chromatic" ? "guitar" : mode]);
  const tuning = mode === "chromatic" ? null : preset;
  const checkParams = new URLSearchParams(instrument === initialInstrument ? initialQuery : undefined);
  checkParams.set("instrument", instrument);
  checkParams.set("tuning", preset.id);
  const strings = tuning ? tuningNotes(tuning) : [];
  const detected = frequency === null ? null : frequencyToNote(frequency);
  const note = detected && tuning ? midiToNote(detected.midi, tuning.notation) : detected;
  const target =
    tuning === null
      ? note
      : selected === null
        ? frequency === null
          ? null
          : nearestString(frequency, tuning)
        : midiToNote(selected, tuning.notation);
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
  function changeMode(value: TunerMode) {
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
            ["guitar", "Guitare 6 cordes"],
            ["bass-4", "Basse 4 cordes"],
            ["bass-5", "Basse 5 cordes"],
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
      {mode !== "chromatic" && (
        <label className={styles.tuningPicker}>
          {isBass ? "Accordage de la basse" : "Accordage de la guitare"}
          <select value={preset.id} onChange={(event) => {
            const id = event.target.value;
            setSelectedTunings(previous => ({ ...previous, [mode]: id }));
            setSelected(null);
          }}>
            {presets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
      )}
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
      {tuning !== null && (
        <div className={styles.strings}>
          <p>
            Choisissez une corde, ou laissez la cible se sélectionner
            automatiquement.
          </p>
          <div style={{ gridTemplateColumns: `repeat(${strings.length}, 1fr)` }}>
            {strings.map((string, index) => (
              <button
                key={string.midi}
                type="button"
                aria-pressed={selected === string.midi}
                aria-label={`Corde ${strings.length - index}, ${string.note}${string.octave}`}
                className={
                  target?.midi === string.midi ? styles.targetString : ""
                }
                onClick={() => setSelected(string.midi)}
              >
                <span>{strings.length - index}</span>
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
      {isBass && (
        <p className={styles.help}>
          Pour les notes graves, étouffez les autres cordes et laissez le son se
          stabiliser après l’attaque. Si le microphone capte mal les graves,
          utilisez une entrée audio adaptée.
        </p>
      )}
      {isFeatureHrefEnabled("/outils/cordes-et-reglages/justesse") && (
          <Link className={styles.intonationLink}
            href={`/outils/cordes-et-reglages/justesse/?${checkParams}`}>
            Vérifier la justesse à la 12ᵉ case →
          </Link>
      )}
    </section>
  );
}
