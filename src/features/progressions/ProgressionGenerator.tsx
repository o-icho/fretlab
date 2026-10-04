"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { ROOTS, type ChordRoot } from "@/domain/music/catalog";
import { createKey, diatonicChord, type HarmonicDegree, type KeyMode } from "@/domain/music/harmony";
import { PROGRESSION_TEMPLATES } from "@/domain/music/progression-templates";
import {
  availableLengths, editProgressionBar, formatProgression, generateProgression,
  progressionFromTemplate, toggleBarLock, unlockProgression,
  type ProgressionFamily, type ProgressionLength,
} from "@/domain/music/progressions";
import styles from "./progressions.module.css";

const FAMILIES: { id: ProgressionFamily; name: string }[] = [
  { id: "pop", name: "Pop" }, { id: "rock", name: "Rock" },
  { id: "blues", name: "Blues" }, { id: "soul-funk", name: "Soul / Funk" },
];
type Settings = { root: ChordRoot; mode: KeyMode; family: ProgressionFamily; length: ProgressionLength };
const INITIAL_SETTINGS: Settings = { root: "A", mode: "minor", family: "rock", length: 4 };
const DEGREES: HarmonicDegree[] = [1, 2, 3, 4, 5, 6, 7];

export function ProgressionGenerator() {
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [progression, setProgression] = useState(() => progressionFromTemplate(
    createKey("A", "minor"), PROGRESSION_TEMPLATES.find((template) => template.id === "minor-pop-rock")!, "rock", 4,
  ));
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [freeChord, setFreeChord] = useState("");
  const [editError, setEditError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const copyRequest = useRef(0);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    copyRequest.current++;
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);
  const pending = settings.root !== progression.key.scale.requestedRoot || settings.mode !== progression.key.mode || settings.family !== progression.family || settings.length !== progression.bars.length;
  const lengths = availableLengths(settings.mode, settings.family);
  const lockedCount = progression.bars.filter((bar) => bar.locked).length;
  const edited = progression.bars.some((bar) => bar.edited);
  const editorBar = editing === null ? null : progression.bars[editing];
  const triads = DEGREES.map((degree) => diatonicChord(progression.key, degree));
  const sevenths = DEGREES.map((degree) => diatonicChord(progression.key, degree, true));
  const options = [...triads, ...sevenths];
  const scaleParams = new URLSearchParams({ root: progression.key.tonic.name, scale: progression.key.mode === "major" ? "major" : "natural-minor" });
  const transposeParams = new URLSearchParams({ text: formatProgression(progression) });

  function clearCopy() {
    copyRequest.current++;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopyStatus("");
  }
  function updateSettings(changes: Partial<Settings>) {
    setSettings((current) => {
      const next = { ...current, ...changes };
      const supported = availableLengths(next.mode, next.family);
      return { ...next, length: supported.includes(next.length) ? next.length : supported[0] };
    });
    setMessage("");
  }
  function generate() {
    const result = generateProgression({ ...settings, previous: progression, random: Math.random });
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    clearCopy();
    setProgression(result.progression);
    setEditing(null);
    setEditError("");
    setMessage("Nouvelle progression générée.");
  }
  function editChord(symbol: string) {
    if (editing === null) return;
    try {
      const updated = editProgressionBar(progression, editing, symbol);
      setProgression(updated);
      setFreeChord(updated.bars[editing].chord.symbol);
      setEditError("");
      clearCopy();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Accord invalide.");
    }
  }
  async function copy(withDegrees: boolean) {
    clearCopy();
    const request = copyRequest.current;
    try {
      await navigator.clipboard.writeText(formatProgression(progression, withDegrees));
      if (request !== copyRequest.current) return;
      setCopyStatus("Copié !");
      copyTimer.current = setTimeout(() => setCopyStatus(""), 2500);
    } catch {
      if (request === copyRequest.current) setCopyStatus("Copie indisponible. Sélectionnez le texte de la grille pour le copier.");
    }
  }

  return (
    <section className={styles.workspace} aria-label="Créer une progression d’accords">
      <div className={styles.controls}>
        <div><label htmlFor="progression-root">Tonalité</label>
          <select id="progression-root" value={settings.root} onChange={(event) => updateSettings({ root: event.target.value as ChordRoot })}>
            {ROOTS.map((root) => <option key={root}>{root}</option>)}
          </select>
        </div>
        <div><label htmlFor="progression-mode">Mode</label>
          <select id="progression-mode" value={settings.mode} onChange={(event) => updateSettings({ mode: event.target.value as KeyMode })}>
            <option value="major">Majeur</option><option value="minor">Mineur</option>
          </select>
        </div>
        <div><label htmlFor="progression-family">Famille</label>
          <select id="progression-family" value={settings.family} onChange={(event) => updateSettings({ family: event.target.value as ProgressionFamily })}>
            {FAMILIES.map((family) => <option key={family.id} value={family.id}>{family.name}</option>)}
          </select>
        </div>
        <div><label htmlFor="progression-length">Longueur</label>
          <select id="progression-length" value={settings.length} onChange={(event) => updateSettings({ length: Number(event.target.value) as ProgressionLength })}>
            {([4, 8, 12] as const).map((length) => <option key={length} value={length} disabled={!lengths.includes(length)}>{length} mesures</option>)}
          </select>
        </div>
        <button type="button" className={styles.primary} onClick={generate}>Générer <Icon name="arrow" size={18} /></button>
      </div>
      <p className={styles.controlHelp}>{pending ? "Réglages modifiés : cliquez sur Générer pour les appliquer à la grille." : "Un accord par mesure. Les formes de 12 mesures sont réservées au blues."}</p>
      <p className={styles.message} role="status">{message}</p>

      <div className={styles.panel}>
        <div className={styles.heading}>
          <div>
            <p className={styles.kicker}>VOTRE POINT DE DÉPART</p>
            <h2>{progression.key.tonic.name} {progression.key.mode === "major" ? "majeur" : "mineur"}</h2>
            <p>{progression.bars.length} mesures · {FAMILIES.find((family) => family.id === progression.family)!.name}</p>
          </div>
          <button type="button" onClick={generate} disabled={pending}>Générer une autre progression</button>
        </div>
        <div className={styles.bars}>
          {progression.bars.map((bar, index) => (
            <article key={index} className={`${styles.bar} ${bar.locked ? styles.locked : ""} ${editing === index ? styles.selected : ""}`} aria-label={`Mesure ${index + 1}`}>
              <div className={styles.barHeader}>
                <span>MESURE {String(index + 1).padStart(2, "0")}</span>
                <button type="button" className={styles.lockButton} aria-pressed={bar.locked}
                  aria-label={`${bar.locked ? "Déverrouiller" : "Verrouiller"} la mesure ${index + 1}`}
                  onClick={() => {
                    setProgression((current) => toggleBarLock(current, index));
                    if (editing === index) setEditing(null);
                    setMessage("");
                  }}>
                  <Icon name={bar.locked ? "lock" : "unlock"} size={17} />
                </button>
              </div>
              <button type="button" className={styles.chord} disabled={bar.locked} aria-label={`Modifier l’accord de la mesure ${index + 1} : ${bar.chord.symbol}`}
                aria-expanded={editing === index} aria-controls="progression-editor"
                onClick={() => { setEditing(index); setFreeChord(bar.chord.symbol); setEditError(""); }}>
                {bar.chord.symbol}
              </button>
              <p className={styles.degree} aria-label={`Degré ${bar.roman ?? "non analysé"}`}>{bar.roman ?? "—"}</p>
              <div className={styles.badges}>
                {bar.locked && <span>Verrouillée</span>}
                {bar.edited && <span>Modifiée</span>}
                {bar.alteration === "harmonic-minor-dominant" ? <span title="Dominante majeure issue du mineur harmonique">Dominante majeure</span>
                  : bar.isDiatonic === false ? <span>{bar.alteration === "blues-dominant" ? "Couleur blues" : "Hors tonalité"}</span>
                    : bar.isDiatonic === null ? <span>Analyse non disponible</span> : null}
              </div>
            </article>
          ))}
        </div>
        <div className={styles.template}>
          <p><strong>{edited ? "Adaptation manuelle du template" : "Template"} : {progression.generatedFromTemplate.name}</strong></p>
          <p>{progression.generatedFromTemplate.description}</p>
          {edited && <p>La description concerne le template d’origine. Les accords modifiés sont analysés séparément.</p>}
        </div>
        <div className={styles.lockHelp}>
          <p>{lockedCount ? `${lockedCount} mesure${lockedCount > 1 ? "s" : ""} verrouillée${lockedCount > 1 ? "s" : ""}. Seuls les templates qui conservent ces accords peuvent être générés.` : "Verrouillez les mesures à garder, ou cliquez sur un accord pour le modifier."}</p>
          {lockedCount > 0 && <button type="button" onClick={() => { setProgression(unlockProgression(progression)); setMessage(""); }}>Tout déverrouiller</button>}
        </div>
      </div>

      {editorBar && editing !== null && (
        <section className={styles.editor} id="progression-editor" aria-labelledby="progression-editor-title">
          <div className={styles.heading}><h3 id="progression-editor-title">Modifier la mesure {editing + 1}</h3>
            <button type="button" onClick={() => setEditing(null)} aria-label="Fermer l’édition">Fermer</button>
          </div>
          <label htmlFor="progression-chord">Accord de la tonalité</label>
          <select id="progression-chord" value={editorBar.chord.symbol} onChange={(event) => editChord(event.target.value)}>
            {!options.some((option) => option.symbol === editorBar.chord.symbol) && <option value={editorBar.chord.symbol}>Accord actuel : {editorBar.chord.symbol}</option>}
            <optgroup label="Accords diatoniques">{triads.map((chord) => <option key={chord.symbol}>{chord.symbol}</option>)}</optgroup>
            <optgroup label="Septièmes diatoniques">{sevenths.map((chord) => <option key={chord.symbol}>{chord.symbol}</option>)}</optgroup>
          </select>
          <details className={styles.advanced}>
            <summary>Accord libre (avancé)</summary>
            <form onSubmit={(event) => { event.preventDefault(); editChord(freeChord); }}>
              <label htmlFor="progression-free-chord">Nom de l’accord</label>
              <div><input id="progression-free-chord" value={freeChord} onChange={(event) => setFreeChord(event.target.value)} placeholder="Bbmaj7, C/E…" maxLength={40} spellCheck={false} autoCapitalize="off" aria-describedby="progression-free-help" />
                <button type="submit">Appliquer l’accord</button>
              </div>
              <p id="progression-free-help">Les accords hors tonalité sont autorisés. Les extensions non analysées sont signalées.</p>
            </form>
          </details>
          <p role="status" className={styles.editError}>{editError}</p>
        </section>
      )}

      <div className={styles.actions}>
        <div><button type="button" onClick={() => void copy(false)}>Copier les accords</button>
          <button type="button" onClick={() => void copy(true)}>Copier avec degrés</button>
        </div>
        <div><Link href={`/outils/transposeur/?${transposeParams}`}>Transposer <Icon name="transpose" size={17} /></Link>
          <Link href={`/outils/gammes/?${scaleParams}`}>Voir la gamme <Icon name="scales" size={17} /></Link>
        </div>
      </div>
      <p className={styles.controlHelp} role="status">{copyStatus}</p>
      <p className={styles.textGrid}>{formatProgression(progression)}</p>
      <p className={styles.controlHelp}>La gamme liée est majeure ou mineure naturelle. Les dominantes majeures en mineur et certaines couleurs blues utilisent des notes extérieures à cette gamme.</p>
    </section>
  );
}
