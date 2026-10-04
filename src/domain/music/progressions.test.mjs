import test from "node:test";
import assert from "node:assert/strict";
import { ROOTS } from "./catalog.ts";
import { createKey } from "./harmony.ts";
import { PROGRESSION_TEMPLATES } from "./progression-templates.ts";
import { availableLengths, createSeededRandom, editProgressionBar, formatProgression, generateProgression, matchingTemplates, progressionFromTemplate, toggleBarLock, unlockProgression } from "./progressions.ts";

const from = (id, root, mode, family, length = 4) => progressionFromTemplate(createKey(root, mode), PROGRESSION_TEMPLATES.find(t => t.id === id), family, length);
const initial = () => from("minor-pop-rock", "A", "minor", "rock");
const options = previous => ({ root: "A", mode: "minor", family: "rock", length: 4, random: () => 0, previous });

test("verified major and minor templates resolve in multiple keys", () => {
  assert.equal(formatProgression(from("pop-axis", "C", "major", "pop")), "C | G | Am | F");
  assert.equal(formatProgression(from("pop-axis", "D", "major", "pop")), "D | A | Bm | G");
  assert.equal(formatProgression(from("pop-axis", "Bb", "major", "pop")), "Bb | F | Gm | Eb");
  assert.equal(formatProgression(initial(), true), "Am | F | C | G\ni | VI | III | VII");
  assert.equal(formatProgression(from("minor-pop-rock", "F#", "minor", "rock")), "F#m | D | A | E");
});

test("minor V major is explicitly altered, not natural minor v", () => {
  const progression = from("minor-dominant", "A", "minor", "rock");
  assert.equal(formatProgression(progression), "Am | Dm | F | E");
  const dominant = progression.bars[3];
  assert.equal(dominant.roman, "V");
  assert.equal(dominant.alteration, "harmonic-minor-dominant");
  assert.equal(dominant.isDiatonic, false);
  assert.ok(dominant.chord.pitches.includes(8)); // G# is the raised leading tone in A minor.
});

test("blues forms declare dominant sevenths and actual twelve-bar structure", () => {
  const loop = from("blues-major-loop", "C", "major", "blues");
  assert.equal(formatProgression(loop), "C7 | F7 | C7 | G7");
  assert.deepEqual(loop.bars.map(b => b.isDiatonic), [false, false, false, true]);
  assert.ok(loop.bars.every(b => b.alteration === "blues-dominant"));
  assert.equal(formatProgression(from("blues-major-12", "C", "major", "blues", 12)), "C7 | C7 | C7 | C7 | F7 | F7 | C7 | C7 | G7 | F7 | C7 | G7");
  assert.equal(formatProgression(from("blues-minor-loop", "A", "minor", "blues")), "Am7 | Dm7 | Am7 | E7");
  assert.throws(() => from("pop-axis", "C", "major", "pop", 12), RangeError);
});

test("soul/funk seventh templates distinguish natural chords and harmonic dominant", () => {
  assert.equal(formatProgression(from("soul-major-cadence", "C", "major", "soul-funk")), "Dm7 | G7 | Cmaj7 | Cmaj7");
  const minor = from("soul-minor-cadence", "A", "minor", "soul-funk");
  assert.equal(formatProgression(minor, true), "Bm7b5 | E7 | Am7 | Am7\niiø7 | V7 | i7 | i7");
  assert.equal(minor.bars[1].alteration, "harmonic-minor-dominant");
});

test("all declared templates have valid structured bars across roots and lengths", () => {
  assert.equal(new Set(PROGRESSION_TEMPLATES.map(t => t.id)).size, PROGRESSION_TEMPLATES.length);
  for (const template of PROGRESSION_TEMPLATES) for (const root of ROOTS) for (const length of template.lengths) {
    const progression = from(template.id, root, template.mode, template.families[0], length);
    assert.equal(progression.bars.length, length);
    assert.equal(progression.generatedFromTemplate.id, template.id);
    for (const bar of progression.bars) {
      assert.ok(bar.chord.parsed.root.spelling && bar.chord.pitches.length >= 3);
      assert.ok(bar.degree >= 1 && bar.degree <= 7);
      assert.ok(bar.roman);
      if (!bar.isDiatonic) assert.ok(bar.alteration);
    }
    assert.equal(JSON.parse(JSON.stringify(progression)).bars.length, length);
  }
});

