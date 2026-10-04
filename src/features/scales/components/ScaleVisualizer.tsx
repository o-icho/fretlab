"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ROOTS } from "@/domain/music/catalog";
import { SCALE_DEFINITIONS, generateScale } from "@/domain/music/scales";
import { TUNINGS, tuningNotes } from "@/domain/music/tuning";
import { mapScaleToFretboard } from "@/domain/music/fretboard";
import { Fretboard } from "@/components/music/Fretboard";
import { Icon } from "@/components/Icon";
import { DEFAULT_SCALE_SETTINGS, POSITION_STARTS, parseScaleSettings, scaleSearchParams, scaleFretRange, type ScaleSettings } from "../settings";
import styles from "./scales.module.css";

export function ScaleVisualizer() {
  const searchParams = useSearchParams();
  const settings = parseScaleSettings(searchParams);
  const scale = generateScale(settings.root, settings.scale, settings.notation);
  const tuning = TUNINGS.find((item) => item.id === settings.tuning)!;
  const range = scaleFretRange(settings);
  const positions = mapScaleToFretboard(scale, tuning, range);
  const strings = tuningNotes(tuning);
  const title = `${scale.root.name} · ${scale.definition.name.toLocaleLowerCase("fr")}`;
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");

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
    <section className={styles.workspace} aria-label="Explorer une gamme de guitare">
      <div className={styles.controls}>
        <div className={styles.field}>
          <label htmlFor="scale-root">Fondamentale</label>
          <select id="scale-root" value={settings.root} aria-describedby="scale-root-help"
            onChange={(event) => update({ root: event.target.value as ScaleSettings["root"] })}>
            {ROOTS.map((root) => <option key={root} value={root}>{root}</option>)}
          </select>
          <p id="scale-root-help">La note de départ de votre gamme.</p>
        </div>
        <div className={styles.field}>
          <label htmlFor="scale-kind">Gamme</label>
          <select id="scale-kind" value={settings.scale} aria-describedby="scale-kind-help"
            onChange={(event) => update({ scale: event.target.value as ScaleSettings["scale"] })}>
            {SCALE_DEFINITIONS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <p id="scale-kind-help">Choisissez les notes à explorer.</p>
        </div>
        <div className={styles.field}>
          <label htmlFor="scale-tuning">Accordage</label>
          <select id="scale-tuning" value={settings.tuning}
            onChange={(event) => update({ tuning: event.target.value as ScaleSettings["tuning"] })}>
            {TUNINGS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <p>{strings.map((string) => string.note).join(" · ")} — grave → aigu</p>
        </div>
        <div className={styles.field}>
          <label htmlFor="scale-notation">Notation</label>
          <select id="scale-notation" value={settings.notation}
            onChange={(event) => update({ notation: event.target.value as ScaleSettings["notation"] })}>
            <option value="auto">Automatique</option><option value="sharps">Dièses</option><option value="flats">Bémols</option>
          </select>
          <p>Auto respecte les degrés de la gamme.</p>
        </div>
      </div>

      <div className={styles.toolbar}>
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
      </div>

      <div className={styles.panel}>
        <div className={styles.summary} aria-live="polite" aria-atomic="true">
          <p className={styles.kicker}>VOTRE GAMME SUR LE MANCHE</p>
          <h2>{title}</h2>
          <p className={styles.summaryHelp}>Cases {range.start} à {range.end} · {tuning.name}</p>
          {scale.requestedRoot !== scale.root.name && settings.notation === "auto" && (
            <p className={styles.summaryHelp}>{scale.root.name} est l’équivalent de {scale.requestedRoot}, avec une notation plus lisible.</p>
          )}
          <ol className={styles.notes} aria-label="Notes et intervalles de la gamme">
            {scale.notes.map((note) => (
              <li key={note.interval.label} className={note.isRoot ? styles.rootNote : undefined}>
                <strong>{settings.display === "notes" ? note.name : note.interval.label}</strong>
                <span>{settings.display === "notes" ? note.interval.label : note.name}</span>
                {note.isRoot && <span className="sr-only">Fondamentale</span>}
              </li>
            ))}
          </ol>
        </div>
        <div className={styles.legend}>
          <span><i className={styles.rootDot} aria-hidden="true" />Fondamentale · double cercle</span>
          <span><i className={styles.noteDot} aria-hidden="true" />Autres notes de la gamme</span>
        </div>
        <Fretboard title={`${title} — manche de guitare`} tuning={tuning} range={range}
          markers={positions.map((position) => ({
            stringIndex: position.stringIndex, fret: position.fret, isRoot: position.scaleNote.isRoot,
            label: settings.display === "notes" ? position.scaleNote.name : position.scaleNote.interval.label,
            description: `Corde ${strings.length - position.stringIndex}, case ${position.fret} : ${position.scaleNote.name}, intervalle ${position.scaleNote.interval.label}${position.scaleNote.isRoot ? ", fondamentale" : ""}`,
          }))} />
        <details className={styles.positions}>
          <summary>Lire les notes corde par corde</summary>
          <ul>
            {strings.map((string, index) => (
              <li key={index}>
                <strong>Corde {strings.length - index} · {string.note}{string.octave}</strong>
                <p>{positions.filter((position) => position.stringIndex === index).map((position) =>
                  `case ${position.fret} : ${position.scaleNote.name} (${position.scaleNote.interval.label}${position.scaleNote.isRoot ? ", fondamentale" : ""})`,
                ).join(" ; ") || "Aucune note de la gamme dans cette zone."}</p>
              </li>
            ))}
          </ul>
        </details>
      </div>

      <div className={styles.actions}>
        <div className={styles.share}>
          <button type="button" onClick={() => void copyLink()}><Icon name="transpose" size={17} />Copier le lien</button>
          <span role="status">{shareStatus === "copied" ? "Lien copié !" : shareStatus === "error" ? "Copie indisponible. Vous pouvez copier l’URL de la page." : "Retrouvez ces réglages avec le même lien."}</span>
        </div>
        <button type="button" onClick={() => update(DEFAULT_SCALE_SETTINGS)}>Réinitialiser</button>
      </div>
    </section>
  );
}
