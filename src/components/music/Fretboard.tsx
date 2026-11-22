"use client";

import { useEffect, useId, useRef, useState } from "react";
import { tuningNotes, type Tuning } from "@/domain/music/tuning";
import type { FretRange } from "@/domain/music/fretboard";
import styles from "./fretboard.module.css";

export type FretboardMarker = {
  stringIndex: number;
  fret: number;
  label: string;
  description: string;
  isRoot: boolean;
  midi: number;
};

/** Horizontal neck renderer. Markers are supplied by the caller's domain logic. */
export function Fretboard({ tuning, range, markers, title, onPlay, immersive = false }: {
  tuning: Tuning;
  range: FretRange;
  markers: readonly FretboardMarker[];
  title: string;
  onPlay: (midi: number) => void;
  immersive?: boolean;
}) {
  const id = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);
  useEffect(() => {
    const element = scrollRef.current;
    if (!immersive || !element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setViewport({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [immersive]);

  const strings = tuningNotes(tuning);
  const frets = Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i);
  const height = immersive ? 278 : 344;
  const frame = immersive ? viewport : null;
  // Work in SVG units so the string spacing can follow the height while 15 frets fit the width.
  const scale = frame ? frame.height / height : 1;
  const left = frame ? Math.min(46, frame.width * 0.09) / scale : 72;
  const right = frame ? 4 / scale : 24;
  const columnWidth = frame
    ? (frame.width / scale - left - right) / Math.min(15, frets.length)
    : 68;
  const width = left + frets.length * columnWidth + right;
  const outerRadius = Math.min(21, columnWidth / 2 - 0.75);
  const noteRadius = immersive ? outerRadius * 0.9 : 17;
  const targetWidth = Math.min(columnWidth, 42);
  const noteFontSize = immersive ? Math.min(15, noteRadius * 0.92) : 13;
  const top = 70;
  const bottom = 280;
  const y = (index: number) => bottom - index * (bottom - top) / (strings.length - 1);
  const x = (fret: number) => left + (fret - range.start + 0.5) * columnWidth;

  return (
    <div className={`${styles.wrapper} ${immersive ? styles.immersive : ""}`}>
      <div ref={scrollRef} className={styles.scroll} role="region" tabIndex={0}
        aria-label="Manche de guitare, défilement horizontal" aria-describedby={`${id}-help`}>
        <svg className={`${styles.board} ${frets.length > 6 ? styles.full : ""}`} width={width} height={height} viewBox={`0 ${immersive ? 26 : 0} ${width} ${height}`}
          role="group" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
          <title id={`${id}-title`}>{title}</title>
          <desc id={`${id}-description`}>
            {`${tuning.name}, cases ${range.start} à ${range.end}. Corde grave en bas, aiguë en haut.
              Les fondamentales sont entourées d’un double cercle.`}
          </desc>
          <rect x={left} y={50} width={frets.length * columnWidth} height={250} rx={8} fill="var(--bg)" />
          {frets.map((fret) => (
            <g key={fret}>
              <text x={x(fret)} y={immersive ? 42 : 26} textAnchor="middle" fill="var(--muted)" fontSize={noteFontSize}>{fret}</text>
              <line x1={left + (fret - range.start) * columnWidth} x2={left + (fret - range.start) * columnWidth}
                y1={50} y2={300} stroke={fret === 1 ? "var(--text)" : "var(--control-border)"} strokeWidth={fret === 1 ? 5 : 1} />
              {[3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(fret) && (
                fret % 12 === 0
                  ? <><circle cx={x(fret)} cy={133} r={6} fill="var(--control-border)" /><circle cx={x(fret)} cy={217} r={6} fill="var(--control-border)" /></>
                  : <circle cx={x(fret)} cy={175} r={6} fill="var(--control-border)" />
              )}
            </g>
          ))}
          <line x1={width - right} x2={width - right} y1={50} y2={300} stroke="var(--control-border)" />
          {strings.map((string, index) => (
            <g key={index}>
              <text x={immersive ? left * 0.7 : 44} y={y(index) + 5} fill="var(--muted)" fontSize={immersive ? noteFontSize : 14} textAnchor="end">{string.note}</text>
              <line x1={left} x2={width - right} y1={y(index)} y2={y(index)} stroke="var(--muted)" strokeWidth={2.5 - index * 0.3} />
            </g>
          ))}
          {markers.map((marker) => (
            <g key={`${marker.stringIndex}-${marker.fret}`}>
              <title>{marker.description}</title>
              {marker.isRoot && <circle cx={x(marker.fret)} cy={y(marker.stringIndex)} r={outerRadius} fill="none" stroke="var(--accent)" strokeWidth={1.5} />}
              <circle cx={x(marker.fret)} cy={y(marker.stringIndex)} r={noteRadius}
                fill={marker.isRoot ? "var(--accent)" : "var(--surface)"} stroke={marker.isRoot ? "var(--accent)" : "var(--muted)"} strokeWidth={1.5} />
              <text x={x(marker.fret)} y={y(marker.stringIndex) + noteFontSize * 0.34} textAnchor="middle"
                fill={marker.isRoot ? "var(--bg)" : "var(--text)"} fontSize={noteFontSize} fontWeight={750}>{marker.label}</text>
              <foreignObject x={x(marker.fret) - targetWidth / 2} y={y(marker.stringIndex) - 21} width={targetWidth} height={42}>
                <button type="button" className={styles.playNote} title={marker.description}
                  aria-label={`Jouer · ${marker.description}`} onClick={() => onPlay(marker.midi)} />
              </foreignObject>
            </g>
          ))}
          {!immersive && <text x={left} y={331} fill="var(--muted)" fontSize={12}>
            {range.start === 0 ? "0 = corde à vide · " : ""}Grave en bas · Aigu en haut
          </text>}
        </svg>
      </div>
      <p className={immersive ? "sr-only" : styles.hint} id={`${id}-help`}>Sur petit écran, faites défiler le manche horizontalement. Au clavier : flèches gauche et droite.</p>
    </div>
  );
}
