import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";
import assert from "node:assert/strict";
import { featureFlags, getEnabledFeatures, getFeatureDefinition, isFeatureEnabled, isFeatureHrefEnabled } from "./features.ts";
import { featureRouteFallback } from "./requireFeature.ts";
import { tools } from "../lib/content.ts";
import { PUBLIC_PATHS } from "../lib/sitemap.ts";
test("flags, registre et identifiants cohérents", () => {
  assert.equal(isFeatureEnabled("metronome"),true);
  assert.equal(isFeatureEnabled("drumMachine"),false);
  assert.equal(isFeatureEnabled("chordProgressions"),false);
  assert.equal(getEnabledFeatures().length,6);
  for(const id of Object.keys(featureFlags)) assert.equal(getFeatureDefinition(id).id,id);
  assert.equal(new Set(Object.keys(featureFlags).map(id=>getFeatureDefinition(id).href)).size,8);
});
test("navigation et cartes partagent la liste filtrée ; sitemap filtré",()=>{
  assert.deepEqual(tools,getEnabledFeatures());
  for(const id of ["drumMachine","chordProgressions"]){
    const feature=getFeatureDefinition(id);
    assert.equal(tools.some(tool=>tool.id===id),false);
    assert.equal(PUBLIC_PATHS.includes(feature.href),false);
  }
  for(const feature of tools) assert.ok(PUBLIC_PATHS.includes(feature.href));
});
test("garde des routes : fallback noindex pour disabled, enabled autorisé",()=>{
  assert.equal(featureRouteFallback("metronome"),null);
  for(const id of ["drumMachine","chordProgressions"])
    assert.match(renderToStaticMarkup(featureRouteFallback(id)), /noindex, nofollow/);
});
test("liens éditoriaux : routes connues, query, sous-pages et sites externes",()=>{
  assert.equal(isFeatureHrefEnabled("/outils/progressions/?key=G"),false);
  assert.equal(isFeatureHrefEnabled("https://fretlab.fr/outils/boite-a-rythmes/"),false);
  assert.equal(isFeatureHrefEnabled("/outils/metronome"),true);
  assert.equal(isFeatureHrefEnabled("/articles/test"),true);
  assert.equal(isFeatureHrefEnabled("https://example.com/outils/progressions"),true);
});
