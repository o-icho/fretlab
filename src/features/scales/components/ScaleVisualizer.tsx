"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ROOTS } from "@/domain/music/catalog";
import { SCALE_DEFINITIONS, generateScale } from "@/domain/music/scales";
import { TUNINGS, tuningNotes } from "@/domain/music/tuning";
import { mapScaleToFretboard } from "@/domain/music/fretboard";
import { Fretboard } from "@/components/music/Fretboard";
import { MidiNotePlayer } from "@/features/audio/MidiNotePlayer";
import { useAudioPause } from "@/features/audio/useAudioPause";
import { Icon } from "@/components/Icon";
import { DEFAULT_SCALE_SETTINGS, POSITION_STARTS, parseScaleSettings, scaleSearchParams, scaleFretRange, type ScaleSettings } from "../settings";
import styles from "./scales.module.css";
import { useFretboardFullscreen } from "./useFretboardFullscreen";

export function ScaleVisualizer() {
  const { ref: workspace, active, enter, exit } = useFretboardFullscreen();
  const enterButton = useRef<HTMLButtonElement>(null);
  const exitButton = useRef<HTMLButtonElement>(null);
  const returnScroll = useRef<number | null>(null);
  useEffect(() => {
    if (!active) {
      if (returnScroll.current !== null) {
        enterButton.current?.focus({ preventScroll: true });
        window.scrollTo({ top: returnScroll.current, behavior: "instant" });
        returnScroll.current = null;
      }
      return;
    }
    exitButton.current?.focus({ preventScroll: true });
    // In the in-page fallback, keep keyboard and screen-reader navigation inside the workspace.
    const outside: HTMLElement[] = [];
    for (let child = workspace.current; child?.parentElement && child !== document.body; child = child.parentElement) {
      for (const sibling of child.parentElement.children) {
        if (sibling !== child && sibling instanceof HTMLElement && !sibling.inert) {
          sibling.setAttribute("inert", "");
          outside.push(sibling);
        }
      }
    }
    return () => { outside.forEach((element) => element.removeAttribute("inert")); };
  }, [active, workspace]);

  const searchParams = useSearchParams();
  const settings = parseScaleSettings(searchParams);
  const scale = generateScale(settings.root, settings.scale);
  const tuning = TUNINGS.find((item) => item.id === settings.tuning)!;
  const range = scaleFretRange(settings);
  const positions = mapScaleToFretboard(scale, tuning, range)
    .filter(({ scaleNote }) => !settings.hidden.includes(scaleNote.interval.semitones));
  const strings = tuningNotes(tuning);
  const title = `${scale.root.name} · ${scale.definition.name.toLocaleLowerCase("fr")}`;
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");
  const player = useRef<MidiNotePlayer | null>(null);
  const playingMidi = useRef<number | null>(null);
  const [audioError, setAudioError] = useState(false);
  useAudioPause(useCallback(() => player.current?.stop(), []));
  useEffect(() => () => {
    player.current?.dispose();
    player.current = null;
  }, []);

  async function playNote(midi: number) {
    const audio = player.current ??= new MidiNotePlayer(() => [0]);
    setAudioError(false);
    try {
      playingMidi.current = midi;
      await audio.play([midi], false, 0.8, () => { playingMidi.current = null; });
    } catch {
      if (player.current === audio) setAudioError(true);
    }
  }

  useEffect(() => {
    if (shareStatus === "idle") return;
    const timeout = window.setTimeout(() => setShareStatus("idle"), 2500);
    return () => window.clearTimeout(timeout);
  }, [shareStatus]);

  function update(changes: Partial<ScaleSettings>) {
    const params = scaleSearchParams({ ...settings, ...changes }, searchParams.toString());
    // Next's native History API integration updates useSearchParams without fetching a route.
    window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
    setShareStatus("idle");
  }

  function toggleNote(semitones: number, pitchClass: number) {
    const { hidden } = parseScaleSettings(new URLSearchParams(window.location.search));
    const show = hidden.includes(semitones);
    if (!show && playingMidi.current !== null && playingMidi.current % 12 === pitchClass) {
      player.current?.stop();
      playingMidi.current = null;
    }
    update({ hidden: show ? hidden.filter((offset) => offset !== semitones) : [...hidden, semitones] });
  }

  async function copyLink() {
    const params = scaleSearchParams(settings);
    const url = new URL(`/outils/gammes/?${params}`, "https://fretlab.fr");
    try {
      await navigator.clipboard.writeText(url.toString());
      setShareStatus("copied");
    } catch {
      setShareStatus("error");
    }
  }

  return (
    <section ref={workspace} className={active ? `${styles.workspace} ${styles.immersive}` : styles.workspace}
      role={active ? "dialog" : undefined} aria-modal={active || undefined}
      aria-label={active ? "Manche en plein écran" : "Explorer une gamme de guitare"}>
      <div className={styles.controls}>
        <div className={styles.field}>
          <label htmlFor="scale-root">Fondamentale</label>
          <select id="scale-root" value={settings.root} aria-describedby={active ? undefined : "scale-root-help"}
            onChange={(event) => update({ root: event.target.value as ScaleSettings["root"], hidden: [] })}>
            {ROOTS.map((root) => <option key={root} value={root}>{root}</option>)}
          </select>
          {!active && <p id="scale-root-help">La note de départ de votre gamme.</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="scale-kind">Gamme</label>
          <select id="scale-kind" value={settings.scale} aria-describedby={active ? undefined : "scale-kind-help"}
            onChange={(event) => update({ scale: event.target.value as ScaleSettings["scale"], hidden: [] })}>
            {SCALE_DEFINITIONS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          {!active && <p id="scale-kind-help">Choisissez les notes à explorer.</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="scale-tuning">Accordage</label>
          <select id="scale-tuning" value={settings.tuning}
            onChange={(event) => update({ tuning: event.target.value as ScaleSettings["tuning"] })}>
            {TUNINGS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          {!active && <p>{strings.map((string) => string.note).join(" · ")} — grave → aigu</p>}
        </div>
        {active && <button type="button" ref={exitButton} className={styles.fullscreenButton}
          aria-label="Quitter le plein écran" onClick={exit}><Icon name="collapse" size={18} />Quitter</button>}
      </div>

      {!active && <div className={styles.toolbar}>
        <fieldset className={styles.toggle}>
          <legend>Affichage</legend>
          <div>
            <button type="button" aria-pressed={settings.display === "notes"} onClick={() => update({ display: "notes" })}>Notes</button>
            <button type="button" aria-pressed={settings.display === "intervals"} onClick={() => update({ display: "intervals" })}>Intervalles</button>
          </div>
        </fieldset>
        <fieldset className={styles.toggle}>
          <legend>Zone du manche</legend>
          <div>
            <button type="button" aria-pressed={settings.view === "full"} onClick={() => update({ view: "full" })}>Manche complet</button>
            <button type="button" aria-pressed={settings.view === "position"} onClick={() => update({ view: "position" })}>Zone ciblée</button>
          </div>
        </fieldset>
        {settings.view === "position" && (
          <div className={styles.position}>
            <label htmlFor="scale-position">Début de position</label>
            <select id="scale-position" value={settings.start}
              onChange={(event) => update({ start: Number(event.target.value) as ScaleSettings["start"] })}>
              {POSITION_STARTS.map((fret) => <option key={fret} value={fret}>Case {fret}</option>)}
            </select>
          </div>
        )}
        <button type="button" ref={enterButton} className={styles.fullscreenButton} onClick={() => {
          returnScroll.current = window.scrollY;
          void enter();
        }}>
          <Icon name="expand" size={18} />Plein écran du manche
        </button>
      </div>}

      <div className={styles.panel}>
        <div className={styles.summary}>
          {!active && <>
            <p className={styles.kicker}>VOTRE GAMME SUR LE MANCHE</p>
            <h2>{title}</h2>
            <p className={styles.summaryHelp}>Sélectionnez les notes à afficher sur le manche.</p>
          </>}
          <ol className={styles.notes} aria-label="Notes à afficher sur le manche">
            {scale.notes.map((note) => (
              <li key={note.interval.label}>
                <button type="button" className={`${styles.noteToggle} ${note.isRoot ? styles.rootNote : ""}`}
                  aria-pressed={!settings.hidden.includes(note.interval.semitones)}
                  aria-label={`${note.name}, intervalle ${note.interval.label}${note.isRoot ? ", fondamentale" : ""}`}
                  onClick={() => toggleNote(note.interval.semitones, note.pitchClass)}>
                  <strong>{settings.display === "notes" ? note.name : note.interval.label}</strong>
                  <span>{settings.display === "notes" ? note.interval.label : note.name}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        {active && <p className={styles.rotationHint}>Tournez le téléphone pour agrandir le manche.</p>}
        {!active && <div className={styles.legend}>
          <span><i className={styles.rootDot} aria-hidden="true" />Fondamentale · double cercle</span>
        </div>}
        {(!active || settings.hidden.length === scale.notes.length) && <p className={styles.summaryHelp}>{settings.hidden.length === scale.notes.length
          ? "Le manche est vide. Sélectionnez une note ci-dessus pour la retrouver."
          : "Cliquez sur une note du manche pour l’écouter."}</p>}
        {audioError && <p role="alert">Lecture audio indisponible. Réessayez en sélectionnant une note.</p>}
        <Fretboard title={`${title} — manche de guitare`} tuning={tuning} range={range} onPlay={playNote} immersive={active}
          markers={positions.map((position) => ({
            stringIndex: position.stringIndex, fret: position.fret, midi: position.midi, isRoot: position.scaleNote.isRoot,
            label: settings.display === "notes" ? position.scaleNote.name : position.scaleNote.interval.label,
            description: `Corde ${strings.length - position.stringIndex}, case ${position.fret} : ${position.scaleNote.name}, intervalle ${position.scaleNote.interval.label}${position.scaleNote.isRoot ? ", fondamentale" : ""}`,
          }))} />
        {!active && <details className={styles.positions}>
          <summary>Lire les notes corde par corde</summary>
          <ul>
            {strings.map((string, index) => (
              <li key={index}>
                <strong>Corde {strings.length - index} · {string.note}{string.octave}</strong>
                <p>{positions.filter((position) => position.stringIndex === index).map((position) =>
                  `case ${position.fret} : ${position.scaleNote.name} (${position.scaleNote.interval.label}${position.scaleNote.isRoot ? ", fondamentale" : ""})`,
                ).join(" ; ") || "Aucune note affichée dans cette zone."}</p>
              </li>
            ))}
          </ul>
        </details>}
      </div>

      {!active && <div className={styles.actions}>
        <div className={styles.share}>
          <button type="button" onClick={() => void copyLink()}><Icon name="transpose" size={17} />Copier le lien</button>
          <span role="status">{shareStatus === "copied" ? "Lien copié !" : shareStatus === "error" ? "Copie indisponible. Vous pouvez copier l’URL de la page." : "Retrouvez ces réglages avec le même lien."}</span>
        </div>
        <button type="button" onClick={() => update(DEFAULT_SCALE_SETTINGS)}>Réinitialiser</button>
      </div>}
    </section>
  );
}
