import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { stringsHub, stringTools } from "@/features/strings/pages";
import { StringToolNav } from "@/features/strings/StringToolNav";
import styles from "./section.module.css";

export function StringToolPage({ tool, children }: {
  tool: keyof typeof stringTools;
  children: ReactNode;
}) {
  const current = stringTools[tool];
  return (
    <>
      <header className={styles.heading}>
        <Link className={styles.back} href={stringsHub.href}>{stringsHub.name}</Link>
        <h1>{current.title}</h1>
      </header>
      <Suspense fallback={<p role="status">Chargement de l’outil…</p>}>
        <StringToolNav tool={tool} className={styles.toolNav} />
        {children}
      </Suspense>
    </>
  );
}
