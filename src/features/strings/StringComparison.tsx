"use client";

import { Button } from "@/components/Button";
import { compareStringSets, type StringInstrument, type StringSet } from "@/domain/music/stringGauges";
import { midiToNote } from "@/domain/music/midi";
import { type Tuning } from "@/domain/music/tuning";
import { formatGauge, InstrumentField, SetField, TuningField } from "./StringControls";
import { useStringWorkspace } from "./useStringWorkspace";
import styles from "./strings.module.css";

function SetupFields({ title, instrument, set, tuning, changeSet, changeTuning }: {
  title: string;
  instrument: StringInstrument;
  set: StringSet;
  tuning: Tuning;
  changeSet: (id: string) => void;
  changeTuning: (id: string) => void;
}) {
  return (
    <fieldset className={styles.setup}>
      <legend>{title}</legend>
      <div className={styles.fields}>
        <SetField instrument={instrument} value={set.id} onChange={changeSet} />
        <TuningField value={tuning.id} onChange={changeTuning} />
      </div>
    </fieldset>
  );
}

function NoteAndGauge({ midi, tuning, gauge }: { midi: number; tuning: Tuning; gauge: number }) {
  const { note, octave } = midiToNote(midi, tuning.notation);
  return (
    <>
      <span className={styles.tableNote}>{note}<sub>{octave}</sub></span>
      <span className={styles.tableGauge}>{formatGauge(gauge)}</span>
    </>
  );
}

const feel = { same: "Identique", softer: "Plus souple", firmer: "Plus ferme" } as const;
const percent = new Intl.NumberFormat("fr-FR", { signDisplay: "exceptZero" });

export function StringComparison() {
  const { instrument, first, second, firstTuning, secondTuning, hrefs, updateQuery } = useStringWorkspace("comparer");
  const comparison = compareStringSets(first, firstTuning, second, secondTuning);

  return (
    <div className={styles.comparison}>
      <div className={styles.panel}>
        <div className={styles.instrument}>
          <InstrumentField instrument={instrument} onChange={value =>
            updateQuery({ instrument: value, first: null, second: null })} />
        </div>
        <div className={styles.setups}>
          <SetupFields title="Jeu de référence" instrument={instrument} set={first} tuning={firstTuning}
            changeSet={value => updateQuery({ first: value })} changeTuning={value => updateQuery({ firstTuning: value })} />
          <SetupFields title="Jeu à essayer" instrument={instrument} set={second} tuning={secondTuning}
            changeSet={value => updateQuery({ second: value })} changeTuning={value => updateQuery({ secondTuning: value })} />
        </div>
      </div>
      <section className={styles.panel} aria-labelledby="tension-heading">
        <h2 className={styles.heading} id="tension-heading">Tension corde par corde</h2>
        <p className={styles.help} id="tension-units">Chaque colonne indique la note et le diamètre en millièmes de pouce. L’écart de tension est estimé pour les deux jeux montés sur la même guitare.</p>
        <table className={styles.table} aria-labelledby="tension-heading" aria-describedby="tension-units">
          <thead>
            <tr>
              <th scope="col">Corde</th><th scope="col">Référence</th><th scope="col">À essayer</th><th scope="col">Écart</th>
            </tr>
          </thead>
          <tbody>{comparison.map(row => (
            <tr key={row.stringNumber}>
              <th scope="row">{row.stringNumber}<sup>{row.stringNumber === 1 ? "re" : "e"}</sup></th>
              <td><NoteAndGauge midi={row.firstMidi} gauge={row.firstGauge} tuning={firstTuning} /></td>
              <td><NoteAndGauge midi={row.secondMidi} gauge={row.secondGauge} tuning={secondTuning} /></td>
              <td>
                <span className={styles.change} data-direction={row.direction}>{percent.format(row.changePercent)} %</span>
                <span className={styles.feel}>{feel[row.direction]}</span>
              </td>
            </tr>
          ))}</tbody>
        </table>
        <p className={styles.modelLinks}>
          Fiches des jeux utilisés pour le calcul · <a href={first.sourceUrl}>{first.model}</a>
          {second.id !== first.id && <> · <a href={second.sourceUrl}>{second.model}</a></>}
        </p>
        <div className={styles.actions}>
          <Button secondary href={`/outils/accordeur/?tuning=${secondTuning.id}`}>Accordeur · {secondTuning.name}</Button>
          <Button secondary href={hrefs.justesse}>Vérifier la justesse</Button>
        </div>
      </section>
    </div>
  );
}
