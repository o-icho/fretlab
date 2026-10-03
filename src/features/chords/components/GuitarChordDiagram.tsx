import { useId } from "react";
import type { ChordPosition } from "../lib/model";

export function GuitarChordDiagram({
  position,
  name,
  showFingers = true,
}: {
  position: ChordPosition;
  name: string;
  showFingers?: boolean;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const x = (string: number) => 58 + string * 31;
  const y = (fret: number) => 57 + (fret - position.baseFret + 0.5) * 36;
  const description = position.frets
    .map(
      (fret, index) =>
        `corde ${6 - index} : ${fret === -1 ? "non jouée" : fret === 0 ? "ouverte" : `case ${fret}${position.fingers?.[index] ? `, doigt ${position.fingers[index]}` : ""}`}`,
    )
    .join(" ; ");
  return (
    <svg
      viewBox="0 0 280 292"
      width="280"
      height="292"
      style={{ width: "100%", height: "auto", maxWidth: 340 }}
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
    >
      <title id={titleId}>{`${name} — diagramme de guitare`}</title>
      <desc id={descriptionId}>
        {`${description}. ${position.barres
          .map(
            (barre) =>
              `Barré case ${barre.fret}, cordes ${6 - barre.fromString} à ${6 - barre.toString}.`,
          )
          .join(" ")}`}
      </desc>
      <g stroke="#626875" strokeWidth="1.2">
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`string-${i}`} x1={x(i)} x2={x(i)} y1={57} y2={237} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={58}
            x2={213}
            y1={57 + i * 36}
            y2={57 + i * 36}
          />
        ))}
      </g>
      {position.baseFret === 1 ? (
        <line
          x1={56}
          x2={215}
          y1={57}
          y2={57}
          stroke="#f5f1e8"
          strokeWidth="5"
        />
      ) : (
        <text x={37} y={80} textAnchor="end" fill="#a9adb7" fontSize="14">
          {position.baseFret}
        </text>
      )}
      {position.frets.map((fret, i) =>
        fret <= 0 ? (
          <text
            key={`state-${i}`}
            x={x(i)}
            y={37}
            fill="#f5f1e8"
            fontSize="16"
            textAnchor="middle"
          >
            {fret === 0 ? "O" : "X"}
          </text>
        ) : null,
      )}
      {position.barres.map((barre, i) => (
        <line
          key={`barre-${i}`}
          data-barre="true"
          x1={x(barre.fromString)}
          x2={x(barre.toString)}
          y1={y(barre.fret)}
          y2={y(barre.fret)}
          stroke="#e6a637"
          strokeWidth="20"
          strokeLinecap="round"
        />
      ))}
      {position.frets.map((fret, i) =>
        fret > 0 ? (
          <g key={`finger-${i}`}>
            <circle cx={x(i)} cy={y(fret)} r={11} fill="#e6a637" />
            {showFingers && !!position.fingers?.[i] && (
              <text
                x={x(i)}
                y={y(fret) + 4}
                textAnchor="middle"
                fill="#111318"
                fontSize="12"
                fontWeight="700"
              >
                {position.fingers[i]}
              </text>
            )}
          </g>
        ) : null,
      )}
      <g fill="#a9adb7" fontSize="12" textAnchor="middle">
        {["Mi", "La", "Ré", "Sol", "Si", "mi"].map((label, i) => (
          <text key={i} x={x(i)} y={262}>
            {label}
          </text>
        ))}
      </g>
      <text x={135} y={286} textAnchor="middle" fill="#a9adb7" fontSize="10">
        Grave ← cordes → aigu
      </text>
    </svg>
  );
}
