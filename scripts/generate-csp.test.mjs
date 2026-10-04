import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { extractInlineScripts, hashScript, generateCsp, updateReportOnly, REPORT_ONLY } from "./generate-csp.mjs";

const fixtureConfig = () => ({
  headers: [{ source: "/(.*)", headers: [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: REPORT_ONLY, value: "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'" },
  ] }],
  trailingSlash: true,
});

test("known SHA-256 hash and exact source whitespace, CRLF, Unicode and entities", () => {
  assert.equal(hashScript("alert('Hello, world.');"), "'sha256-qznLcsROx4GACP2dm0UCKCzCG+HiZ1guq6ZZDob/Tng='" );
  const script = "\r\n  console.log('é &amp; 🎸');\r\n\t";
  assert.deepEqual(extractInlineScripts(`<script>${script}</script>`), [script]);
  const expected = `'sha256-${createHash("sha256").update(Buffer.from(script)).digest("base64")}'`;
  assert.equal(hashScript(extractInlineScripts(`<script>${script}</script>`)[0]), expected);
  assert.notEqual(hashScript(script), hashScript(script.trim()));
});

test("external scripts with any src, JSON-LD and non executable data are excluded", () => {
  assert.deepEqual(extractInlineScripts(`
    <script src="/local.js">ignored()</script>
    <SCRIPT SRC='https://example.com/remote.js'>ignored()</SCRIPT>
    <script src>ignored()</script>
    <script type="application/ld+json">{"hello":"world"}</script>
    <script type="application/json">{}</script>
    <script type="importmap">{}</script>
    <script type="text/plain">ignored()</script>
    <script data-src="not-src">included()</script>
  `), ["included()"]);
});

test("HTML syntax, quoted >, MIME types and inert markup are handled by a real parser", () => {
  assert.deepEqual(extractInlineScripts(`
    <!-- <script>comment()</script> -->
    <textarea><script>text()</script></textarea>
    <template><script>inert()</script></template>
    <noscript><script>disabled()</script></noscript>
    <script data-label=">" type="module">moduleCode()</script>
    <script type=" text/javascript; charset=utf-8 ">classic()</script>
    <script type="text/javascrip&#116;">entityType()</script>
    <script language="JavaScript">legacy()</script>
  `), ["moduleCode()", "classic()", "entityType()", "legacy()"]);
});

test("only script-src changes; every other header and config field is preserved", () => {
  const original = fixtureConfig();
  const { config, scriptSrc } = updateReportOnly(original, [hashScript("hello()")]);
  assert.equal(scriptSrc, `script-src 'self' ${hashScript("hello()")}`);
  config.headers[0].headers[1].value = config.headers[0].headers[1].value.replace(scriptSrc, "script-src 'self'");
  assert.deepEqual(config, original);
  assert.equal(original.headers[0].headers[1].value.includes("sha256"), false);
});

test("ambiguous or unsafe CSP configuration is rejected", () => {
  assert.throws(() => updateReportOnly({}, []), /un seul header/);
  const unsafe = fixtureConfig();
  unsafe.headers[0].headers[1].value += "; style-src-attr 'unsafe-inline'";
  assert.throws(() => updateReportOnly(unsafe, []), /unsafe/);
  const duplicate = fixtureConfig();
  duplicate.headers[0].headers[1].value += "; script-src 'self'";
  assert.throws(() => updateReportOnly(duplicate, []), /un seul script-src/);
  assert.throws(() => updateReportOnly(fixtureConfig(), ["'unsafe-eval'"]), /Hash/);
});

async function fixture(t) {
  const temporaryRoot = resolve(tmpdir());
  const root = await mkdtemp(join(temporaryRoot, "fretlab-csp-"));
  assert.ok(root.startsWith(temporaryRoot + sep));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "out", "articles"), { recursive: true });
  await writeFile(join(root, "vercel.json"), JSON.stringify(fixtureConfig()));
  return root;
}

test("recursive export, duplicate hashes, valid JSON and idempotent generation", async (t) => {
  const root = await fixture(t);
  await writeFile(join(root, "out", "index.html"), "<script>one()</script><script>one()</script>");
  await writeFile(join(root, "out", "articles", "index.html"), "<script>one()</script><script>two()</script>");
  const result = await generateCsp(root);
  assert.equal(result.htmlFiles, 2);
  assert.equal(result.inlineScripts, 4);
  assert.deepEqual(result.hashes, [hashScript("one()"), hashScript("two()")].sort());
  const first = await readFile(join(root, "vercel.json"), "utf8");
  const parsed = JSON.parse(first);
  assert.equal(parsed.headers[0].headers[1].key, REPORT_ONLY);
  assert.doesNotMatch(first, /unsafe-inline|unsafe-eval/);
  await generateCsp(root);
  assert.equal(await readFile(join(root, "vercel.json"), "utf8"), first);
});

test("script-src-attr is not mistaken for the script-src directive", () => {
  const original = fixtureConfig();
  original.headers[0].headers[1].value = "script-src-attr 'none'; script-src 'self'; style-src 'self'";
  const { config } = updateReportOnly(original, [hashScript("hello()")]);
  assert.equal(config.headers[0].headers[1].value,
    `script-src-attr 'none'; script-src 'self' ${hashScript("hello()")}; style-src 'self'`);
});

test("an empty or malformed export leaves vercel.json untouched", async (t) => {
  const root = await fixture(t);
  const original = await readFile(join(root, "vercel.json"), "utf8");
  await assert.rejects(generateCsp(root), /Aucun HTML/);
  await writeFile(join(root, "out", "index.html"), "<script>unfinished()");
  await assert.rejects(generateCsp(root), /fermeture/);
  assert.equal(await readFile(join(root, "vercel.json"), "utf8"), original);
});
