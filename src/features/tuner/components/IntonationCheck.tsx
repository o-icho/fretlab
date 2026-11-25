"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useReducer } from "react";
import { isFeatureHrefEnabled } from "@/config/features";
import { STANDARD_TUNING, TUNINGS, tuningNotes } from "@/domain/music/tuning";
import { useTuner } from "../audio/useTuner";
import { centsDifference, midiToNote } from "../music/notes";
import {
  createIntonationSession, intonationCents, intonationReducer,
  measurementStage, FRETTED_WINDOW_CENTS, OPEN_TOLERANCE_CENTS, verdict,
} from "../music/intonation";
import styles from "./intonation.module.css";

function formatCents(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded} ¢`;
}

export function IntonationCheck() {
  const query = useSearchParams();
  const preset = TUNINGS.find((item) => item.id === query.get("tuning")) ?? STANDARD_TUNING;
  const [session, dispatch] = useReducer(intonationReducer, preset, createIntonationSession);
  if (session.tuning.id !== preset.id) dispatch({ type: "tuning", tuning: preset });
  const recordSample = useCallback((frequency: number | null) => dispatch({ type: "sample", frequency }), []);
  const { status, frequency, error, toggle } = useTuner(recordSample);
  const { tuning, index, readings } = session;
  const strings = tuningNotes(tuning);
  const note = strings[index];
  const octave = midiToNote(note.midi + 12, tuning.notation);
  const reading = readings[index];
  const stage = measurementStage(session);
  const delta = reading?.fretted === undefined ? null : intonationCents(reading.open, reading.fretted);
  const liveDeviation = frequency === null ? null : centsDifference(frequency, note.frequency);
  const frettedDeviation = frequency === null || !reading ? null : intonationCents(reading.open, frequency);
  const finished = Object.values(readings).filter((result) => result?.fretted !== undefined).length;
  const nextIndex = strings.findIndex((_, stringIndex) =>
    stringIndex > index && readings[stringIndex]?.fretted === undefined);
  const next = nextIndex === -1 ? strings.findIndex((_, i) => readings[i]?.fretted === undefined) : nextIndex;

  return (
    <section className={styles.workspace} aria-label="Contrôle de justesse">
      <div className={styles.setup}>
        <label className={styles.tuning}>Accordage
          <select value={tuning.id} onChange={(event) => {
            const url = new URL(window.location.href);
            url.searchParams.set("tuning", event.target.value);
            window.history.replaceState(null, "", url);
          }}>
            {TUNINGS.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}
          </select>
        </label>
        <fieldset className={styles.strings}>
          <legend>Corde à vérifier</legend>
          <div>{strings.map((string, i) => {
            const number = strings.length - i;
            const saved = readings[i];
            const result = saved?.fretted === undefined ? null : intonationCents(saved.open, saved.fretted);
            return <button type="button" key={string.midi} aria-pressed={index === i}
              aria-label={`Corde ${number}, ${string.note}${string.octave}${result === null ? "" : ", " + verdict(result) + ", " + formatCents(result)}`}
              onClick={() => dispatch({ type: "string", index: i })}>
              <small>Corde {number}</small>
              <strong>{string.note}<sub>{string.octave}</sub></strong>
              {result !== null && <span>{formatCents(result)}</span>}
            </button>;
          })}</div>
        </fieldset>
      </div>
      <div className={styles.measure}>
        <div className={styles.heading}>
          <h2>{stage === "open" ? "Corde à vide" : stage === "done" ? "Résultat" : "À la 12ᵉ case"}</h2>
          <span>{finished} / {strings.length} vérifiées</span>
        </div>
        <div className={styles.readings}>
          <div><small>À vide · {note.note}{note.octave}</small><strong>{reading ? `${reading.open.toFixed(1)} Hz` : "—"}</strong></div>
          <div><small>12ᵉ case · {octave.note}{octave.octave}</small><strong>{reading?.fretted !== undefined ? `${reading.fretted.toFixed(1)} Hz` : "—"}</strong></div>
        </div>
        <div className={styles.message} role="status">
          {stage === "open" && <p>Jouez {note.note}{note.octave} à vide. La mesure se fixe quand la corde reste accordée à ±5 cents.</p>}
          {stage === "ready" && <p>La corde à vide est mesurée. Étouffez-la, puis lancez la mesure à la 12ᵉ case.</p>}
          {stage === "fretted" && <p>Appuyez juste derrière la 12ᵉ frette, sans tirer la corde. Jouez la note et laissez-la sonner.</p>}
          {delta !== null && <p><strong className={styles.verdict}>{verdict(delta)}</strong> Écart de {formatCents(delta)} par rapport à l’octave de la corde à vide.</p>}
          {error && <p>{error}</p>}
          {status === "starting" && <p>Autorisez l’accès au microphone pour commencer.</p>}
        </div>
        {status === "listening" && stage === "open" && liveDeviation !== null && Math.abs(liveDeviation) > OPEN_TOLERANCE_CENTS && (
          <p className={styles.hint}>Cible {note.note}{note.octave} · {liveDeviation < 0 ? "Trop grave" : "Trop aigu"} ({formatCents(liveDeviation)})</p>
        )}
        {status === "listening" && stage === "fretted" && frettedDeviation !== null && Math.abs(frettedDeviation) > FRETTED_WINDOW_CENTS && (
          <p className={styles.hint}>Note attendue {octave.note}{octave.octave}. Vérifiez la corde et la case jouées.</p>
        )}
        <div className={styles.actions}>
          {status === "listening" && stage === "ready" && (
            <button className="button button-primary" type="button" onClick={() => dispatch({ type: "arm-fret" })}>Mesurer la 12ᵉ case</button>
          )}
          {stage === "done" && next !== -1 && (
            <button className="button button-primary" type="button" onClick={() => dispatch({ type: "string", index: next })}>Corde suivante</button>
          )}
          {reading && (
            <button className="button button-secondary" type="button" onClick={() => dispatch({ type: "repeat" })}>Reprendre cette corde</button>
          )}
          <button className={`button ${status === "stopped" ? "button-primary" : "button-secondary"}`} type="button" onClick={() => void toggle()}>
            {status === "stopped" ? "Activer le microphone" : "Arrêter le microphone"}
          </button>
        </div>
        {isFeatureHrefEnabled("/outils/accordeur") && <Link className={styles.link} href={`/outils/accordeur/?tuning=${tuning.id}`}>Ouvrir l’accordeur en {tuning.name}</Link>}
      </div>
    </section>
  );
}
