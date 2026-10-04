"use client";
import { useSearchParams } from "next/navigation";
import { Transposer } from "./Transposer";

/** Plain text interchange; chord parsing and transposition remain in the shared engine. */
export function TransposerFromUrl() {
  const params = useSearchParams();
  const text = (params.get("text") ?? "").slice(0, 10000);
  return <Transposer key={text} initialText={text} />;
}
