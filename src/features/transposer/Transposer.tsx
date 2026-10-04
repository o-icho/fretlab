"use client";

import { useEffect, useRef, useState } from "react";
import { transposeText, type AccidentalPreference } from "./music";
import styles from "./transposer.module.css";

const EXAMPLE = "Am       F\nHello darkness\n\nC        G\nmy old friend";

export function Transposer({ initialText = "" }: { initialText?: string }) {
  const [text, setText] = useState(initialText);
  const [semitones, setSemitones] = useState(0);
  const [preference, setPreference] = useState<AccidentalPreference>("sharps");
  const [copyStatus, setCopyStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyRequest = useRef(0);
  const result = transposeText(text, semitones, preference);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      copyRequest.current++;
    },
    [],
  );

  function clearCopyStatus() {
    copyRequest.current++;
    if (timer.current) clearTimeout(timer.current);
    setCopyStatus("");
  }
  function changeSemitones(value: number) {
    clearCopyStatus();
    setSemitones(Math.max(-11, Math.min(11, value)));
  }
  async function copy() {
    if (!result.trim()) return;
    clearCopyStatus();
    const request = copyRequest.current;
    try {
      await navigator.clipboard.writeText(result);
      if (request !== copyRequest.current) return;
      setCopyStatus("Copié !");
      timer.current = setTimeout(() => setCopyStatus(""), 2500);
    } catch {
      if (request === copyRequest.current)
        setCopyStatus(
          "Copie indisponible. Sélectionnez le résultat et copiez-le manuellement.",
        );
    }
  }

  return (
    <section
      className={styles.workspace}
      aria-label="Transposer une grille d’accords"
    >
      <div className={styles.toolbar}>
        <fieldset className={styles.controlGroup}>
          <legend>Transposition</legend>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.step}
              onClick={() => changeSemitones(semitones - 1)}
              disabled={semitones === -11}
              aria-label="Descendre d’un demi-ton"
            >
              −1
            </button>
            <output
              className={styles.amount}
              aria-live="polite"
              aria-atomic="true"
            >
              <strong>
                {semitones > 0 ? "+" : ""}
                {semitones}
              </strong>
              <span>demi-ton{Math.abs(semitones) !== 1 ? "s" : ""}</span>
            </output>
            <button
              type="button"
              className={styles.step}
              onClick={() => changeSemitones(semitones + 1)}
              disabled={semitones === 11}
              aria-label="Monter d’un demi-ton"
            >
              +1
            </button>
            <button
              type="button"
              className={styles.reset}
              disabled={semitones === 0}
              onClick={() => changeSemitones(0)}
            >
              Remettre à 0
            </button>
          </div>
        </fieldset>
        <fieldset className={styles.controlGroup}>
          <legend>Notation des notes</legend>
          <div className={styles.preferences}>
            {(
              [
                ["sharps", "Dièses ♯"],
                ["flats", "Bémols ♭"],
              ] as const
            ).map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="accidentals"
                  value={value}
                  checked={preference === value}
                  onChange={() => {
                    clearCopyStatus();
                    setPreference(value);
                  }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <p id="transposer-help" className={styles.help}>
        Placez vos accords sur des lignes dédiées, ou entre crochets dans les
        paroles : <code>[Am]Bonjour [F]à tous</code>. Les paroles et les espaces
        sont conservés. La notation choisie s’applique aussi à 0 demi-ton.
      </p>
      <div className={styles.editors}>
        <div className={styles.editor}>
          <div className={styles.editorHeading}>
            <label htmlFor="original-chords">Original</label>
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                clearCopyStatus();
                setText(EXAMPLE);
              }}
            >
              Charger un exemple
            </button>
          </div>
          <textarea
            id="original-chords"
            value={text}
            onChange={(event) => {
              clearCopyStatus();
              setText(event.target.value);
            }}
            placeholder={
              "Collez votre grille ici…\n\nAm       F\nVos paroles\nC        G"
            }
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-describedby="transposer-help"
          />
        </div>
        <div className={`${styles.editor} ${styles.result}`}>
          <div className={styles.editorHeading}>
            <label htmlFor="transposed-chords">Résultat</label>
            <button
              type="button"
              className={styles.action}
              disabled={!result.trim()}
              onClick={copy}
            >
              {copyStatus === "Copié !" ? "Copié !" : "Copier le résultat"}
            </button>
          </div>
          <textarea
            id="transposed-chords"
            value={result}
            readOnly
            spellCheck={false}
            placeholder="Votre grille transposée apparaît ici."
            aria-describedby="copy-status"
          />
        </div>
      </div>
      <div className={styles.bottom}>
        <span>Traitement local · Aucun texte envoyé à un serveur</span>
        <p id="copy-status" role="status" aria-live="polite">
          {copyStatus}
        </p>
      </div>
      <details className={styles.guide}>
        <summary>Quels accords sont reconnus ?</summary>
        <p>
          Accords majeurs, mineurs, septièmes, extensions, accords suspendus,
          diminués et augmentés : C, Cm, Cmaj7, Cmin7, Csus4, Cdim, Caug, Cadd9,
          C13… Les basses sont transposées également : C/E devient D/F♯ avec +2
          demi-tons.
        </p>
        <p>
          Les parenthèses, la ponctuation et les barres de mesure sont
          conservées. Dans une phrase, écrivez les accords entre crochets pour
          les identifier sans ambiguïté. Une lettre seule sur une ligne, par
          exemple A, est interprétée comme un accord. Les notations non
          reconnues restent intactes.
        </p>
      </details>
    </section>
  );
}
