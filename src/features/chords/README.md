# chords

Le catalogue guitare de chords-db (MIT) déclare 86 suffixes. FretLab propose
tous ces suffixes et conserve 826 des 828 couples fondamentale/type fournis,
soit 3 165 positions. Les variantes enharmoniques partagent les doigtés, y
compris les basses après la barre oblique. Les combinaisons absentes de la
bibliothèque pour une fondamentale restent indisponibles.

`lib/model.ts` définit les types, avec cordes de Mi grave à mi aigu, frettes
absolues, -1 pour une corde muette et 0 pour une corde ouverte. Les doigts vont
de 1 (index) à 4 (auriculaire), 0 signifie aucun doigt. Les indices de cordes des
barrés vont de 0 à 5. `baseFret` indique la première case affichée.

`lib/search.ts` normalise les noms et effectue une recherche exacte, puis résout
les noms enharmoniques tout en conservant l’orthographe demandée. M et m restent
distincts. Le dataset ne se charge depuis aucun service distant à l’utilisation.

`components/GuitarChordDiagram.tsx` rend cinq cases en SVG avec description
accessible, cordes ouvertes/muettes, doigts, barrés et numéro de première frette.
`components/ChordDictionary.tsx` permet de choisir la fondamentale et le type
d’accord, puis de parcourir les positions. Les styles sont isolés dans un CSS Module.

La révision Git, le hash du JSON source, la liste des suffixes et les positions
rejetées sont dans `src/data/chords/PROVENANCE.json`. La licence est conservée
dans `LICENSE.chords-db.txt`. Aucun doigté n'est transposé ni inventé à l'import.
Les quatre positions étiquetées C#11 contiennent une onzième augmentée et les
quatre Emadd9 ont des notes étrangères. Aucun de ces deux accords n'est proposé.

L'import vérifie les frettes absolues, le MIDI de chaque corde, le doigté, les
barrés et la basse réelle des accords avec basse imposée. Il contrôle les notes
autorisées et la présence des extensions caractéristiques, avec les omissions
de guitare explicites de `scripts/import-chords.mjs`. Par exemple, certains
m9 sur basse de septième omettent la tierce et gardent la quinte et la neuvième.
Dans cette source, « alt » indique une triade majeure à quinte diminuée.

Reproduction : télécharger `lib/guitar.json` à la révision indiquée, puis exécuter
`node scripts/import-chords.mjs chemin/guitar.json revision-git`. Les tests
`npm test` contrôlent les recherches, les données et les notes réellement jouées.
