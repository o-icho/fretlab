"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { tuningNotes } from "@/domain/music/tuning";
import { formatGauge, InstrumentField, SetField, TuningField } from "./StringControls";
import { useStringWorkspace } from "./useStringWorkspace";
import styles from "./strings.module.css";

export function StringChooser() {
  const { instrument, tuning, current, goals, goal, recommended, hrefs, changeInstrument, updateQuery } = useStringWorkspace("choisir");
  const { set, explanation } = recommended;
  const notes = tuningNotes(tuning);

  return (
    <div className={styles.chooser}>
      <section className={styles.panel} aria-labelledby="string-choice-settings">
        <h2 id="string-choice-settings" className={styles.heading}>Votre instrument</h2>
        <div className={styles.fields}>
          <InstrumentField instrument={instrument} onChange={changeInstrument} />
          <TuningField instrument={instrument} value={tuning.id} onChange={value => updateQuery({ tuning: value })} />
        </div>
        <SetField instrument={instrument} value={current?.id ?? ""} allowUnknown
          onChange={value => updateQuery({ current: value || null })} />
        <fieldset className={styles.goals}>
          <legend>Quel toucher recherchez-vous ?</legend>
          <div className={styles.choices}>
            {goals.map(item => (
              <label key={item.id} className={styles.choice}>
                <input type="radio" name="string-goal" value={item.id} checked={item.id === goal}
                  onChange={() => updateQuery({ goal: item.id })} />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className={styles.recommendation} aria-labelledby="recommended-set">
        <div aria-live="polite" aria-atomic="true">
          <h2 id="recommended-set" className={styles.resultLabel}>Jeu conseillé</h2>
          <p className={styles.recommendedSet}>{set.label}</p>
          <p className={styles.explanation}>{explanation}</p>
          {(instrument === "bass-4" || instrument === "bass-5") &&
            <p className={styles.help}>Ces jeux sont au format Long Scale. Vérifiez la longueur de cordes prévue pour votre basse.</p>}
        </div>
        <div className={styles.gaugeDetail}>
          <p>Diamètres en millièmes de pouce, du grave à l’aigu</p>
          <ol className={styles.strings} aria-label={`Tirant par corde, de la ${notes.length}e à la 1re`}>
            {notes.map((note, index) => (
              <li key={index}>
                <span className={styles.note}>{note.note}<sub>{note.octave}</sub></span>
                <span>{formatGauge(set.gauges[index])}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className={styles.actions}>
          <Button href={hrefs.comparer}>
            {current ? "Comparer avec mon jeu actuel" : "Comparer deux jeux"} <Icon name="arrow" size={16} />
          </Button>
          <Button secondary href={hrefs.accordeur}>
            Accordeur · {tuning.name}
          </Button>
          <Link className={styles.actionLink} href={hrefs.justesse}>
            Vérifier la justesse <Icon name="arrow" size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
