import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";
import assert from "node:assert/strict";
import { featureFlags, getEnabledFeatures, getFeatureDefinition, isFeatureEnabled, isFeatureHrefEnabled } from "./features.ts";
import { featureRouteFallback } from "./requireFeature.ts";
import { tools } from "../lib/content.ts";
import { PUBLIC_PATHS } from "../lib/sitemap.ts";
test("flags, registre et identifiants cohérents", () => {
  assert.equal(isFeatureEnabled("metronome"),true);
  assert.equal(isFeatureEnabled("drumMachine"),true);
  assert.equal(isFeatureEnabled("chordProgressions"),false);
  assert.ok(isFeatureEnabled("strings"));
  assert.equal(getEnabledFeatures().length,Object.values(featureFlags).filter(Boolean).length);
  for(const id of Object.keys(featureFlags)) assert.equal(getFeatureDefinition(id).id,id);
  assert.equal(new Set(Object.keys(featureFlags).map(id=>getFeatureDefinition(id).href)).size,Object.keys(featureFlags).length);
});
test("navigation et cartes partagent la liste filtrée ; sitemap filtré",()=>{
  assert.deepEqual(tools,getEnabledFeatures());
  const disabled=getFeatureDefinition("chordProgressions");
  assert.equal(tools.some(tool=>tool.id===disabled.id),false);
  assert.equal(PUBLIC_PATHS.includes(disabled.href),false);
  assert.ok(tools.some(tool=>tool.id==="drumMachine"));
  for(const feature of tools) assert.ok(PUBLIC_PATHS.includes(feature.href));
  for (const slug of ["choisir", "comparer", "justesse"])
    assert.ok(PUBLIC_PATHS.includes("/outils/cordes-et-reglages/" + slug));
});
test("garde des routes : fallback noindex pour disabled, enabled autorisé",()=>{
  assert.equal(featureRouteFallback("metronome"),null);
  assert.equal(featureRouteFallback("drumMachine"),null);
  assert.match(renderToStaticMarkup(featureRouteFallback("chordProgressions")), /noindex, nofollow/);
});
test("liens éditoriaux : routes connues, query, sous-pages et sites externes",()=>{
  assert.equal(isFeatureHrefEnabled("/outils/progressions/?key=G"),false);
  assert.equal(isFeatureHrefEnabled("https://fretlab.fr/outils/boite-a-rythmes/"),true);
  assert.equal(isFeatureHrefEnabled("/outils/metronome"),true);
  assert.equal(isFeatureHrefEnabled("/articles/test"),true);
  assert.equal(isFeatureHrefEnabled("https://example.com/outils/progressions"),true);
});
