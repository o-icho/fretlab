"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { drawEarExercise, earExercises, type EarExercise, type EarExerciseKind, type EarChordSize, type EarIntervalDirection } from "@/domain/music/earTraining";
import { SHARP_NOTES } from "@/domain/music/pitch";
import { useAudioPause } from "@/features/audio/useAudioPause";
import { EarAudio } from "./EarAudio";
import styles from "./ear-training.module.css";

export function EarTraining() {
  const [root, setRoot] = useState("C");
  const [kind, setKind] = useState<EarExerciseKind>("chord");
  const [chordSize, setChordSize] = useState<EarChordSize>("mixed");
  const [direction, setDirection] = useState<EarIntervalDirection>("mixed");
  const pool = earExercises(root, kind, { chordSize, direction });
  const [exercise, setExercise] = useState<EarExercise | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [error, setError] = useState("");
  const audio = useRef<EarAudio | null>(null);
  const request = useRef(0);
  const stop = useCallback(() => { request.current++; audio.current?.stop(); setPlaying(false); }, []);
  useAudioPause(stop);
  useEffect(() => () => { request.current++; audio.current?.dispose(); audio.current = null; }, []);
  function reset() { stop(); setExercise(null); setRevealed(false); setError(""); }
  async function listen(next: EarExercise, together = false) {
    const token = ++request.current;
    setError(""); setPlaying(true);
    try {
      audio.current ??= new EarAudio();
      await audio.current.play(next.midi, together, volume, () => { if (token === request.current) setPlaying(false); });
    } catch {
      if (token === request.current) { setPlaying(false); setError("Lecture impossible. Vérifiez le son de votre appareil et réessayez."); }
    }
  }
  function nextExercise() {
    const next = drawEarExercise(pool);
    setExercise(next); setRevealed(false); void listen(next);
  }
  return <div className={styles.layout}>
    <section className={styles.settings} aria-labelledby="ear-settings">
      <h2 id="ear-settings">Votre entraînement</h2>
      <fieldset><legend>Que souhaitez-vous reconnaître ?</legend><div className={styles.choices}>
        {([['chord', 'Accords'], ['interval', 'Intervalles']] as const).map(([value, label]) => <label key={value}>
          <input type="radio" name="exercise-kind" value={value} checked={kind === value} onChange={() => { reset(); setKind(value); }} />{label}
        </label>)}
      </div></fieldset>
      <label className={styles.field}>Tonalité<select aria-label="Tonalité" value={root} onChange={e => { reset(); setRoot(e.target.value); }}>
        {SHARP_NOTES.map(note => <option key={note}>{note}</option>)}
      </select></label>
      {kind === "chord" ? <label className={styles.field}>Nombre de notes<select aria-label="Nombre de notes" value={chordSize} onChange={e => { reset(); setChordSize(e.target.value as EarChordSize); }}>
        <option value="mixed">3 et 4 notes mélangées</option><option value="3">3 notes</option><option value="4">4 notes</option>
      </select></label> : <label className={styles.field}>Sens des intervalles<select aria-label="Sens des intervalles" value={direction} onChange={e => { reset(); setDirection(e.target.value as EarIntervalDirection); }}>
        <option value="mixed">Ascendants et descendants</option><option value="ascending">Ascendants</option><option value="descending">Descendants</option>
      </select></label>}
      <p className={styles.hint}>{kind === "chord" ? `La note choisie est la fondamentale. ${pool.length} accords sans renversement dans cette sélection, chacun avec la même chance d’apparaître.` : `La note choisie est la première note. ${pool.length} intervalles jusqu’à l’octave dans cette sélection. L’unisson est proposé uniquement lorsque les deux sens sont mélangés.`}</p>
      <label className={styles.field}>Volume · {Math.round(volume * 100)} %<input aria-label="Volume" aria-valuetext={`${Math.round(volume * 100)} %`} type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(Number(e.target.value))} /></label>
      <p className={styles.hint}>Le volume s’applique à la prochaine écoute. Aucun microphone nécessaire.</p>
    </section>
    <section className={styles.exercise} aria-labelledby="ear-exercise">
      <p className="eyebrow">ÉCOUTEZ · IMAGINEZ · VÉRIFIEZ</p>
      <h2 id="ear-exercise">{kind === "chord" ? "Quel accord entendez-vous ?" : "Quel intervalle entendez-vous ?"}</h2>
      <p className={styles.hint}>{kind === "chord" ? "Fondamentale" : "Première note"} : {root}</p>
      <div className={styles.answer} aria-live="polite" aria-atomic="true">
        {revealed && exercise ? <><strong>{exercise.answer}</strong><p>{exercise.notes.join(" · ")}</p><p className={styles.hint}>{exercise.detail}</p></> : <><span className={styles.mystery} aria-hidden="true">?</span><p>{exercise ? "Écoutez autant de fois que nécessaire." : "À vous de tendre l’oreille."}</p></>}
      </div>
      <div className={styles.actions}>
        <button className="button button-primary" onClick={() => exercise ? void listen(exercise) : nextExercise()}>{exercise ? "Réécouter note par note" : "Commencer et écouter"}</button>
        {exercise && <button className="button button-secondary" onClick={() => void listen(exercise, true)}>Écouter les notes ensemble</button>}
        {exercise && <button className="button button-secondary" disabled={!playing} onClick={stop}>Arrêter le son</button>}
      </div>
      <p className={styles.status} role="status">{playing ? "Lecture en cours…" : exercise ? "Prêt pour une nouvelle écoute." : "Le son démarre uniquement à votre demande."}</p>
      <div className={styles.actions}>
        <button className="button button-secondary" disabled={!exercise || revealed} onClick={() => setRevealed(true)}>{revealed ? "Réponse affichée" : kind === "chord" ? "Afficher l’accord" : "Afficher l’intervalle"}</button>
        <button className="button button-secondary" disabled={!exercise} onClick={nextExercise}>Exercice suivant →</button>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </section>
  </div>;
}
