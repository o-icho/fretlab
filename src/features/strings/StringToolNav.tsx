"use client";

import Link from "next/link";
import { stringTools } from "./pages";
import { useStringWorkspace } from "./useStringWorkspace";

export function StringToolNav({ tool, className }: { tool: keyof typeof stringTools; className: string }) {
  const { hrefs } = useStringWorkspace(tool);
  return (
    <nav aria-label="Outils de la rubrique" className={className}>
      {(Object.keys(stringTools) as (keyof typeof stringTools)[]).map(id => (
        <Link key={id} href={hrefs[id]} aria-current={tool === id ? "page" : undefined}>{stringTools[id].navLabel}</Link>
      ))}
    </nav>
  );
}
