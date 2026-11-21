# chords

Le dataset local `src/data/chords/dataset.ts` contient 179 accords canoniques et
696 positions sourcées dans chords-db (MIT). Les 17 noms de fondamentales sont
recherchables via équivalence enharmonique ; quinze qualités sont couvertes.

`lib/model.ts` définit les types, avec cordes de Mi grave à mi aigu, frettes
absolues, -1 pour une corde muette et 0 pour une corde ouverte. Les doigts vont
de 1 (index) à 4 (auriculaire), 0 signifie aucun doigt. Les indices de cordes des
barrés vont de 0 à 5. `baseFret` indique la première case affichée.

`lib/search.ts` normalise les noms et effectue une recherche exacte, puis résout
les noms enharmoniques tout en conservant l’orthographe demandée. M et m restent
distincts. Le dataset ne se charge depuis aucun service distant à l’utilisation.

`components/GuitarChordDiagram.tsx` rend cinq cases en SVG avec description
accessible, cordes ouvertes/muettes, doigts, barrés et numéro de première frette.
`components/ChordDictionary.tsx` contient la recherche, les filtres, les raccourcis
et la navigation entre les positions. Les styles sont isolés dans un CSS Module.

Provenance détaillée : `src/data/chords/PROVENANCE.json`, avec révision Git, hash
du JSON source et liste des positions rejetées. Licence upstream conservée dans
`LICENSE.chords-db.txt`. L’import convertit les cases relatives en cases absolues,
vérifie les notes MIDI source, les doigts, la fenêtre de cases et les barrés, puis
contrôle les notes de l’accord. Une septième peut omettre la quinte juste, comme
le C7 ouvert usuel. Les 7sus4 et 7#9 peuvent aussi omettre la quinte juste.
Pour 11, fondamentale, onzième et septième mineure sont obligatoires ; tierce,
quinte et neuvième sont facultatives. Pour 13, fondamentale, tierce majeure,
septième mineure et treizième sont obligatoires ; quinte, neuvième et onzième
sont facultatives. Toute note jouée doit appartenir à l’accord théorique.
Les add9 et m7b5 conservent toutes leurs notes constitutives.

Types ajoutés : add9, 7sus4, 7#9, m7b5, 11 et 13. Les quatre positions source de
C#11 contiennent une onzième augmentée : elles sont rejetées et C#11/Db11 reste
indisponible (filtre désactivé), sans correction ni transposition inventée. Aucune
position n’est inventée ni obtenue par déplacement automatique d’une forme.

Reproduction : télécharger `lib/guitar.json` à la révision indiquée, puis exécuter
`node scripts/import-chords.mjs chemin/guitar.json revision-git`. Les tests
`npm test` contrôlent les recherches, les données et les notes réellement jouées.
