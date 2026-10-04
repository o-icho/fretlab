import { useId } from "react";
import { tuningNotes, type Tuning } from "@/domain/music/tuning";
import type { FretRange } from "@/domain/music/fretboard";
import styles from "./fretboard.module.css";

export type FretboardMarker = {
  stringIndex: number;
  fret: number;
  label: string;
  description: string;
  isRoot: boolean;
};

/** Horizontal neck renderer. Markers are supplied by the caller's domain logic. */
export function Fretboard({ tuning, range, markers, title }: {
  tuning: Tuning;
  range: FretRange;
  markers: readonly FretboardMarker[];
  title: string;
}) {
  const id = useId();
  const strings = tuningNotes(tuning);
  const frets = Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i);
  const columnWidth = 68;
  const left = 72;
  const width = left + frets.length * columnWidth + 24;
  const height = 344;
  const top = 70;
  const bottom = 280;
  const y = (index: number) => bottom - index * (bottom - top) / (strings.length - 1);
  const x = (fret: number) => left + (fret - range.start + 0.5) * columnWidth;

  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll} role="region" tabIndex={0}
        aria-label="Manche de guitare, défilement horizontal" aria-describedby={`${id}-help`}>
        <svg className={`${styles.board} ${frets.length > 6 ? styles.full : ""}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`}
          role="img" aria-labelledby={`${id}-title ${id}-description`}>
          <title id={`${id}-title`}>{title}</title>
          <desc id={`${id}-description`}>
            {`${tuning.name}, cases ${range.start} à ${range.end}. Corde grave en bas, aiguë en haut.
              Les fondamentales sont entourées d’un double cercle. Les notes de chaque corde sont détaillées sous le manche.`}
          </desc>
          <rect x={left} y={50} width={frets.length * columnWidth} height={250} rx={8} fill="#111318" />
          {frets.map((fret) => (
            <g key={fret}>
              <text x={x(fret)} y={26} textAnchor="middle" fill="#a9adb7" fontSize={13}>{fret}</text>
              <line x1={left + (fret - range.start) * columnWidth} x2={left + (fret - range.start) * columnWidth}
                y1={50} y2={300} stroke={fret === 1 ? "#f5f1e8" : "#3b3f49"} strokeWidth={fret === 1 ? 5 : 1} />
              {[3, 5, 7, 9, 12, 15].includes(fret) && (
                fret === 12
                  ? <><circle cx={x(fret)} cy={133} r={6} fill="#3b3f49" /><circle cx={x(fret)} cy={217} r={6} fill="#3b3f49" /></>
                  : <circle cx={x(fret)} cy={175} r={6} fill="#3b3f49" />
              )}
            </g>
          ))}
          <line x1={width - 24} x2={width - 24} y1={50} y2={300} stroke="#3b3f49" />
          {strings.map((string, index) => (
            <g key={index}>
              <text x={44} y={y(index) + 5} fill="#a9adb7" fontSize={14} textAnchor="end">{string.note}</text>
              <line x1={left} x2={width - 24} y1={y(index)} y2={y(index)} stroke="#626875" strokeWidth={2.5 - index * 0.3} />
            </g>
          ))}
          {markers.map((marker) => (
            <g key={`${marker.stringIndex}-${marker.fret}`}>
              <title>{marker.description}</title>
              {marker.isRoot && <circle cx={x(marker.fret)} cy={y(marker.stringIndex)} r={21} fill="none" stroke="#e6a637" strokeWidth={1.5} />}
              <circle cx={x(marker.fret)} cy={y(marker.stringIndex)} r={17}
                fill={marker.isRoot ? "#e6a637" : "#1a1d24"} stroke={marker.isRoot ? "#e6a637" : "#37b7a5"} strokeWidth={1.5} />
              <text x={x(marker.fret)} y={y(marker.stringIndex) + 4.5} textAnchor="middle"
                fill={marker.isRoot ? "#111318" : "#f5f1e8"} fontSize={13} fontWeight={750}>{marker.label}</text>
            </g>
          ))}
          <text x={left} y={331} fill="#a9adb7" fontSize={12}>
            {range.start === 0 ? "0 = corde à vide · " : ""}Grave en bas · Aigu en haut
          </text>
        </svg>
      </div>
      <p className={styles.hint} id={`${id}-help`}>Sur petit écran, faites défiler le manche horizontalement. Au clavier : flèches gauche et droite.</p>
    </div>
  );
}
