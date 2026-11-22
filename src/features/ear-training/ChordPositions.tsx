import { useMemo, useState } from "react";
import type { EarExercise } from "@/domain/music/earTraining";
import { GuitarChordDiagram } from "@/features/chords/components/GuitarChordDiagram";
import { earChordPositions } from "./earChordPositions";
import styles from "./ear-training.module.css";

export default function ChordPositions({ exercise }: { exercise: EarExercise }) {
  const positions = useMemo(() => earChordPositions(exercise), [exercise]);
  const [index, setIndex] = useState(0);
  const position = positions[index];
  if (!position) return <p>Aucun diagramme disponible pour cet accord.</p>;
  return <>
    <GuitarChordDiagram position={position} name={exercise.answer} />
    <div className={styles.positionControls} role="group" aria-label="Positions de l’accord">
      <button type="button" aria-label="Position précédente" disabled={index === 0}
        onClick={() => setIndex(index - 1)}>←</button>
      <span role="status" aria-label={`Position ${index + 1} sur ${positions.length}`}>{index + 1} / {positions.length}</span>
      <button type="button" aria-label="Position suivante" disabled={index === positions.length - 1}
        onClick={() => setIndex(index + 1)}>→</button>
    </div>
  </>;
}
