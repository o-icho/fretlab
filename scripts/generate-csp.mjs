import { createHash, randomUUID } from "node:crypto";
import { readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "parse5";

export const REPORT_ONLY = "Content-Security-Policy-Report-Only";
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// HTML's JavaScript MIME type essences, including historical aliases.
const javascriptTypes = new Set([
  "application/ecmascript", "application/javascript",
  "application/x-ecmascript", "application/x-javascript",
  "text/ecmascript", "text/javascript", "text/javascript1.0",
  "text/javascript1.1", "text/javascript1.2", "text/javascript1.3",
  "text/javascript1.4", "text/javascript1.5", "text/jscript",
  "text/livescript", "text/x-ecmascript", "text/x-javascript",
]);

export function extractInlineScripts(html) {
  const scripts = [];
  const document = parse(html, { sourceCodeLocationInfo: true });
  function visit(node) {
    if (node.tagName === "script") {
      const attrs = new Map(node.attrs.map(({ name, value }) => [name, value]));
      if (attrs.has("src")) return; // Includes local, remote and empty src attributes.
      const type = attrs.has("type")
        ? attrs.get("type").trim().toLowerCase()
        : attrs.get("language")
          ? `text/${attrs.get("language").toLowerCase()}`
          : "";
      const essence = type.split(";", 1)[0].trim();
      if (type !== "" && type !== "module" && !javascriptTypes.has(essence)) return;
      const location = node.sourceCodeLocation;
      if (!location?.startTag || !location.endTag) {
        throw new Error("Script inline sans balise de fermeture explicite.");
      }
      // Never use parsed textContent: the HTML parser normalizes line endings.
      scripts.push(html.slice(location.startTag.endOffset, location.endTag.startOffset));
    }
    // Template content is inert and is deliberately not traversed.
    for (const child of node.childNodes ?? []) visit(child);
  }
  visit(document);
  return scripts;
}

export function hashScript(content) {
  return `'sha256-${createHash("sha256").update(content, "utf8").digest("base64")}'`;
}

export async function scanExport(directory) {
  const hashes = new Set();
  let htmlFiles = 0, inlineScripts = 0;
  async function walk(path) {
    const entries = await readdir(path, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const file = join(path, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile() && /\.html$/i.test(entry.name)) {
        htmlFiles++;
        const scripts = extractInlineScripts(await readFile(file, "utf8"));
        inlineScripts += scripts.length;
        for (const script of scripts) hashes.add(hashScript(script));
      }
    }
  }
  await walk(directory);
  if (!htmlFiles) throw new Error("Aucun HTML dans out/. Exécutez pnpm run build avant security:csp.");
  return { htmlFiles, inlineScripts, hashes: [...hashes].sort() };
}

export function updateReportOnly(config, hashes) {
  const updated = structuredClone(config);
  const matches = (updated.headers ?? []).flatMap((route) =>
    (route.headers ?? []).filter((header) => header.key?.toLowerCase() === REPORT_ONLY.toLowerCase()),
  );
  if (matches.length !== 1) {
    throw new Error(`Attendu un seul header ${REPORT_ONLY}, trouvé : ${matches.length}.`);
  }
  const header = matches[0];
  if (typeof header.value !== "string") throw new Error("Valeur CSP invalide.");
  if (/\bunsafe-(inline|eval)\b/i.test(header.value)) {
    throw new Error("La politique existante contient une autorisation unsafe interdite.");
  }
  const directives = header.value.split(";").map((part) => part.trim().split(/\s+/)[0].toLowerCase());
  if (directives.filter((name) => name === "script-src").length !== 1 || directives.includes("script-src-elem")) {
    throw new Error("Attendu un seul script-src et aucun script-src-elem qui le remplacerait.");
  }
  if (hashes.some((hash) => !/^'sha256-[A-Za-z0-9+/]{43}='$/.test(hash))) {
    throw new Error("Hash SHA-256 CSP invalide.");
  }
  const scriptSrc = ["script-src 'self'", ...new Set(hashes)].join(" ");
  header.value = header.value.replace(/(^|;)(\s*)script-src(?=\s|;|$)[^;]*/i, (_, separator, whitespace) =>
    separator + whitespace + scriptSrc,
  );
  return { config: updated, scriptSrc };
}

export async function generateCsp(root = projectRoot) {
  const result = await scanExport(join(root, "out"));
  const configPath = join(root, "vercel.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const updated = updateReportOnly(config, result.hashes);
  const temporary = `${configPath}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(updated.config, null, 2) + "\n", "utf8");
    await rename(temporary, configPath);
  } finally {
    await rm(temporary, { force: true });
  }
  return { ...result, scriptSrc: updated.scriptSrc };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await generateCsp();
    console.log(`${result.htmlFiles} fichiers HTML ; ${result.inlineScripts} scripts inline exécutables ; ${result.hashes.length} hashes uniques.`);
    console.log(`${REPORT_ONLY} mis à jour dans vercel.json.`);
    console.log(result.scriptSrc);
  } catch (error) {
    console.error(`Génération CSP interrompue : ${error.message}`);
    process.exitCode = 1;
  }
}
