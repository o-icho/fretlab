"use client";
import { useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { DRUM_INSTRUMENTS, stepsPerBar, type DrumInstrument, type DrumPattern } from "../../domain/rhythm/drums";
import type { PlaybackStore } from "./playbackStore";
import { nextStepVelocity } from "./editor/patternEditing";
import styles from "./drums.module.css";

const LANES: Record<DrumInstrument, { name: string; family: string }> = {
  kick: { name: "Grosse caisse", family: "drum" },
  snare: { name: "Caisse claire", family: "drum" },
  "closed-hat": { name: "Charleston fermé", family: "metal" },
  "open-hat": { name: "Charleston ouvert", family: "metal" },
  crash: { name: "Crash", family: "metal" },
  ride: { name: "Ride", family: "metal" },
  "tom-low": { name: "Tom grave", family: "tom" },
  "tom-mid": { name: "Tom médium", family: "tom" },
  "tom-high": { name: "Tom aigu", family: "tom" },
};

function stepLabel(subdivision: number, step: number) {
  const part = step % subdivision;
  if (part === 0) return String(Math.floor(step / subdivision) + 1);
  if (subdivision === 4) return ["", "e", "&", "a"][part];
  if (subdivision === 2) return "&";
  return "·";
}

type GridProps = {
  selected: DrumPattern;
  playback: PlaybackStore;
  onCycle: (instrument: DrumInstrument, bar: number, step: number) => void;
  onMute: (instrument: DrumInstrument) => void;
  onChangeBars: (count: number) => void;
  onPreview: (instrument: DrumInstrument, velocity: number) => void;
};

export function PatternGrid({ selected: pattern, playback, onCycle, onMute, onChangeBars, onPreview }: GridProps) {
  const current = useSyncExternalStore(playback.subscribe, playback.getSnapshot, playback.getServerSnapshot);
  const [requestedBar, setBar] = useState(0);
  const bar = Math.min(requestedBar, pattern.bars - 1);
  const [focus, setFocus] = useState({ row: 0, step: 0 });
  const table = useRef<HTMLTableElement>(null);
  const steps = useMemo(() => Array.from({ length: stepsPerBar(pattern) }, (_, step) => step), [pattern]);
  const focusedStep = Math.min(focus.step, steps.length - 1);
  const stepsPerPulse = pattern.subdivision * pattern.meter.pulseBeats;
  const hits = useMemo(() => new Map(pattern.tracks.map((track) => [
    track.instrument, new Map(track.events.filter((event) => event.position.bar === bar)
      .map(({ position, velocity }) => [position.beat * pattern.subdivision + position.part, velocity])),
  ])), [bar, pattern]);
  const pending = current !== null && current.pattern !== pattern;
  const playingStep = current && !pending && !current.countIn && current.bar === bar ? current.step : -1;

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, row: number, step: number) {
    switch (event.key) {
      case "ArrowLeft": step--; break;
      case "ArrowRight": step++; break;
      case "ArrowUp": row--; break;
      case "ArrowDown": row++; break;
      case "Home": step = 0; break;
      case "End": step = steps.length - 1; break;
      default: return;
    }
    event.preventDefault();
    row = Math.max(0, Math.min(row, DRUM_INSTRUMENTS.length - 1));
    step = Math.max(0, Math.min(step, steps.length - 1));
    table.current?.tBodies[0].rows[row]?.cells[step + 1]?.querySelector("button")?.focus();
  }

  return <section className={styles.gridPanel} aria-label="Grille du rythme">
    <div className={styles.gridHeading}>
      <div>
        <h2>{pattern.name}</h2>
        <p>{steps.length} pas par mesure · {pattern.bars} mesure{pattern.bars > 1 ? "s" : ""}</p>
      </div>
      <div className={styles.bars} aria-label="Mesures du rythme" role="group">
        <label className={styles.srOnly} htmlFor="drum-bar">Mesure à éditer</label>
        <select id="drum-bar" value={bar} onChange={(event) => setBar(Number(event.target.value))}>
          {Array.from({ length: pattern.bars }, (_, index) => <option key={index} value={index}>Mesure {index + 1}</option>)}
        </select>
        <button type="button" disabled={pattern.bars >= 32} aria-label="Ajouter une mesure" title="Ajouter une mesure"
          onClick={() => { onChangeBars(pattern.bars + 1); setBar(pattern.bars); }}>+</button>
        <button type="button" disabled={pattern.bars <= 1} aria-label="Supprimer la dernière mesure" title="Supprimer la dernière mesure"
          onClick={() => onChangeBars(pattern.bars - 1)}>−</button>
      </div>
    </div>
    <div className={styles.gridScroll} role="region" aria-label={`Grille, mesure ${bar + 1}`}>
      <table className={styles.grid} ref={table}>
        <caption className={styles.srOnly}>Grille de batterie. Les flèches déplacent le curseur. Entrée ou Espace change la frappe.</caption>
        <thead><tr><th scope="col">Instrument</th>
          {steps.map((step) => <th scope="col" key={step} data-pulse={step % stepsPerPulse === 0 || undefined}
            aria-current={step === playingStep ? "step" : undefined}>{stepLabel(pattern.subdivision, step)}</th>)}
        </tr></thead>
        <tbody>{DRUM_INSTRUMENTS.map((id, row) => {
          const { name, family } = LANES[id];
          const muted = Boolean(pattern.tracks.find((track) => track.instrument === id)?.muted);
          return <tr key={id} data-family={family} data-muted={muted || undefined}>
            <th scope="row">
              <button type="button" className={styles.lane} aria-label={`Couper la piste ${name}`} aria-pressed={muted}
                title={`${muted ? "Réactiver" : "Couper"} la piste ${name}`} onClick={() => onMute(id)}>
                <span>{name}</span><span aria-hidden="true" className={styles.mute}>M</span>
              </button>
            </th>
            {steps.map((step) => {
              const velocity = hits.get(id)?.get(step);
              const state = !velocity ? "Silence" : velocity === 1 ? "Accent" : "Frappe";
              return <td key={step} data-pulse={step % stepsPerPulse === 0 || undefined} data-playing={step === playingStep || undefined}>
                <button type="button" className={styles.pad} data-state={state} data-ghost={velocity && velocity < 0.4 || undefined}
                  aria-label={`${name}, mesure ${bar + 1}, pas ${step + 1} : ${state}`}
                  aria-pressed={Boolean(velocity)} tabIndex={focus.row === row && focusedStep === step ? 0 : -1}
                  onFocus={() => setFocus({ row, step })}
                  onKeyDown={(event) => moveFocus(event, row, step)}
                  onClick={() => {
                    onCycle(id, bar, step);
                    const next = nextStepVelocity(velocity);
                    if (!muted && next > 0) onPreview(id, next);
                  }}>
                  <span aria-hidden="true">{velocity === 1 ? "◆" : velocity ? "●" : ""}</span>
                </button>
              </td>;
            })}
          </tr>;
        })}</tbody>
      </table>
    </div>
    <div className={styles.gridFoot}>
      <p>Chaque clic alterne entre case vide, <strong>●</strong> frappe et <strong>◆</strong> accent.</p>
      <p role="status">{current?.countIn ? `Décompte · ${current.countIn} mesure${current.countIn > 1 ? "s" : ""}` :
        pending ? `En lecture : ${current.pattern.name}. Modification à la prochaine mesure.` :
        current ? `Lecture · mesure ${current.bar + 1} sur ${pattern.bars}` : ""}</p>
    </div>
  </section>;
}
