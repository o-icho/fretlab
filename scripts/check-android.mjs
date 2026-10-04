import { readFile, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const exported = resolve("out");
const packaged = resolve("android/app/src/main/assets/public");
const routes = [
  "",
  "outils/accords",
  "outils/metronome",
  "outils/accordeur",
  "outils/transposeur",
  "articles",
  "a-propos",
];
const articles = (await readdir("content/articles"))
  .filter((file) => file.endsWith(".md"))
  .map((file) => `articles/${file.slice(0, -3)}`);
for (const route of [...routes, ...articles]) {
  const html = await readFile(join(exported, route, "index.html"), "utf8");
  assert.ok(html.includes("<h1"), `Page exportée manquante : ${route}`);
  assert.equal(
    html.includes("/_next/image?"),
    false,
    "Optimisation image nécessitant un serveur",
  );
}
let files = 0;
async function checkDirectory(path = "") {
  for (const entry of await readdir(join(exported, path), {
    withFileTypes: true,
  })) {
    const relative = join(path, entry.name);
    if (entry.isDirectory()) await checkDirectory(relative);
    else {
      const [original, copy] = await Promise.all([
        readFile(join(exported, relative)),
        readFile(join(packaged, relative)),
      ]);
      const hash = (body) => createHash("sha256").update(body).digest("hex");
      assert.equal(
        hash(copy),
        hash(original),
        `Asset Android obsolète : ${relative}`,
      );
      files++;
    }
  }
}
await checkDirectory();
const config = JSON.parse(
  await readFile("android/app/src/main/assets/capacitor.config.json", "utf8"),
);
assert.equal(config.appId, "com.fretlab.app");
assert.equal(config.appName, "FretLab");
assert.equal(config.webDir, "out");
assert.equal(config.server.androidScheme, "https");
assert.equal(
  config.server.url,
  undefined,
  "Une URL distante empêcherait le démarrage hors connexion",
);
const variables = await readFile("android/variables.gradle", "utf8");
for (const key of ["compileSdkVersion", "targetSdkVersion"])
  assert.ok(Number(variables.match(new RegExp(`${key} = (\\d+)`))[1]) >= 36);
const manifest = await readFile(
  "android/app/src/main/AndroidManifest.xml",
  "utf8",
);
const permissions = [
  ...manifest.matchAll(/<uses-permission android:name="([^"]+)"/g),
].map((match) => match[1]);
assert.deepEqual(permissions.sort(), [
  "android.permission.INTERNET",
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.RECORD_AUDIO",
]);
console.log(
  `${routes.length + articles.length} routes et ${files} fichiers synchronisés, HTTPS local, SDK 36+, permissions vérifiées.`,
);
