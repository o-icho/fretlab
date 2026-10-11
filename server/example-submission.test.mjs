import { test } from "node:test";
import assert from "node:assert/strict";
import { createSubmissionHandler, matchesAudioSignature } from "./example-submission.ts";
import { MAX_EXAMPLE_BYTES, submissionEndpoint } from "../src/features/backing-tracks/submission.ts";

const origin = "https://fretlab.test";
const track = { id: "blues", slug: "blues", title: "Blues", bpm: 100, key: "C", durationMs: 10000 };
const bytes = Buffer.from("ID3\0\0\0\0\0\0\0audio fixture");
function fixture(overrides = {}) {
  const sent = [];
  const deps = { enabled: true, configuration: async () => ({ recipientEmail: "review@example.test", apiKey: "test-only", fromEmail: "sender@example.test" }), tracks: async () => [track], send: async (key, mail) => { sent.push({ key, mail }); }, ...overrides };
  return { sent, handler: createSubmissionHandler(deps) };
}
function request(changes = {}, file = new File([bytes], "solo.mp3"), requestOptions = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ slug: "blues", pseudo: "Guitariste", email: "player@example.test", comment: "Ma prise", ...changes })) form.set(key, value);
  if (file) form.set("audio", file);
  return new Request(origin + "/api/submit-example", { method: "POST", headers: { Origin: origin, "X-FretLab-Submission": "1" }, body: form, ...requestOptions });
}
test("submission: attachment bytes, configured recipient and authoritative track metadata", async () => {
  const { handler, sent } = fixture();
  assert.equal((await handler(request())).status, 200);
  assert.equal(sent.length, 1);
  const { mail } = sent[0];
  assert.equal(mail.to, "review@example.test");
  assert.equal(mail.subject, "[FretLab] Example submission - Blues");
  assert.deepEqual(Buffer.from(mail.attachments[0].content, "base64"), bytes);
  for (const text of ["Track id: blues", "Track slug: blues", "Track title: Blues", "Guitariste", "player@example.test", "Ma prise", "solo.mp3"]) assert.ok(mail.text.includes(text));
  assert.equal(mail.replyTo, "player@example.test");
});
test("optional fields can be empty; unknown track cannot send", async () => {
  const { handler, sent } = fixture();
  assert.equal((await handler(request({ pseudo: "", email: "", comment: "" }))).status, 200);
  assert.equal(sent[0].mail.replyTo, undefined);
  assert.equal((await handler(request({ slug: "not-published" }))).status, 404);
  assert.equal(sent.length, 1);
});
test("placeholder, invalid config and missing server env fail closed", async () => {
  for (const override of [{ recipientEmail: "CHANGE_ME@example.com" }, { recipientEmail: "bad" }, { apiKey: "" }, { fromEmail: "" }]) {
    const { handler, sent } = fixture({ configuration: async () => ({ recipientEmail: "review@example.test", apiKey: "test", fromEmail: "sender@example.test", ...override }) });
    const response = await handler(request());
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, "SERVER_CONFIGURATION_ERROR");
    assert.equal(sent.length, 0);
  }
});
test("file required, extension/signature/size and fields validated before send", async () => {
  const { handler, sent } = fixture();
  for (const file of [null, new File([], "empty.mp3"), new File([bytes], "file.exe"), new File(["not audio"], "fake.mp3"), new File([new Uint8Array(MAX_EXAMPLE_BYTES + 1)], "large.mp3")]) assert.ok((await handler(request({}, file))).status >= 400);
  for (const changes of [{ email: "invalid" }, { pseudo: "x".repeat(81) }, { comment: "x".repeat(2001) }, { to: "attacker@example.test" }, { title: "Forged title" }]) assert.equal((await handler(request(changes))).status, 400);
  assert.equal(sent.length, 0);
});
test("bounded request rejects overflow without Content-Length and duplicate files", async () => {
  const { handler, sent } = fixture();
  const oversized = new Request(origin + "/api/submit-example", { method: "POST", headers: { Origin: origin, "X-FretLab-Submission": "1", "Content-Type": "multipart/form-data; boundary=test" }, body: new Uint8Array(MAX_EXAMPLE_BYTES + 100000) });
  assert.equal((await handler(oversized)).status, 413);
  const form = new FormData(); form.set("slug", "blues"); form.append("audio", new File([bytes], "a.mp3")); form.append("audio", new File([bytes], "b.mp3"));
  assert.equal((await handler(request({}, null, { body: form }))).status, 400);
  assert.equal(sent.length, 0);
});
test("WAV and M4A signatures accepted, mismatched content rejected", async () => {
  const { handler, sent } = fixture();
  for (const [name, bytes] of [["solo.wav", Buffer.from("RIFFxxxxWAVEdata")], ["solo.m4a", Buffer.from("xxxxftypM4A xxxx")]]) {
    // MP4 needs the complete 16-byte header.
    const content = Buffer.concat([bytes, Buffer.alloc(4)]);
    assert.equal(matchesAudioSignature(name, content), true);
    assert.equal((await handler(request({}, new File([content], name)))).status, 200);
  }
  assert.equal(sent.length, 2);
  assert.equal(matchesAudioSignature("solo.wav", bytes), false);
});
test("provider error never leaks; no automatic retry sends a second mail", async () => {
  const { handler } = fixture({ send: async () => { throw new Error("sensitive provider detail"); } });
  const response = await handler(request());
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { code: "SEND_FAILED" });
});
test("native CORS, preflight, methods, feature guard and CSRF header", async () => {
  const { handler } = fixture();
  const native = { Origin: "https://localhost", "X-FretLab-Submission": "1" };
  const response = await handler(request({}, undefined, { headers: native }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://localhost");
  assert.equal((await handler(new Request(origin + "/api/submit-example", { method: "OPTIONS", headers: native }))).status, 204);
  assert.equal((await handler(new Request(origin + "/api/submit-example", { headers: native }))).status, 405);
  for (const headers of [{ Origin: "https://evil.test", "X-FretLab-Submission": "1" }, { Origin: origin }]) assert.equal((await handler(request({}, undefined, { headers }))).status, 403);
  assert.equal((await fixture({ enabled: false }).handler(request())).status, 404);
});
test("Web same-origin endpoint and Android HTTPS origin configuration", () => {
  assert.equal(submissionEndpoint(false), "/api/submit-example");
  assert.equal(submissionEndpoint(true, origin), origin + "/api/submit-example");
  for (const value of [undefined, "http://example.test", "https://example.test/path", "https://user:pass@example.test"]) assert.throws(() => submissionEndpoint(true, value));
});
