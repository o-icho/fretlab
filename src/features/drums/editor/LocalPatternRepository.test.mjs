import test from "node:test";
import assert from "node:assert/strict";
import { DRUM_PATTERNS } from "../presets.ts";
import { copyUserPattern, cycleStep, renameUserPattern, toggleTrackMute } from "./patternEditing.ts";
import { decodeUserPattern, LocalPatternRepository, PATTERN_SCHEMA_VERSION, PATTERN_STORAGE_KEY } from "./LocalPatternRepository.ts";

const date = "2026-10-05T10:00:00.000Z";
const later = "2026-10-05T11:00:00.000Z";
const pattern = () => copyUserPattern(DRUM_PATTERNS[0], "user-one", date);
function memory() {
  const values = new Map();
  return { values, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
test("save/load round trip preserves accent, mute, identity and dates in schema 1", () => {
  const storage = memory(); const repo = new LocalPatternRepository(storage);
  assert.deepEqual(repo.list(), []);
  const user = toggleTrackMute(cycleStep(cycleStep(pattern(), "kick", 0, 1, later), "kick", 0, 1, later), "snare", later);
  repo.save(user);
  const envelope = JSON.parse(storage.getItem(PATTERN_STORAGE_KEY));
  assert.equal(envelope.schemaVersion, PATTERN_SCHEMA_VERSION);
  const reloaded = new LocalPatternRepository(storage).list();
  assert.deepEqual(reloaded, [decodeUserPattern(user)]);
  reloaded[0].name = "changed outside repository";
  assert.equal(repo.list()[0].name, user.name);
});
test("save updates by stable id; deletion affects only its requested user pattern", () => {
  const storage = memory(); const repo = new LocalPatternRepository(storage);
  repo.save(pattern());
  repo.save(copyUserPattern(pattern(), "user-two", date));
  repo.save(renameUserPattern(pattern(), "Renommé", later));
  assert.equal(repo.list().length, 2);
  assert.equal(repo.list().find((p) => p.id === "user-one").name, "Renommé");
  repo.remove("user-one");
  assert.deepEqual(repo.list().map((p) => p.id), ["user-two"]);
  repo.remove("user-two"); assert.deepEqual(repo.list(), []);
  assert.equal(storage.values.size, 1);
});
test("unknown/missing schema and corrupt JSON are preserved, never overwritten by save/delete", () => {
  for (const body of ['{', JSON.stringify({ patterns: [] }), JSON.stringify({ schemaVersion: 2, patterns: [] }), JSON.stringify({ schemaVersion: 1, patterns: [{}] })]) {
    const storage = memory(); storage.setItem(PATTERN_STORAGE_KEY, body);
    const repo = new LocalPatternRepository(storage);
    assert.throws(() => repo.list()); assert.throws(() => repo.save(pattern())); assert.throws(() => repo.remove("user-one"));
    assert.equal(storage.getItem(PATTERN_STORAGE_KEY), body);
  }
});
test("persisted data is validated before reaching the player", () => {
  for (const patch of [{ id: "basic-rock" }, { name: " " }, { createdAt: "yesterday" }, { updatedAt: "2020-01-01T00:00:00.000Z" }, { tracks: {} }, { meter: null }, { bars: "1" }]) assert.throws(() => decodeUserPattern({ ...pattern(), ...patch }));
  const bad = pattern(); bad.tracks[0].muted = "true"; assert.throws(() => decodeUserPattern(bad));
  const velocity = pattern(); velocity.tracks[0].events[0].velocity = 2; assert.throws(() => decodeUserPattern(velocity));
  const storage = memory(); storage.setItem(PATTERN_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, patterns: [pattern(), pattern()] }));
  assert.throws(() => new LocalPatternRepository(storage).list());
});
test("unavailable storage and quota errors leave the draft and prior saved content intact", () => {
  const blocked = new LocalPatternRepository(() => { throw new Error("blocked"); });
  assert.throws(() => blocked.list(), /indisponible/);
  const storage = memory(); const repo = new LocalPatternRepository(storage); repo.save(pattern());
  const before = storage.getItem(PATTERN_STORAGE_KEY);
  const full = new LocalPatternRepository({ getItem: storage.getItem, setItem: () => { throw new Error("quota"); } });
  const draft = renameUserPattern(pattern(), "Encore en édition", later);
  assert.throws(() => full.save(draft), /édition reste ouverte/);
  assert.equal(storage.getItem(PATTERN_STORAGE_KEY), before); assert.equal(draft.name, "Encore en édition");
});
test("an older version cannot overwrite a newer saved edit", () => {
  const storage = memory(); const repo = new LocalPatternRepository(storage);
  repo.save(renameUserPattern(pattern(), "Version récente", later));
  assert.throws(() => repo.save(pattern()), /plus récente/);
  assert.equal(repo.list()[0].name, "Version récente");
});
