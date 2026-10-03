# transposer

`music.ts` expose les fonctions pures `transposeNote`, `transposeChord`,
`transposeText`, ainsi que les deux gammes chromatiques et la reconnaissance
stricte `isChord`. Aucun accès au DOM ou dépendance React.

`Transposer.tsx` gère l’interface et le presse-papiers côté navigateur.
`transposer.module.css` isole les styles de cet outil.

La détection transpose les lignes entièrement composées d’accords et les accords
entre crochets dans les paroles. Une phrase non balisée reste intacte. Les notes
isolées sont ambiguës : une ligne `A` est traitée comme un accord. Pour une notation
inconnue, la ligne reste intacte sauf les accords explicitement entre crochets.
Les espaces et fins de ligne sont conservés exactement ; la longueur d’un accord
peut changer sans compensation des colonnes, afin de ne pas modifier le texte.
La préférence dièses/bémols s’applique même à zéro demi-ton.

Tests : `npm test` avec Node.js >= 22.18 (exécution TypeScript native, sans dépendance
de test supplémentaire). Ils couvrent la transposition chromatique, les suffixes,
les basses, la conservation des paroles et les cas de ponctuation.
