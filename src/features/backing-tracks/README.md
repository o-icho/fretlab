# Backing tracks : contenu publié et player commun

## Source de vérité

Chaque morceau publié est un sous-dossier direct de public/backing-tracks/ :

    public/backing-tracks/
      a-frame-blues/
        Backingtrack_a-frame-blues.mp3
        Example_a-frame-blues.mp3
        Track_a-frame-blues.json
        _analysis/
      catalog.generated.json

Les MP3 et Track JSON sont versionnés. Le catalogue généré est ignoré par Git :
dev, build Web et build Android le régénèrent automatiquement, y compris sur
Vercel. Aucun import TypeScript statique du fichier généré n'est nécessaire.
L'ancien src/data/backing-tracks/catalog.json et l'ancien détail sous
public/content/backing-tracks/ sont supprimés. Les référentiels styles, tonalités
et tempos restent inchangés.

## Conventions et scan

scripts/generate-backing-tracks-catalog.mjs applique les regex partagées dans
src/features/backing-tracks/content.ts :

- TRACK_ID : ^[a-z0-9][a-z0-9_-]*$
- BACKING : ^Backingtrack_([a-z0-9][a-z0-9_-]*)\.mp3$
- EXAMPLE : ^Example_([a-z0-9][a-z0-9_-]*)\.mp3$
- TRACK JSON : ^Track_([a-z0-9][a-z0-9_-]*)\.json$

La casse est significative. Les trois captures et l'id JSON doivent correspondre
au dossier. Chaque catégorie doit avoir exactement un fichier, non vide.
Un dossier invalide, un fichier requis absent, un doublon, un mismatch ou des
métadonnées/timeline invalides bloque le démarrage/build avec le dossier en erreur.
Le nom ajouter est réservé à la route éditoriale existante.

Les fichiers racine, dossiers commençant par _, sous-dossiers et fichiers sans
convention reconnue sont ignorés. Cela ne les rend PAS privés : tout fichier
dans public/, y compris _analysis, peut être distribué. Garder les documents
confidentiels hors de public/.

Le scan est déterministe (ordre des ids), sans parsing MIDI/audio, et écrit
atomiquement le catalogue seulement s'il a changé. Le navigateur ne liste
jamais un dossier HTTP. Node/fs reste limité au tooling et au rendu serveur build.

## Données

Exemple de Track_mon-morceau.json :

    {
      "schemaVersion": 1,
      "id": "mon-morceau",
      "title": "Mon morceau",
      "style": "blues",
      "key": "G",
      "bpm": 115,
      "durationMs": 247880,
      "exampleOffsetMs": 0,
      "chordCoverageEndMs": 214127,
      "chordTimeline": [],
      "analysis": {}
    }

Ne pas renseigner audio, backingUrl ou exampleUrl dans ce JSON. Les deux MP3
sont requis pour le contenu publié V1. exampleOffsetMs est facultatif (0 par
défaut) et indépendant d'analysis.offsetMs. analysis n'est ni affiché ni transmis
au player. schemaVersion 1 est facultatif pour les anciens exports éditoriaux.

Le catalogue est un tableau de résumés : id, slug (égal à id, compatible avec
les modèles existants), title, style éventuel, key, bpm, durationMs, folder,
backingUrl, exampleUrl, detailUrl. Il ne contient ni timeline ni analysis.
PublishedTrackSummary enrichit BackingTrackSummary sans modifier le modèle
runtime BackingTrack utilisé par le player et les imports locaux.

decodeContentTrack adapte le JSON éditorial vers BackingTrack, en réutilisant
la validation musicale commune. Les temps et événements ne sont jamais étendus.
La durée du backing fait autorité. La couverture est facultative et stricte ;
les trous sont autorisés. La zone accords garde sa hauteur mais reste vide
en l'absence d'accord actif. source/confidence sont des annotations éditoriales.

## Ajouter un morceau

1. Créer public/backing-tracks/my-track/.
2. Ajouter Backingtrack_my-track.mp3 et Example_my-track.mp3.
3. Déposer Track_my-track.json produit par l'analyse externe et validé humainement.
4. Exécuter pnpm run dev ou pnpm run build (npm run fonctionne également).

Aucune modification React/TypeScript. Redémarrer dev après ajout/suppression
d'un dossier : le scan automatique se fait au lancement, pas en surveillance
continue. Commande explicite disponible : pnpm run generate:backing-tracks.

## Web et Android

La bibliothèque pré-rendue reçoit les résumés du catalogue généré ; ses filtres,
sa pagination et le bouton Écouter existants sont conservés. Le titre d'un morceau
publié mène aussi à /backing-tracks/<id>/, pré-généré avec generateStaticParams,
metadata et sitemap. Le détail JSON est chargé à l'ouverture, validé contre
son résumé, puis adapté pour le player existant.

Le build Android appelle le même scanner avant Next. Les MP3, JSON et catalogue
sont exportés dans out puis copiés par cap sync : utilisables hors connexion
sur Android. Aucun backend. L'ajout de contenu nécessite un nouveau build/déploiement
Web ou une nouvelle version de l'application Android.

La seule horloge du player reste audio.currentTime, ramenée au temps du backing
avec exampleOffsetMs. Play/Pause, seek, volume, switch Exemple, nettoyage audio
et pause en arrière-plan sont inchangés. Pas d'analyse runtime.

Les imports utilisateur existants restent dans LocalTrackRepository, schema 1,
sans modifier leur format complet ni le flag NEXT_PUBLIC_BACKING_TRACK_ADMIN_ENABLED.
Ils ne constituent pas un second catalogue publié. L'administration reste désactivée
par défaut, et ce flag n'est pas une authentification.

## Validation

Tests scanner sur dossiers temporaires, regex, erreurs, extras, catalogue sans
timeline, validation musicale, chargement du détail et filtrage. Les tests
transport/synchronisation existants restent applicables.

    pnpm test
    pnpm run lint
    pnpm run typecheck
    pnpm run build:android
    pnpm run android:sync
    pnpm run android:check

Build Web : définir SITE_URL=https://fretlab.fr puis pnpm run build:secure
pour régénérer la CSP Report-Only sur le bon export.

MANUAL TEST REQUIRED : Android physique, lancement en mode avion, lecture,
seek, switch Exemple, arrière-plan et retour. Le Web sans service worker ne
garantit pas un premier chargement hors ligne.
