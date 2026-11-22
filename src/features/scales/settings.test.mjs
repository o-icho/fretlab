import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SCALE_SETTINGS, POSITION_STARTS, parseScaleSettings, scaleSearchParams, scaleFretRange } from "./settings.ts";

test("missing and malformed URL parameters fall back independently", () => {
  assert.deepEqual(parseScaleSettings(new URLSearchParams()), DEFAULT_SCALE_SETTINGS);
  assert.deepEqual(parseScaleSettings(new URLSearchParams("root=H&scale=unknown&tuning=unknown&notation=unknown&view=bad&display=bad&start=-1")), DEFAULT_SCALE_SETTINGS);
  const valid = parseScaleSettings(new URLSearchParams("root=D&scale=dorian&start=3&tuning=bad"));
  assert.equal(valid.root, "D");
  assert.equal(valid.scale, "dorian");
  assert.equal(valid.start, 3);
  assert.equal(valid.tuning, "standard");
});

test("a shared URL round-trips every main setting, including # and targeted frets", () => {
  const settings = { root: "C#", scale: "major", hidden: [0, 7], tuning: "drop-d", view: "position", start: 20, display: "intervals" };
  const params = scaleSearchParams(settings, "utm_source=practice&notation=flats");
  assert.equal(params.has("notation"), false);
  assert.deepEqual(parseScaleSettings(new URLSearchParams("notation=flats")), DEFAULT_SCALE_SETTINGS);
  assert.ok(params.toString().includes("root=C%23"));
  assert.equal(params.get("utm_source"), "practice");
  assert.deepEqual(parseScaleSettings(new URLSearchParams(params.toString())), settings);
  assert.equal(scaleSearchParams(DEFAULT_SCALE_SETTINGS).toString(), "root=A&scale=minor-pentatonic");
});

test("hidden notes belong to the selected scale and can include every scale note", () => {
  const settings = parseScaleSettings(new URLSearchParams("scale=minor-blues&hidden=7,3,,6,7,4,bad,12,-1"));
  assert.deepEqual(settings.hidden, [3, 6, 7]);
  const allHidden = { ...settings, hidden: [0, 3, 5, 6, 7, 10] };
  assert.deepEqual(parseScaleSettings(scaleSearchParams(allHidden)), allHidden);
  assert.equal(scaleSearchParams(DEFAULT_SCALE_SETTINGS, "hidden=0").has("hidden"), false);
});

test("full neck and targeted zones are independent of scale and tuning", () => {
  assert.deepEqual(scaleFretRange(DEFAULT_SCALE_SETTINGS), { start: 0, end: 24 });
  for (const start of POSITION_STARTS) {
    assert.deepEqual(scaleFretRange({ ...DEFAULT_SCALE_SETTINGS, view: "position", start }), { start, end: start + 4 });
  }
});
