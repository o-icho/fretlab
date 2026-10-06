# A-Frame Blues — analyse éditoriale du 6 octobre 2026

Exécution réelle avec Keyboard/Bass provenant de l'archive locale
`A-Frame Blues MIDI.zip` et `public/backing-tracks/a-frame-blues/backing.mp3`.
La commande exacte et l'installation figurent dans [le guide](../README.md).
Les SHA-256 des trois fichiers se trouvent dans [le JSON](a-frame-blues.chords.json).

| Mesure | Résultat |
| --- | ---: |
| Durée harmony MIDI | 214,126797 s |
| Durée backing audio | 247,880000 s |
| scale calculé | 1,004383157 |
| offset calculé | 186,029 ms |
| Similarité cosinus moyenne pondérée | 0,666981 |
| Fin de couverture audio | 215251 ms |
| ChordEvents | 62 |
| KeySignature invalides neutralisées dans les copies | 2 |
| Transitions contiguës contrôlées | 57 |
| Écart absolu médian au pic audio voisin | 45 ms |
| 90e percentile des écarts | 214,6 ms |
| Écart maximal | 521 ms |

Aucun accord n'est produit après 215251 ms, soit les 32,629 dernières secondes
du backing laissées sans accords. Des trous internes existent également lorsque
le MIDI n'apporte plus d'harmonie. La timeline publiée n'a pas été remplacée.

Le premier changement de fondamentale est **G7 → C à 9326 ms** (MIDI candidat
à 9,100 s, quantification à 100 ms). Le pic harmonique voisin dans l'audio est à
9,451 s, soit **+125 ms**, au lieu de l'ancienne borne de 8,295 s.
Les notes de C dans le MIDI commencent exactement à 9,146296 s.
La transformée affine corrige environ 1,125 s à la fin du MIDI.

## Qualités d'accords à vérifier

Le résultat propose notamment **G, G7, C, Cm et D**, pas uniquement G7/C7/D7.
Cette différence est conservée, pas masquée par une contrainte blues : le Keyboard
contient largement G/B/D au début, F apparaît vers 7 s, et Eb est soutenu sur C
vers 11,2–13,3 s. Le modèle propose donc Cm sur ce passage. Il ne peut pas garantir
que la transcription Suno reflète exactement l'accord entendu dans le mix.
Une confiance élevée signifie une préférence du modèle face aux autres candidats,
pas une certitude musicale ni une validation à l'écoute.

## Vingt premiers événements

Tous les temps ci-dessous sont des millisecondes **audio** ; source = `midi`.

| Accord | startMs | endMs | confidence |
| --- | ---: | ---: | ---: |
| G | 186 | 7317 | 0.5841 |
| G7 | 7317 | 9326 | 0.6829 |
| C | 9326 | 11435 | 0.6743 |
| Cm | 11435 | 13544 | 0.8479 |
| G | 13544 | 17662 | 0.6429 |
| D | 17662 | 19972 | 0.6302 |
| C | 19972 | 21881 | 0.7187 |
| G | 21881 | 23588 | 0.7768 |
| C | 23588 | 23990 | 0.7600 |
| D | 23990 | 26200 | 0.8447 |
| G | 26200 | 34536 | 0.6106 |
| C | 34536 | 38754 | 0.5785 |
| G | 38754 | 42973 | 0.6728 |
| D | 42973 | 45082 | 0.8055 |
| C | 45082 | 47091 | 0.7546 |
| G | 47091 | 49300 | 0.6367 |
| D | 49300 | 51410 | 0.8347 |
| G | 51410 | 59746 | 0.6205 |
| C | 59746 | 61755 | 0.6639 |
| Cm | 61755 | 63964 | 0.5870 |

## Contrôle temporel

Quelques transitions à confiance élevée, plus le premier changement de fondamentale :

| Transition | MIDI brut (s) | Audio calculé (s) | Pic audio voisin (s) | delta (ms) |
| --- | ---: | ---: | ---: | ---: |
| G7 → C | 9.100 | 9.326 | 9.451 | +125 |
| D → C | 111.600 | 112.275 | 112.268 | -7 |
| D → C | 136.800 | 137.586 | 137.555 | -31 |
| C → G | 138.900 | 139.695 | 139.668 | -27 |
| D → C | 162.000 | 162.896 | 162.795 | -101 |
| G → C | 176.700 | 177.661 | 177.540 | -121 |

Les quatre transitions dépassant 250 ms nécessitent une écoute ciblée :

| Transition | Audio calculé (s) | Pic audio voisin (s) | delta (ms) | confidence |
| --- | ---: | ---: | ---: | ---: |
| G → D | 49.300 | 48.994 | -306 | 0.6367 |
| C → D | 89.174 | 88.654 | -521 | 0.6444 |
| C → G | 156.568 | 156.317 | -252 | 0.7918 |
| G → D | 160.787 | 160.520 | -267 | 0.7978 |

Ce sont des pics de nouveauté chromatique, pas des annotations humaines.
Le critère de précision 200–300 ms **n'est pas garanti sur toutes les transitions**.
Ces écarts peuvent provenir de la segmentation MIDI, d'une anticipation, du pic
sélectionné ou d'une variation locale du timing ; une déformation DTW automatique
ne prouverait pas à elle seule que la borne est musicalement correcte.
Le moteur V1 conserve la transformée affine et expose les résidus sans les cacher.

## Fichiers de contrôle

- [JSON final](a-frame-blues.chords.json)
- [Timeline MIDI candidate](midi-candidate.json)
- [CSV MIDI/audio, secondes](debug.csv)
- [Toutes les transitions et leurs résidus](timing-checks.json)
- [Comparaison des chromas et mapping](alignment-debug.png)

## Validation technique

- 20 tests Python : tempo map, métadonnées invalides, notes/pédale/vélocité,
  scores, basse, Viterbi, fusion, silence, affine, couverture, non-extrapolation,
  déterminisme, arguments CLI et protection des entrées.
- Deux analyses complètes des fichiers réels : JSON final, JSON de debug et CSV
  identiques octet pour octet.
- 279 tests FretLab réussis ; lint et typecheck réussis.
- Build Web avec `SITE_URL=https://fretlab.fr` réussi ; export Android réussi.
  Aucun déploiement ni build destiné à être déployé ; pas de régénération CSP.
  Pas de synchronisation Capacitor nécessaire pour cet outil hors runtime.
- Contrôle visuel du PNG effectué.
- Validation musicale et précision perceptive : **écoute humaine requise** avant
  tout import. Aucun test physique Android nécessaire à cette analyse Python.