test("eight bars repeat an explicit phrase and lengths depend on template family", () => {
  const progression = from("pop-axis", "C", "major", "pop", 8);
  assert.deepEqual(progression.bars.slice(0, 4), progression.bars.slice(4));
  assert.deepEqual(availableLengths("major", "rock"), [4, 8]);
  assert.deepEqual(availableLengths("minor", "blues"), [4, 8, 12]);
  assert.equal(matchingTemplates("major", "pop", 12).length, 0);
});

test("seeded generation is reproducible and avoids consecutive identical results", () => {
  function sequence(seed) {
    const random = createSeededRandom(seed);
    let previous;
    const result = [];
    for (let i = 0; i < 15; i++) {
      const generated = generateProgression({ ...options(previous), random });
      assert.equal(generated.ok, true);
      const text = formatProgression(generated.progression);
      if (previous) assert.notEqual(text, formatProgression(previous));
      result.push(text);
      previous = generated.progression;
    }
    return result;
  }
  assert.deepEqual(sequence(1234), sequence(1234));
  assert.notDeepEqual(sequence(1234), sequence(5678));
  for (const sample of [-0.1, 1, NaN, Infinity]) assert.throws(() => generateProgression({ ...options(), random: () => sample }), RangeError);
  assert.throws(() => createSeededRandom(NaN), RangeError);
});

test("locks preserve exact bars while choosing a different whole compatible template", () => {
  const progression = toggleBarLock(initial(), 0);
  const before = JSON.stringify(progression);
  const result = generateProgression(options(progression));
  assert.equal(result.ok, true);
  assert.strictEqual(result.progression.bars[0], progression.bars[0]);
  assert.equal(result.progression.bars[0].chord.symbol, "Am");
  assert.notEqual(result.progression.generatedFromTemplate.id, progression.generatedFromTemplate.id);
  assert.equal(JSON.stringify(progression), before);
});

test("incompatible and complete locks stop generation without arbitrary replacements", () => {
  const twoLocks = toggleBarLock(toggleBarLock(initial(), 0), 1);
  assert.equal(generateProgression(options(twoLocks)).reason, "no-alternative");
  let allLocked = initial();
  for (let i = 0; i < 4; i++) allLocked = toggleBarLock(allLocked, i);
  assert.equal(generateProgression(options(allLocked)).reason, "no-alternative");
  const chromaticLock = toggleBarLock(editProgressionBar(initial(), 0, "F#m"), 0);
  assert.equal(generateProgression(options(chromaticLock)).reason, "locked-template");
});

test("key, mode and length changes cannot silently discard locks", () => {
  const previous = toggleBarLock(initial(), 0);
  for (const changes of [{ root: "C" }, { mode: "major" }, { length: 8 }]) {
    assert.equal(generateProgression({ ...options(previous), ...changes }).reason, "locked-settings");
  }
  assert.equal(generateProgression({ ...options(unlockProgression(previous)), root: "C" }).ok, true);
});

test("manual edits preserve the model and honestly report chromatic or unknown chords", () => {
  const progression = initial();
  const changed = editProgressionBar(progression, 1, "Bbmaj7");
  assert.equal(changed.bars[1].chord.symbol, "Bbmaj7");
  assert.equal(changed.bars[1].isDiatonic, false);
  assert.equal(changed.bars[1].degree, null);
  assert.equal(changed.bars[1].edited, true);
  assert.equal(progression.bars[1].chord.symbol, "F");
  assert.equal(changed.generatedFromTemplate.id, progression.generatedFromTemplate.id);
  const slash = editProgressionBar(progression, 1, "C/E");
  assert.equal(slash.bars[1].chord.parsed.bass.name, "E");
  assert.equal(slash.bars[1].isDiatonic, true);
  assert.equal(editProgressionBar(progression, 1, "Cadd9").bars[1].isDiatonic, null);
  assert.throws(() => editProgressionBar(toggleBarLock(progression, 0), 0, "Dm"), RangeError);
  assert.throws(() => editProgressionBar(progression, 99, "Dm"), RangeError);
  assert.throws(() => editProgressionBar(progression, 0, "Hello"), RangeError);
});

test("unknown selection and undeclared harmonic alterations are rejected", () => {
  assert.equal(generateProgression({ ...options(), family: "bad" }).reason, "unavailable");
  const invalid = { id: "bad", name: "bad", description: "", mode: "minor", families: ["rock"], lengths: [4], steps: [{ degree: 5, quality: "major" }] };
  assert.throws(() => progressionFromTemplate(createKey("A", "minor"), invalid, "rock", 4), RangeError);
});
