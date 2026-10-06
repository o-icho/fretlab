"use client";
import { useSyncExternalStore } from "react";
import { stepsPerBar, type DrumInstrument, type DrumPattern } from "../../domain/rhythm/drums";
import type { PlaybackStore } from "./playbackStore";
import { isUserPattern } from "./editor/patternEditing";
import styles from "./drums.module.css";

const INSTRUMENTS: { id: DrumInstrument; name: string }[] = [
  { id: "kick", name: "Kick" }, { id: "snare", name: "Snare" }, { id: "closed-hat", name: "Closed Hi-Hat" },
  { id: "open-hat", name: "Open Hi-Hat" }, { id: "crash", name: "Crash" },
  { id: "ride", name: "Ride" }, { id: "tom-low", name: "Tom grave" }, { id: "tom-high", name: "Tom aigu" },
];
function label(pattern: DrumPattern, step: number): string {
  const part = step % pattern.subdivision;
  if (!part) return String(Math.floor(step / pattern.subdivision) + 1);
  return pattern.subdivision === 4 ? ["", "e", "&", "a"][part] : pattern.subdivision === 3 ? ["", "tri", "let"][part] : "&";
}
export function PatternGrid({ selected, playback, onCycle, onMute }: {
  selected: DrumPattern; playback: PlaybackStore;
  onCycle: (instrument: DrumInstrument, bar: number, step: number) => void;
  onMute: (instrument: DrumInstrument) => void;
}) {
  const current = useSyncExternalStore(playback.subscribe, playback.getSnapshot, playback.getServerSnapshot);
  const pattern = selected;
  const steps = Array.from({ length: stepsPerBar(pattern) }, (_, index) => index);
  const instruments = INSTRUMENTS.filter((value, index) => index < 5 || pattern.tracks.some((track) => track.instrument === value.id));
  const pending = current !== null && selected !== current.pattern;
  const active = pending ? null : current;
  return (
    <section className={styles.gridPanel} aria-label="Visualisation du pattern">
      <div className={styles.gridHeading}>
        <div><h2>{pattern.name}</h2><p>{pattern.meter.beats}/{pattern.meter.beatUnit} · {pattern.bars} mesure{pattern.bars > 1 ? "s" : ""} · {steps.length} pas par mesure</p></div>
        <p>{pattern.subdivision === 3 ? "Triolets de croches" : pattern.subdivision === 4 ? "Doubles croches" : "Croches"} · BPM à la {pattern.meter.pulseBeats === 3 ? "noire pointée" : "noire"}</p>
      </div>
      <p role="status" className={styles.gridStatus}>
        {current?.countIn ? `Décompte : ${current.countIn} mesure${current.countIn > 1 ? "s" : ""} restante${current.countIn > 1 ? "s" : ""}. ` : current ? "Groove en lecture. " : "Lecture arrêtée. "}
        {pending ? `En lecture : ${current.pattern.name}. Cette grille attend la prochaine mesure disponible.` : ""}
      </p>
      {Array.from({ length: pattern.bars }, (_, bar) => (
        <div key={bar} className={styles.gridScroll} role="region" tabIndex={0} aria-label={`Grille, mesure ${bar + 1}`}>
          <table className={styles.grid}>
            <caption className={styles.srOnly}>Mesure {bar + 1}. Chaque bouton alterne Silence, Normal, Accent.</caption>
            <thead><tr><th scope="col">Instrument</th>{steps.map((step) => <th scope="col" key={step} className={active?.bar === bar && active.step === step ? styles.current : undefined} aria-current={active?.bar === bar && active.step === step ? "step" : undefined}>{label(pattern, step)}</th>)}</tr></thead>
            <tbody>{instruments.map((instrument) => <tr key={instrument.id}>
              <th scope="row">{instrument.name}<button type="button" className={styles.mute} aria-pressed={!!pattern.tracks.find((track) => track.instrument === instrument.id)?.muted} aria-label={`Mute ${instrument.name}`} onClick={() => onMute(instrument.id)}>{pattern.tracks.find((track) => track.instrument === instrument.id)?.muted ? "Muet" : "Mute"}</button></th>
              {steps.map((step) => {
                const hit = pattern.tracks.find((track) => track.instrument === instrument.id)?.events.find((event) => event.position.bar === bar && event.position.beat * pattern.subdivision + event.position.part === step);
                const state = !hit ? "Silence" : hit.velocity === 1 ? "Accent" : "Normal";
                return <td key={step} className={active?.bar === bar && active.step === step ? styles.current : undefined}>
                  <button type="button" className={styles.stepButton} onClick={() => onCycle(instrument.id, bar, step)} aria-label={`${instrument.name}, mesure ${bar + 1}, pas ${step + 1} : ${state}${hit ? `, vélocité ${Math.round(hit.velocity * 100)} %` : ""}`}>
                    <span aria-hidden="true" className={hit ? hit.velocity < 0.4 ? styles.ghost : styles.hit : styles.rest}>{!hit ? "—" : hit.velocity === 1 ? "◆" : "●"}</span>
                  </button>
                </td>;
              })}
            </tr>)}</tbody>
          </table>
        </div>
      ))}
      <p className={styles.help}>Tapez une case : — Silence → ● Normal → ◆ Accent → Silence. Les frappes douces des presets restent intactes jusqu’à leur édition. Mute coupe une piste sans effacer ses notes. La colonne encadrée suit le pas joué ; la grille défile horizontalement sur petit écran.</p>
      <p className={styles.description}>{isUserPattern(pattern) ? "Point de départ avant édition : " : ""}{pattern.description}</p>
    </section>
  );
}
