import test from "node:test";
import assert from "node:assert/strict";
import { STANDARD_TUNING, BASS_4_TUNING, BASS_5_TUNING, TUNINGS } from "./tuning.ts";
import { getStringTunings } from "./stringTunings.ts";
import {
  STRING_INSTRUMENTS, getStringGoals, getStringSets, getDefaultStringSet,
  recommendStringSet, compareStringSets,
} from "./stringGauges.ts";

const standard = STANDARD_TUNING;
const dropD = TUNINGS.find(tuning => tuning.id === "drop-d");
const electric = getDefaultStringSet("electric");
const heavyBottom = getStringSets("electric").find(set => set.id === "exl140");

test("guider en Drop D vers les basses d'un 10–52 tout en gardant les trois aigus du 10–46", () => {
  const result = recommendStringSet("electric", dropD, "firmer-bass", electric.id);
  assert.equal(result.set, heavyBottom);
  assert.match(result.explanation, /ré grave/);
  assert.deepEqual(result.set.gauges.slice(3), electric.gauges.slice(3));
});

test("un jeu pour chaque souhait et accordage, même sans connaître le tirant précédent", () => {
  for (const { id: instrument } of STRING_INSTRUMENTS) {
    const sets = getStringSets(instrument);
    const inputs = [...sets.map(set => set.id), "jeu-inconnu", undefined];
    const tunings = getStringTunings(instrument);
    for (const tuning of tunings) {
      for (const { id: goal } of getStringGoals(instrument)) {
        for (const previous of inputs) {
          const { set, explanation } = recommendStringSet(instrument, tuning, goal, previous);
          assert.ok(sets.includes(set));
          assert.equal(set.instrument, instrument);
          assert.ok(explanation);
        }
      }
    }
    for (const set of sets) {
      assert.equal(set.gauges.length, tunings[0].strings.length);
      assert.equal(set.referenceLbs.length, set.gauges.length);
      assert.ok(set.referenceLbs.every(tension => tension > 0));
      assert.match(set.sourceUrl, /^https:\/\/www\.daddario\.com\/products\//);
    }
  }
  assert.equal(recommendStringSet("classical", standard, "balanced", electric.id).set.id, "ej45");
  assert.equal(recommendStringSet("folk", standard, "softer").set.id, "ej26");
  assert.equal(recommendStringSet("electric", standard, "bends", electric.id).set.id, "exl125");
  assert.equal(recommendStringSet("electric", standard, "firmer-bass", heavyBottom.id).set, heavyBottom);
  assert.equal(recommendStringSet("electric", standard, "balanced", heavyBottom.id).set, heavyBottom);
  const standardD = TUNINGS.find(tuning => tuning.id === "d-standard");
  assert.equal(recommendStringSet("electric", standardD, "balanced").set.id, "exl115");
});

test("jeux de basse long scale, de la corde grave à la corde de sol", () => {
  for (const [instrument, tuning, split, lighter, hybrid, percentages] of [
    ["bass-4", BASS_4_TUNING, [100, 80, 65, 45], "40–95", "45–105", [10, 13, 0, 0]],
    ["bass-5", BASS_5_TUNING, [130, 100, 80, 65, 45], "40–125", "45–135", [9, 10, 13, 0, 0]],
  ]) {
    const regular = getDefaultStringSet(instrument);
    assert.deepEqual(regular.gauges, split);
    assert.equal(recommendStringSet(instrument, tuning, "balanced", "exl110").set, regular);
    assert.equal(recommendStringSet(instrument, tuning, "softer", regular.id).set.label, lighter);
    const { set: heavier } = recommendStringSet(instrument, tuning, "firmer-bass", regular.id);
    assert.equal(heavier.label, hybrid);
    const result = compareStringSets(regular, tuning, heavier, tuning);
    assert.deepEqual(result.map(row => row.stringNumber), split.map((_, index) => split.length - index));
    assert.deepEqual(result.map(row => row.firstMidi), tuning.strings);
    assert.deepEqual(result.map(row => row.changePercent), percentages);
    assert.deepEqual(getStringGoals(instrument).map(goal => goal.id), ["balanced", "softer", "firmer-bass"]);
  }
});

test("l’accordage abaissé d’une basse modifie uniquement sa corde grave", () => {
  for (const [instrument, standard, dropId, lowest, hybrid] of [
    ["bass-4", BASS_4_TUNING, "bass-4-drop-d", 26, "45–105"],
    ["bass-5", BASS_5_TUNING, "bass-5-drop-a", 21, "45–135"],
  ]) {
    const strings = getDefaultStringSet(instrument);
    const drop = getStringTunings(instrument).find(tuning => tuning.id === dropId);
    const [low, ...upper] = compareStringSets(strings, standard, strings, drop);
    assert.equal(low.firstMidi, lowest + 2);
    assert.equal(low.secondMidi, lowest);
    assert.equal(low.changePercent, -21);
    assert.ok(upper.every(row => row.direction === "same" && row.changePercent === 0));
    assert.equal(recommendStringSet(instrument, drop, "balanced").set.label, hybrid);
    assert.equal(recommendStringSet(instrument, drop, "balanced", strings.id).set, strings);
  }
});

test("en Drop D le même jeu perd environ 21 % de tension sur la seule corde grave", () => {
  const [low, ...rest] = compareStringSets(electric, standard, electric, dropD);
  assert.deepEqual(low, { stringNumber: 6, firstMidi: 40, secondMidi: 38,
    firstGauge: 46, secondGauge: 46, changePercent: -21, direction: "softer" });
  assert.ok(rest.every(row => row.direction === "same" && row.changePercent === 0));
  assert.equal(compareStringSets(electric, dropD, electric, standard)[0].changePercent, 26);
});

test("les références publiées valent aussi pour les cordes filées et nylon", () => {
  const hybrid = compareStringSets(electric, standard, heavyBottom, standard);
  assert.deepEqual(hybrid.map(row => row.changePercent), [25, 35, 34, 0, 0, 0]);
  const equivalent = compareStringSets(electric, standard, heavyBottom, dropD)[0];
  assert.equal(equivalent.changePercent, -1);
  const [lightNylon, normalNylon, hardNylon] = getStringSets("classical");
  assert.deepEqual(lightNylon.gauges.slice(3), [39.7, 31.7, 27.5]);
  assert.deepEqual(normalNylon.gauges.slice(3), [40.3, 32.2, 28]);
  assert.deepEqual(hardNylon.gauges.slice(3), [41, 32.7, 28.5]);
  const nylon = compareStringSets(lightNylon, standard, normalNylon, standard);
  assert.equal(nylon[5].firstGauge, 27.5);
  assert.equal(nylon[5].secondGauge, 28);
  assert.equal(nylon[5].changePercent, 3);
  assert.ok(nylon.every(row => row.direction === "firmer"));
});

test("exclure les comparaisons entre instruments et les accordages incompatibles", () => {
  assert.throws(() => compareStringSets(electric, standard, getDefaultStringSet("folk"), standard), RangeError);
  const invalid = { ...standard, strings: [40, 45, 50, 55, 59, NaN] };
  for (const tuning of [BASS_4_TUNING, invalid]) {
    assert.throws(() => compareStringSets(electric, tuning, electric, standard), RangeError);
    assert.throws(() => compareStringSets(electric, standard, electric, tuning), RangeError);
  }
  const bass4 = getDefaultStringSet("bass-4");
  const bass5 = getDefaultStringSet("bass-5");
  assert.throws(() => compareStringSets(bass4, BASS_4_TUNING, bass5, BASS_5_TUNING), RangeError);
  assert.throws(() => compareStringSets(bass5, BASS_4_TUNING, bass5, BASS_5_TUNING), RangeError);
  assert.throws(() => recommendStringSet("bass-4", STANDARD_TUNING, "balanced"), RangeError);
});
