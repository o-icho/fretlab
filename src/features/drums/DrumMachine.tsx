"use client";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { useWorkspaceFullscreen } from "@/components/useWorkspaceFullscreen";
import { SIGNATURES, isTimeSignature } from "../../domain/rhythm/meter";
import { MIN_BPM, MAX_BPM, DRUM_BPM_RANGE, parseBpm } from "../../domain/rhythm/tempo";
import { TapTempo } from "../metronome/TapTempoControl";
import { DRUM_PATTERNS, DRUM_STYLES } from "./presets";
import { PatternGrid } from "./PatternGrid";
import { useDrumMachine } from "./useDrumMachine";
import { usePatternEditor } from "./editor/usePatternEditor";
import { isUserPattern } from "./editor/patternEditing";
import styles from "./drums.module.css";

export function DrumMachine() {
  const { ref, active, enter, exit, enterButton, exitButton } = useWorkspaceFullscreen({ landscapeOnPhone: true });
  const { settings, update, status, error, toggle, playback, preview } = useDrumMachine();
  const { pattern } = settings;
  const [draft, setDraft] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState<string | null>(null);
  const editor = usePatternEditor(pattern, (next) => update({ pattern: next }));
  const signature = `${pattern.meter.beats}/${pattern.meter.beatUnit}`;
  const pulse = pattern.meter.pulseBeats === 3 ? "noire pointée" : pattern.meter.beatUnit === 8 ? "croche" : "noire";
  const personal = isUserPattern(pattern);

  function changeBpm(bpm: number) {
    setDraft(null);
    update({ bpm });
  }
  function commitBpm() {
    const bpm = parseBpm(draft ?? String(settings.bpm));
    if (bpm !== null) changeBpm(bpm);
    setDraft(null);
  }

  return (
    <section ref={ref} className={active ? `${styles.workspace} ${styles.immersive}` : styles.workspace}
      role={active ? "dialog" : undefined} aria-modal={active || undefined} aria-label="Éditeur de batterie">
      <div className={styles.controls}>
        <div className={styles.transport}>
          <button type="button" className={styles.play}
            aria-label={status === "stopped" ? "Lancer la boîte à rythmes" : "Arrêter la boîte à rythmes"}
            onClick={() => void toggle()}>
            <span aria-hidden="true">{status === "stopped" ? "▶" : "■"}</span>
            {status === "stopped" ? "Lecture" : "Arrêter"}
          </button>
        </div>
        <div className={styles.field}>
          <label htmlFor="drum-bpm">Tempo <span>BPM à la {pulse}</span></label>
          <div className={styles.tempo}>
            <button type="button" aria-label="Réduire le tempo de 1 BPM" disabled={settings.bpm === MIN_BPM} onClick={() => changeBpm(settings.bpm - 1)}>−</button>
            <input id="drum-bpm" type="number" inputMode="numeric" min={MIN_BPM} max={MAX_BPM}
              value={draft ?? settings.bpm} onChange={(event) => {
                setDraft(event.target.value);
                const bpm = Number(event.target.value);
                if (bpm >= MIN_BPM && bpm <= MAX_BPM) update({ bpm });
              }} onBlur={commitBpm} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
            <button type="button" aria-label="Augmenter le tempo de 1 BPM" disabled={settings.bpm === MAX_BPM} onClick={() => changeBpm(settings.bpm + 1)}>+</button>
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="drum-signature">Signature</label>
          <select id="drum-signature" value={signature} onChange={(event) => {
            if (isTimeSignature(event.target.value)) editor.changeSignature(event.target.value);
          }}>
            {SIGNATURES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="drum-pattern">Rythme</label>
          <select id="drum-pattern" value={pattern.id} onChange={(event) => {
            const next = [...DRUM_PATTERNS, ...editor.library].find((item) => item.id === event.target.value);
            if (next) { editor.select(next); setRenameDraft(null); }
          }}>
            {DRUM_STYLES.map((style) => <optgroup key={style.id} label={style.name}>
              {DRUM_PATTERNS.filter((item) => item.style === style.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </optgroup>)}
            {(personal || editor.library.length > 0) && <optgroup label="Mes rythmes">
              {personal && <option value={pattern.id}>{pattern.name}</option>}
              {editor.library.filter((item) => item.id !== pattern.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </optgroup>}
          </select>
        </div>
        <button type="button" className={styles.secondary} onClick={() => { editor.newPattern(); setRenameDraft(null); }}>Nouveau rythme</button>
        <button type="button" ref={active ? exitButton : enterButton} className={styles.fullscreenButton}
          aria-label={active ? "Quitter le plein écran" : undefined} onClick={active ? exit : enter}>
          <Icon name={active ? "collapse" : "expand"} size={18} />
          {active ? <span>Quitter<span className={styles.fullscreenSuffix}> le plein écran</span></span> : "Plein écran"}
        </button>
      </div>
      {active && <p className={styles.rotationHint}>Tournez le téléphone pour afficher plus de cases.</p>}
      {status === "starting" && <p className={styles.feedback} role="status">Activation de l’audio…</p>}
      {error && <p className={styles.feedback} role="alert">{error}</p>}

      <PatternGrid selected={pattern} playback={playback} onCycle={editor.cycle}
        onMute={editor.mute} onChangeBars={editor.changeBars} onPreview={preview} />

      <div className={styles.saveRow}>
        <button type="button" className={styles.save} onClick={editor.save} disabled={!editor.ready || !editor.dirty}>Sauvegarder ce rythme</button>
        {editor.dirty && <span>Modifications non sauvegardées</span>}
        {editor.message && <span role="status">{editor.message}</span>}
        {editor.error && <span role="alert">{editor.error}</span>}
      </div>

      <details className={styles.more}>
        <summary>Gérer le rythme</summary>
        <div className={styles.editorActions}>
          <button type="button" onClick={editor.duplicate}>Dupliquer</button>
          <button type="button" onClick={() => setRenameDraft(pattern.name)}>Renommer</button>
          <button type="button" onClick={editor.clear}>Vider les frappes</button>
          <button type="button" onClick={editor.reset} disabled={!editor.preset}>Restaurer le modèle</button>
          <button type="button" onClick={editor.remove} disabled={!editor.saved}>Supprimer de cet appareil</button>
        </div>
        {renameDraft !== null && <form className={styles.rename} onSubmit={(event) => {
          event.preventDefault(); editor.rename(renameDraft); setRenameDraft(null);
        }}>
          <label htmlFor="pattern-name">Nom du rythme</label>
          <input id="pattern-name" value={renameDraft} onChange={(event) => setRenameDraft(event.target.value)} maxLength={80} required />
          <button type="submit">Valider</button><button type="button" onClick={() => setRenameDraft(null)}>Annuler</button>
        </form>}
      </details>
      <details className={styles.more}>
        <summary>Réglages de lecture</summary>
        <div className={styles.moreFields}>
          <div className={styles.field}>
            <label htmlFor="drum-volume">Volume <span>{Math.round(settings.volume * 100)} %</span></label>
            <input id="drum-volume" type="range" min={0} max={100} value={Math.round(settings.volume * 100)} onChange={(event) => update({ volume: Number(event.target.value) / 100 })} />
          </div>
          <div className={styles.field}>
            <label htmlFor="drum-count">Décompte avant lecture</label>
            <select id="drum-count" value={settings.countIn} disabled={status !== "stopped"} onChange={(event) => update({ countIn: Number(event.target.value) as 0 | 1 | 2 })}>
              <option value={0}>Désactivé</option><option value={1}>1 mesure</option><option value={2}>2 mesures</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="drum-bpm-slider">Tempo <span>{MIN_BPM}–{MAX_BPM} BPM</span></label>
            <input id="drum-bpm-slider" type="range" min={MIN_BPM} max={MAX_BPM} value={settings.bpm} onChange={(event) => changeBpm(Number(event.target.value))} />
          </div>
        </div>
        <TapTempo onTempo={changeBpm} range={DRUM_BPM_RANGE} />
      </details>
    </section>
  );
}
