"use client";

import { useSearchParams } from "next/navigation";
import { getDefaultStringSet, getStringSets, recommendStringSet, STRING_GOALS, STRING_INSTRUMENTS } from "@/domain/music/stringGauges";
import { STANDARD_TUNING, TUNINGS } from "@/domain/music/tuning";
import { stringTools } from "./pages";

function tuningFromId(id: string | null) {
  return TUNINGS.find(tuning => tuning.id === id) ?? STANDARD_TUNING;
}

function toolHref(tool: keyof typeof stringTools, params: Record<string, string>) {
  return `${stringTools[tool].href}/?${new URLSearchParams(params)}`;
}

function updateQuery(changes: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", url);
}

export function useStringWorkspace(tool: keyof typeof stringTools) {
  const query = useSearchParams();
  const instrument = STRING_INSTRUMENTS.find(item => item.id === query.get("instrument"))?.id ?? "electric";
  const sets = getStringSets(instrument);
  const standardSet = getDefaultStringSet(instrument);
  const tuning = tuningFromId(query.get("tuning"));
  const current = sets.find(set => set.id === query.get("current"));
  const goals = STRING_GOALS.filter(goal => instrument !== "classical" || goal.id !== "bends");
  const goal = goals.find(item => item.id === query.get("goal"))?.id ?? "balanced";
  const recommended = recommendStringSet(instrument, tuning, goal, current?.id);

  let first = sets.find(set => set.id === query.get("first")) ?? standardSet;
  let second = sets.find(set => set.id === query.get("second")) ?? sets.find(set => set.id !== standardSet.id) ?? standardSet;
  let firstTuning = tuningFromId(query.get("firstTuning"));
  let secondTuning = tuningFromId(query.get("secondTuning"));
  if (tool === "choisir") {
    first = current ?? (standardSet.id === recommended.set.id
      ? recommendStringSet(instrument, tuning, "softer", standardSet.id).set
      : standardSet);
    second = recommended.set;
    firstTuning = tuning;
    secondTuning = tuning;
  } else if (tool === "justesse") {
    if (!query.has("firstTuning")) firstTuning = tuning;
    secondTuning = tuning;
  }

  const choiceParams: Record<string, string> = {
    instrument,
    goal,
    tuning: tool === "comparer" ? firstTuning.id : tuning.id,
  };
  const knownSet = tool === "comparer" ? first : current;
  if (knownSet) choiceParams.current = knownSet.id;
  const comparisonParams = { instrument, first: first.id, second: second.id, firstTuning: firstTuning.id, secondTuning: secondTuning.id, goal };
  const hrefs = {
    choisir: toolHref("choisir", choiceParams),
    comparer: toolHref("comparer", comparisonParams),
    justesse: toolHref("justesse", { tuning: secondTuning.id, ...comparisonParams, ...(knownSet && { current: knownSet.id }) }),
  };
  return { instrument, tuning, current, goals, goal, recommended, first, second, firstTuning, secondTuning, hrefs, updateQuery };
}
