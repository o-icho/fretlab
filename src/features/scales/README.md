# Visualiseur de gammes

Route : `/outils/gammes/`, exportée statiquement pour le Web et Capacitor.
Les sélections et calculs fonctionnent localement, sans requête réseau.

## Domaine musical commun

- `src/domain/music/intervals.ts` : un intervalle possède un degré diatonique,
  une distance en demi-tons et un label (par exemple b3). Ces informations
  restent distinctes pour orthographier correctement une gamme.
- `scales.ts` : sept définitions par intervalles et `generateScale(root, id, notation)`.
  Le résultat contient sa définition, sa fondamentale, ses notes, pitch classes,
  orthographes et intervalles. Il peut être consommé sans React par une future
  progression, une analyse harmonique ou un service explicite de coaching.
- `pitch.ts` : les tables chromatiques et l’orthographe des notes sont réutilisées.
  En automatique, les degrés guident les lettres : F# majeur finit par E#.
  La fondamentale choisie est conservée sauf si elle exige des doubles
  altérations : D# majeur est alors présenté en Eb majeur, et ce choix est
  annoncé. Les modes dièses/bémols forcent une notation chromatique ; le
  label de l’intervalle conserve son sens même si la note est enharmonique.
- `tuning.ts` : accordages MIDI explicites, cordes du grave à l’aigu.
  Standard E, Eb Standard et Drop D partagent leur modèle avec le manche.
  L’accordeur réutilise la définition Standard E, sans liste MIDI dupliquée.
- `midi.ts` : conversions existantes extraites de l’accordeur, sans changer
  sa référence A4 = 440 Hz ni ses points d’entrée.
- `fretboard.ts` : `mapScaleToFretboard(scale, tuning, range)` associe chaque
  note à une corde, une case, un MIDI et un intervalle. Une autre gamme ou un
  autre accordage n’exige aucune branche dans le rendu.

Définitions vérifiables : majeure 0/2/4/5/7/9/11 ; mineure naturelle
0/2/3/5/7/8/10 ; pentatonique majeure 0/2/4/7/9 ; pentatonique mineure
0/3/5/7/10 ; blues mineure 0/3/5/6/7/10 ; dorien 0/2/3/5/7/9/10 ;
mixolydien 0/2/4/5/7/9/10.
Références pédagogiques : [gammes mineures](https://2012.musictheory.net/lessons/22),
[modes](https://online.berklee.edu/takenote/music-modes-major-and-minor/),
[pentatonique et blues](https://pulse.berklee.edu/?id=4&lesson=7).

## Interface et URL

`components/ScaleVisualizer.tsx` orchestre les contrôles et le rendu.
`settings.ts` valide les paramètres indépendamment de React et les sérialise
avec `URLSearchParams`. Paramètres : `root`, `scale`, `notation`, `tuning`,
`display`, `view`, `start`. Les valeurs inconnues ont des fallbacks individuels.
L’URL est la source de vérité des réglages, avec `useSearchParams` et l’API
History native supportée par Next. Il n’y a ni stockage local ni état métier
sérialisé. La boundary Suspense laisse titre, description et explication
pré-rendus ; elle permet la lecture des paramètres dans un export statique.

Exemple : `/outils/gammes/?root=A&scale=minor-pentatonic&tuning=drop-d&view=position&start=5`.
Le lien copié utilise le domaine public `https://fretlab.fr`, aussi dans l’app
Android, avec tous les réglages affichés.

`src/components/music/Fretboard.tsx` reçoit un Tuning, une zone et des marqueurs
déjà calculés. Le SVG horizontal est réutilisable, sans parsing ni règles
harmoniques. Le diagramme vertical d’accords conserve son rendu propre.
Les cordes graves sont en bas, la case 0 représente la corde à vide, les
fondamentales ont un double cercle et une description textuelle. Une section
dépliable donne les cases, notes et intervalles corde par corde.
Le défilement est limité au manche et utilisable au clavier. Le manche complet
va de 0 à 15 ; une zone contient cinq positions de frette, avec débuts
0, 3, 5, 7, 9 et 12 (la dernière va jusqu’à 16).

Les futurs presets de positions pourront fournir des zones au même renderer.
Les nouveaux accordages pourront enrichir le catalogue TUNINGS. Aucun moteur
de box pentatonique, backend ou bibliothèque musicale supplémentaire n’est créé.

## Validation

`scales.test.mjs` couvre les sept gammes, toutes les fondamentales proposées,
les transpositions, l’orthographe, les accordages et le mapping des frettes.
`settings.test.mjs` vérifie les URL, valeurs invalides et zones ciblées.
Les tests existants continuent à couvrir accords, transposition, rythme et
accordeur après extraction des conversions MIDI.

Avant publication : tests, lint, typecheck, build Web avec SITE_URL,
build Android, synchronisation Capacitor et `android:check`. Régénérer la CSP
sur le dernier export Web destiné au déploiement.
MANUAL TEST REQUIRED : démarrage de l’app hors réseau sur téléphone, navigation
vers les gammes, portrait/paysage, gestes de défilement, copie du lien depuis
la WebView, retour Android et reprise après mise en arrière-plan.

Contrôles réalisés pour cette version : 156 tests réussis, lint et typecheck,
build Web et Android, synchronisation Capacitor et `android:check` (13 routes,
115 fichiers). Chromium : réglages via URL et rechargement, copie, défilement
au clavier, interactions après coupure réseau, metadata/sitemap, cinq formats
d’écran (320, 390, 768, 844 et 1440 px) sans débordement de page ni erreur JS.
Vérification des quatre outils existants : recherche d’accord, transposition,
démarrage/arrêt du métronome, microphone simulé et libération des tracks.
Ces contrôles ne remplacent pas la recette physique Android indiquée ci-dessus.
Le dernier `out/` est le build Web avec sa CSP régénérée ; les assets Android
ont été synchronisés depuis le build Android avant le build Web final.
