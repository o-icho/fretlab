import { readdir, readFile, stat, writeFile, rename } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { TRACK_ID, BACKING_FILE, EXAMPLE_FILE, TRACK_FILE, trackPaths, decodeContentTrack } from "../src/features/backing-tracks/content.ts";
import { decodeBackingTrackSummary } from "../src/domain/music/backingTracks.ts";

export async function scanBackingTracks(root) {
  const catalogue = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const folder of entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    if (!folder.isDirectory() || folder.name.startsWith('_')) continue;
    const id = folder.name;
    if (!TRACK_ID.test(id)) throw new Error(`[${id}] Nom de dossier invalide (TRACK_ID).`);
    // This static route already belongs to the existing admin screen.
    if (id === 'ajouter') throw new Error('[ajouter] Identifiant réservé à la route éditoriale.');
    try {
      const files = await readdir(join(root, id), { withFileTypes: true });
      const selected = [];
      for (const [label, regex] of [['Backingtrack', BACKING_FILE], ['Example', EXAMPLE_FILE], ['Track JSON', TRACK_FILE]]) {
        const matches = files.filter(file => file.isFile() && regex.test(file.name));
        if (matches.length !== 1) throw new Error(`${label} : exactement 1 fichier attendu, ${matches.length} trouvé(s).`);
        const file = matches[0].name;
        if (regex.exec(file)[1] !== id) throw new Error(`${file} : identifiant différent du dossier ${id}.`);
        if (!(await stat(join(root, id, file))).size) throw new Error(`${file} est vide.`);
        selected.push(file);
      }
      const raw = JSON.parse(await readFile(join(root, id, selected[2]), 'utf8'));
      if (raw?.id !== id) throw new Error('ID JSON différent du dossier.');
      const track = decodeContentTrack(raw);
      catalogue.push({ ...decodeBackingTrackSummary(track), ...trackPaths(id) });
    } catch (error) { throw new Error(`[${id}] ${error.message}`, { cause: error }); }
  }
  return catalogue;
}
export async function generateBackingTracksCatalog(root = resolve('public/backing-tracks')) {
  const catalogue = await scanBackingTracks(root);
  const destination = join(root, 'catalog.generated.json');
  const json = JSON.stringify(catalogue, null, 2) + '\n';
  // Avoid unnecessary dev rebuilds, and never leave a partially written index.
  if (await readFile(destination, 'utf8').catch(() => '') !== json) {
    await writeFile(`${destination}.tmp`, json);
    await rename(`${destination}.tmp`, destination);
  }
  return catalogue;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(`Catalogue backing tracks : ${(await generateBackingTracksCatalog()).length} morceau(x).`); }
  catch (error) { console.error(`Erreur catalogue backing tracks : ${error.message}`); process.exitCode = 1; }
}
