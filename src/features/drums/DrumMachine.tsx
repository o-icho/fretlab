"use client";
import { useState } from "react";
import { MIN_BPM, MAX_BPM } from "../../domain/rhythm/tempo";
import { parseBpm } from "../metronome/rhythm";
import { TapTempo } from "../metronome/TapTempoControl";
import { DRUM_PATTERNS, DRUM_STYLES } from "./presets";
import { PatternGrid } from "./PatternGrid";
import { useDrumMachine } from "./useDrumMachine";
import { usePatternEditor } from "./editor/usePatternEditor";
import { isUserPattern } from "./editor/patternEditing";
import styles from "./drums.module.css";

export function DrumMachine() {
  const { settings, update, status, error, toggle, playback } = useDrumMachine();
  const [draft, setDraft] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState<string | null>(null);
  const editor = usePatternEditor(settings.pattern, (pattern) => update({ pattern }));
  function changeBpm(bpm: number) { setDraft(null); update({ bpm }); }
  function commit() { const bpm = parseBpm(draft ?? String(settings.bpm)); if (bpm !== null) changeBpm(bpm); setDraft(null); }
  return (
    <section className={styles.workspace} aria-label="Boîte à rythmes">
      <div className={styles.controls}>
        <div className={styles.selectors}>
          <div><label htmlFor="drum-style">Style</label><select id="drum-style" value={settings.pattern.style} onChange={(event) => {
            const pattern = DRUM_PATTERNS.find((item) => item.style === event.target.value);
            if (pattern) editor.select(pattern);
          }}>{DRUM_STYLES.map((style) => <option key={style.id} value={style.id}>{style.name}</option>)}</select></div>
          <div><label htmlFor="drum-pattern">Pattern</label><select id="drum-pattern" value={settings.pattern.id} onChange={(event) => {
            const pattern = [...DRUM_PATTERNS, ...editor.library].find((item) => item.id === event.target.value);
            if (pattern) editor.select(pattern);
          }}>
            <optgroup label="Presets FretLab">{DRUM_PATTERNS.filter((pattern) => pattern.style === settings.pattern.style).map((pattern) => <option key={pattern.id} value={pattern.id}>{pattern.name}</option>)}</optgroup>
            <optgroup label="Mes patterns">
              {isUserPattern(settings.pattern) && <option value={settings.pattern.id}>{settings.pattern.name}{editor.dirty ? " · non sauvegardé" : ""}</option>}
              {editor.library.filter((pattern) => pattern.style === settings.pattern.style && pattern.id !== settings.pattern.id).map((pattern) => <option key={pattern.id} value={pattern.id}>{pattern.name}</option>)}
            </optgroup>
          </select></div>
          <div><label htmlFor="drum-count">Décompte avant lecture</label><select id="drum-count" value={settings.countIn} disabled={status !== "stopped"} onChange={(event) => update({ countIn: Number(event.target.value) as 0 | 1 | 2 })}>
            <option value={0}>Désactivé</option><option value={1}>1 mesure</option><option value={2}>2 mesures</option>
          </select></div>
        </div>
        <div className={styles.player}>
          <div className={styles.tempo}><strong>{settings.bpm}</strong><span>BPM</span></div>
          <div className={styles.tempoControls}>
            <label htmlFor="drum-bpm-slider">Tempo · {MIN_BPM}–{MAX_BPM} BPM</label>
            <input id="drum-bpm-slider" type="range" min={MIN_BPM} max={MAX_BPM} value={settings.bpm} onChange={(event) => changeBpm(Number(event.target.value))} />
            <div className={styles.steps}>
              <button type="button" disabled={settings.bpm === MIN_BPM} aria-label="Réduire le tempo de 1 BPM" onClick={() => changeBpm(settings.bpm - 1)}>−</button>
              <label className={styles.srOnly} htmlFor="drum-bpm">Tempo en BPM</label>
              <input id="drum-bpm" type="number" inputMode="numeric" min={MIN_BPM} max={MAX_BPM} value={draft ?? settings.bpm} onChange={(event) => {
                setDraft(event.target.value);
                const bpm = Number(event.target.value);
                if (event.target.value && bpm >= MIN_BPM && bpm <= MAX_BPM) update({ bpm });
              }} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
              <button type="button" disabled={settings.bpm === MAX_BPM} aria-label="Augmenter le tempo de 1 BPM" onClick={() => changeBpm(settings.bpm + 1)}>+</button>
            </div>
          </div>
          <div className={styles.transport}>
            <button type="button" className={styles.play} aria-label={status === "stopped" ? "Lancer la boîte à rythmes" : "Arrêter la boîte à rythmes"} onClick={() => void toggle()}>{status === "stopped" ? "▶ Lecture" : "■ Stop"}</button>
            <p role="status">{status === "playing" ? "En lecture" : status === "starting" ? "Activation de l’audio…" : "À l’arrêt"}</p>
          </div>
        </div>
        <p className={styles.help}>Le tempo compte les noires en 4/4 et 3/4, les noires pointées en 6/8. En lecture, le nouveau pattern commence à la prochaine mesure disponible.</p>
        <p role="status" className={styles.error}>{error}</p>
        <TapTempo onTempo={changeBpm} />
        <div className={styles.volume}><label htmlFor="drum-volume">Volume général · {Math.round(settings.volume * 100)} %</label><input id="drum-volume" type="range" min={0} max={100} value={Math.round(settings.volume * 100)} onChange={(event) => update({ volume: Number(event.target.value) / 100 })} /></div>
      </div>
      <section className={styles.editorTools} aria-label="Gestion du pattern">
        <h2>Votre pattern</h2>
        <p>{isUserPattern(settings.pattern) ? editor.dirty ? "Modifications non sauvegardées" : "Pattern sauvegardé" : "Preset FretLab · une modification créera votre copie"}</p>
        <div className={styles.editorActions}>
          <button type="button" onClick={editor.clear}>Vider les frappes</button>
          <button type="button" onClick={editor.duplicate}>Dupliquer</button>
          <button type="button" onClick={() => setRenameDraft(settings.pattern.name)}>Renommer</button>
          <button type="button" onClick={editor.reset} disabled={!editor.preset}>Réinitialiser depuis le preset</button>
          <button type="button" className={styles.save} onClick={editor.save} disabled={!editor.ready || !editor.dirty}>Sauvegarder</button>
          <button type="button" onClick={editor.remove} disabled={!editor.saved}>Supprimer</button>
        </div>
        {renameDraft !== null && <form className={styles.rename} onSubmit={(event) => { event.preventDefault(); editor.rename(renameDraft); setRenameDraft(null); }}>
          <label htmlFor="pattern-name">Nom du pattern</label>
          <input id="pattern-name" value={renameDraft} onChange={(event) => setRenameDraft(event.target.value)} maxLength={80} required />
          <button type="submit">Valider le nom</button><button type="button" onClick={() => setRenameDraft(null)}>Annuler</button>
        </form>}
        <p role="status">{editor.message}</p><p role="alert" className={styles.error}>{editor.error}</p>
        <p className={styles.help}>{editor.ready ? `${editor.library.length} pattern(s) sauvegardé(s) sur cet appareil.` : "Chargement de vos patterns…"} Retrouvez-les dans le menu Pattern, selon leur style. Les sauvegardes restent dans ce navigateur ou cette application ; effacer ses données les supprime.</p>
      </section>
      <PatternGrid selected={settings.pattern} playback={playback} onCycle={editor.cycle} onMute={editor.mute} />
      <p className={styles.help}>Kit Basic : sons de batterie synthétiques, générés localement. Aucun sample à télécharger. La lecture s’arrête lorsque l’application passe en arrière-plan.</p>
    </section>
  );
}
