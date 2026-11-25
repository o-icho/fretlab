"use client";

import { getStringSets, STRING_INSTRUMENTS, type StringInstrument } from "@/domain/music/stringGauges";
import { TUNINGS } from "@/domain/music/tuning";
import styles from "./strings.module.css";

export function SelectField({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: readonly { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)}>
        {options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function InstrumentField({ instrument, onChange }: {
  instrument: StringInstrument;
  onChange: (value: string) => void;
}) {
  return <SelectField label="Instrument" value={instrument} options={STRING_INSTRUMENTS} onChange={onChange} />;
}

export function TuningField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const options = TUNINGS.map(tuning => ({ id: tuning.id, label: tuning.name }));
  return <SelectField label="Accordage" value={value} options={options} onChange={onChange} />;
}

export function SetField({ instrument, value, onChange, allowUnknown = false }: {
  instrument: StringInstrument;
  value: string;
  onChange: (value: string) => void;
  allowUnknown?: boolean;
}) {
  const sets = getStringSets(instrument).map(set => ({ id: set.id, label: set.label }));
  const options = allowUnknown ? [{ id: "", label: "Je ne connais pas mon tirant" }, ...sets] : sets;
  return <SelectField label={allowUnknown ? "Jeu actuel" : "Jeu de cordes"} value={value} options={options} onChange={onChange} />;
}

const gaugeNumber = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 });
export function formatGauge(gauge: number) {
  return gaugeNumber.format(gauge);
}
