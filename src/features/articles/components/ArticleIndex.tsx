"use client";
import { useState, type ReactNode } from "react";
import styles from "./articles.module.css";
export function ArticleIndex({
  sections,
}: {
  sections: { category: string; count: number; content: ReactNode }[];
}) {
  const [selected, setSelected] = useState("Tous");
  const section =
    sections.find((item) => item.category === selected) ?? sections[0];
  return (
    <section className={styles.index}>
      <div
        className={styles.categories}
        role="group"
        aria-label="Filtrer par catégorie"
      >
        {sections.map((item) => (
          <button
            type="button"
            key={item.category}
            aria-pressed={selected === item.category}
            onClick={() => setSelected(item.category)}
          >
            {item.category}
          </button>
        ))}
      </div>
      <div className={styles.listHeading}>
        <h2>{selected === "Tous" ? "Articles récents" : selected}</h2>
        <p role="status">
          {section.count} article{section.count > 1 ? "s" : ""}
        </p>
      </div>
      {section.content}
    </section>
  );
}
