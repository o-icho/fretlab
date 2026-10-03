"use client";

import { useState } from "react";
import { GuitarChordDiagram } from "./GuitarChordDiagram";
import {
  ROOTS,
  QUALITIES,
  QUALITY_LABELS,
  QUALITY_SUFFIXES,
  type ChordRoot,
  type ChordQuality,
} from "../lib/model";
import {
  searchChord,
  findChord,
  parseChordName,
  chordDescription,
} from "../lib/search";
import styles from "./chords.module.css";

const POPULAR = ["C", "G", "Am", "F", "D", "Em", "E", "A"];
export function ChordDictionary() {
  const [query, setQuery] = useState("Am");
  const [root, setRoot] = useState<ChordRoot>("A");
  const [quality, setQuality] = useState<ChordQuality>("minor");
  const [positionIndex, setPositionIndex] = useState(0);
  const [showFingers, setShowFingers] = useState(true);
  const chord = searchChord(query);
  const position = chord?.positions[positionIndex];
  function search(value: string) {
    setQuery(value);
    setPositionIndex(0);
    const parsed = parseChordName(value);
    if (parsed) {
      setRoot(parsed.root);
      setQuality(parsed.quality);
    }
  }
  function filter(nextRoot: ChordRoot, nextQuality: ChordQuality) {
    setRoot(nextRoot);
    setQuality(nextQuality);
    setQuery(nextRoot + QUALITY_SUFFIXES[nextQuality]);
    setPositionIndex(0);
  }
  return (
    <section
      className={styles.workspace}
      aria-label="Rechercher un accord de guitare"
    >
      <div className={styles.controls}>
        <div className={styles.search}>
          <label htmlFor="chord-search">Rechercher un accord</label>
          <input
            id="chord-search"
            type="search"
            value={query}
            onChange={(event) => search(event.target.value)}
            placeholder="Am, Cmaj7, F#m…"
            spellCheck={false}
            autoCapitalize="off"
            aria-describedby="chord-search-help"
          />
          <p id="chord-search-help">
            Notation internationale · Dièses et bémols acceptés
          </p>
        </div>
        <div className={styles.filter}>
          <label htmlFor="chord-root">Fondamentale</label>
          <select
            id="chord-root"
            value={root}
            onChange={(event) =>
              filter(event.target.value as ChordRoot, quality)
            }
          >
            {ROOTS.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filter}>
          <label htmlFor="chord-quality">Type d’accord</label>
          <select
            id="chord-quality"
            value={quality}
            onChange={(event) =>
              filter(root, event.target.value as ChordQuality)
            }
          >
            {QUALITIES.map((type) => (
              <option key={type} value={type} disabled={!findChord(root, type)}>
                {QUALITY_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.popular}>
        <h2>Accords populaires</h2>
        <div>
          {POPULAR.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={chord?.displayName === name}
              onClick={() => search(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.result} aria-live="polite" aria-atomic="true">
        {chord && position ? (
          <>
            <div className={styles.diagramPanel}>
              <div className={styles.chordHeading}>
                <div>
                  <h2>{chord.displayName}</h2>
                  <p>{chordDescription(chord)}</p>
                </div>
                <span className={styles.positionTag}>
                  {position.baseFret === 1
                    ? "POSITION OUVERTE / BAS DU MANCHE"
                    : `À PARTIR DE LA CASE ${position.baseFret}`}
                </span>
              </div>
              <GuitarChordDiagram
                position={position}
                name={chord.displayName}
                showFingers={showFingers}
              />
              <div className={styles.positionNav}>
                <button
                  type="button"
                  disabled={positionIndex === 0}
                  aria-label="Position précédente"
                  onClick={() => setPositionIndex((value) => value - 1)}
                >
                  ←
                </button>
                <span>
                  Position {positionIndex + 1} / {chord.positions.length}
                </span>
                <button
                  type="button"
                  disabled={positionIndex === chord.positions.length - 1}
                  aria-label="Position suivante"
                  onClick={() => setPositionIndex((value) => value + 1)}
                >
                  →
                </button>
              </div>
            </div>
            <aside className={styles.guide}>
              <p className="eyebrow">À VOUS DE JOUER</p>
              <h3>Lire le diagramme</h3>
              <p>
                La corde la plus grave est à gauche. Les points indiquent les
                cases à appuyer et les chiffres, les doigts à utiliser.
              </p>
              <dl>
                <div>
                  <dt>O</dt>
                  <dd>Corde ouverte, à jouer sans l’appuyer.</dd>
                </div>
                <div>
                  <dt>X</dt>
                  <dd>Corde à ne pas jouer.</dd>
                </div>
                <div>
                  <dt>1–4</dt>
                  <dd>Index, majeur, annulaire, auriculaire.</dd>
                </div>
                <div>
                  <dt className={styles.barreLegend}>━</dt>
                  <dd>Barré : un doigt appuie plusieurs cordes.</dd>
                </div>
              </dl>
              <label className={styles.fingerToggle}>
                <input
                  type="checkbox"
                  checked={showFingers}
                  onChange={(event) => setShowFingers(event.target.checked)}
                />
                Afficher les numéros de doigts
              </label>
              <p className={styles.fretsText}>
                Cases (grave → aigu) :{" "}
                <strong>
                  {position.frets
                    .map((fret) => (fret === -1 ? "X" : fret))
                    .join(" · ")}
                </strong>
              </p>
              <p className={styles.tuning}>
                Accordage standard : Mi · La · Ré · Sol · Si · Mi
              </p>
            </aside>
          </>
        ) : (
          <div className={styles.empty}>
            <h2>
              {query.trim()
                ? "Aucun accord trouvé"
                : "Quel accord souhaitez-vous jouer ?"}
            </h2>
            <p>
              Essayez Am, Cmaj7 ou F#m, ou choisissez une fondamentale et un
              type ci-dessus.
            </p>
          </div>
        )}
      </div>
      <p className={styles.source}>
        Doigtés issus du dataset{" "}
        <a
          href="https://github.com/tombatossals/chords-db"
          target="_blank"
          rel="noreferrer"
        >
          chords-db
        </a>{" "}
        de David Rubert (MIT), intégrés et vérifiés localement. Les noms
        enharmoniques partagent les mêmes positions.
      </p>
    </section>
  );
}
