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
  const settings = { root: "C#", scale: "major", tuning: "drop-d", notation: "flats", view: "position", start: 12, display: "intervals" };
  const params = scaleSearchParams(settings, "utm_source=practice");
  assert.ok(params.toString().includes("root=C%23"));
  assert.equal(params.get("utm_source"), "practice");
  assert.deepEqual(parseScaleSettings(new URLSearchParams(params.toString())), settings);
  assert.equal(scaleSearchParams(DEFAULT_SCALE_SETTINGS).toString(), "root=A&scale=minor-pentatonic");
});

test("full neck and targeted zones are independent of scale and tuning", () => {
  assert.deepEqual(scaleFretRange(DEFAULT_SCALE_SETTINGS), { start: 0, end: 15 });
  for (const start of POSITION_STARTS) {
    assert.deepEqual(scaleFretRange({ ...DEFAULT_SCALE_SETTINGS, view: "position", start }), { start, end: start + 4 });
  }
});
