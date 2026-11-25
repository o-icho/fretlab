"use client";

import { useSearchParams } from "next/navigation";
import { getDefaultStringSet, getStringGoals, getStringSets, recommendStringSet } from "@/domain/music/stringGauges";
import { resolveStringInstrument, resolveStringTuning } from "@/domain/music/stringTunings";
import { stringTools } from "./pages";

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
  const instrument = resolveStringInstrument(query.get("instrument"), query.get("tuning") ?? query.get("firstTuning") ?? query.get("secondTuning"));
  const sets = getStringSets(instrument);
  const standardSet = getDefaultStringSet(instrument);
  const tuning = resolveStringTuning(instrument, query.get("tuning"));
  const current = sets.find(set => set.id === query.get("current"));
  const goals = getStringGoals(instrument);
  const goal = goals.find(item => item.id === query.get("goal"))?.id ?? "balanced";
  const recommended = recommendStringSet(instrument, tuning, goal, current?.id);

  let first = sets.find(set => set.id === query.get("first")) ?? standardSet;
  let second = sets.find(set => set.id === query.get("second")) ?? sets.find(set => set.id !== standardSet.id) ?? standardSet;
  let firstTuning = resolveStringTuning(instrument, query.get("firstTuning"));
  let secondTuning = resolveStringTuning(instrument, query.get("secondTuning"));
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

  function changeInstrument(value: string) {
    const next = resolveStringInstrument(value);
    updateQuery({
      instrument: next,
      tuning: resolveStringTuning(next, tuning.id).id,
      firstTuning: resolveStringTuning(next, firstTuning.id).id,
      secondTuning: resolveStringTuning(next, secondTuning.id).id,
      goal: getStringGoals(next).some(item => item.id === goal) ? goal : null,
      current: null, first: null, second: null,
    });
  }

  const choiceParams: Record<string, string> = {
    instrument,
    goal,
    tuning: tool === "comparer" ? firstTuning.id : tuning.id,
  };
  const knownSet = tool === "comparer" ? first : current;
  if (knownSet) choiceParams.current = knownSet.id;
  const comparisonParams = { instrument, first: first.id, second: second.id, firstTuning: firstTuning.id, secondTuning: secondTuning.id, goal };
  const setupParams = { tuning: secondTuning.id, ...comparisonParams, ...(knownSet && { current: knownSet.id }) };
  const hrefs = {
    choisir: toolHref("choisir", choiceParams),
    comparer: toolHref("comparer", comparisonParams),
    justesse: toolHref("justesse", setupParams),
    accordeur: `/outils/accordeur/?${new URLSearchParams(setupParams)}`,
  };
  return { instrument, tuning, current, goals, goal, recommended, first, second, firstTuning, secondTuning, hrefs, changeInstrument, updateQuery };
}
