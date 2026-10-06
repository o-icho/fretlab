# Génération éditoriale des accords de backing tracks

Outil local, **hors runtime FretLab**. Aucun appel cloud, aucun modèle ML,
aucun changement du player, des MP3 ou du catalogue publié. L'audio sert à
aligner le MIDI, jamais à inventer des accords après sa fin. La sortie est
une proposition à écouter et à corriger avant import éditorial.

## Installation

Python 3.12 et Node >=22.18 (pour lire le domaine TypeScript partagé).
Depuis la racine du dépôt, PowerShell :

```powershell
python -m venv tools/backing-track-chords/.venv
& tools/backing-track-chords/.venv/Scripts/python.exe -m pip install -r tools/backing-track-chords/requirements.txt
```

Sous Linux/macOS : remplacer `.venv/Scripts/python.exe` par `.venv/bin/python`.
L'installation initiale télécharge les dépendances ; ensuite l'analyse fonctionne
sans réseau. Pour une installation sans réseau, préparer les wheels avec
`pip download -r requirements.txt -d wheels`, puis installer avec
`pip install --no-index --find-links wheels -r requirements.txt` sur la même
plateforme/version Python. `requirements-lock.txt` consigne l'environnement
complet validé (y compris les dépendances transitives de librosa).

## Workflow officiel : répertoire partagé

La racine est configurable avec `--tracks-root`, sans base de données, API ou
upload. Le scanner ne parcourt que le dossier demandé, pas ses sous-dossiers.

1. Créer `<tracks-root>/<id>/` (par exemple `public/backing-tracks/a-frame-blues/`).
2. Y placer exactement `Backingtrack_<id>.mp3` et `Example_<id>.mp3`.
   Les deux fichiers sont obligatoires en V1. L'Example n'est jamais analysé.
3. Lancer l'analyse avec `--track-id`, `--tracks-root`, `--harmony`, éventuellement
   `--bass`, et les métadonnées éditoriales ci-dessous.
4. Le script écrit directement `Track_<id>.json` et les diagnostics dans `_analysis/`.
5. Ce dossier est prêt pour la découverte automatique par FretLab prévue par le
   contrat partagé. **Le code FretLab actuel utilise encore `catalog.json` et les
   détails dans `public/content/backing-tracks/` : la découverte automatique n'est
   pas implémentée par cette modification de l'outil.** Aucun catalogue ni code
   applicatif n'est modifié. Une migration des noms d'assets peut donc rendre les
   anciennes références du catalogue inopérantes jusqu'à cette intégration.

Conventions exactes, sensibles à la casse, appliquées avec `fullmatch` :

```text
id       ^[a-z0-9][a-z0-9_-]*$
backing  ^Backingtrack_([a-z0-9][a-z0-9_-]*)\.mp3$
example  ^Example_([a-z0-9][a-z0-9_-]*)\.mp3$
JSON     ^Track_([a-z0-9][a-z0-9_-]*)\.json$
```

Le groupe capturé doit égaler le dossier et l'id demandé. Aucun identifiant n'est
normalisé. Dossier absent, fichier requis absent, fichiers reconnus concurrents ou
identifiants discordants : erreur avant l'analyse. Les fichiers inconnus (MIDI,
images, documents, etc.) et les sous-dossiers, dont `_analysis`, sont ignorés.
Les noms qui ne correspondent à aucune regex ne sont pas interprétés.

## Commande A-Frame Blues

Les deux MIDI ont été extraits de `C:\Users\ichoo\Downloads\A-Frame Blues MIDI.zip`
vers `tools/backing-track-chords/input/` (non versionné). Ils ne sont pas modifiés.
Depuis `C:\Users\ichoo\app-guitare` :

```powershell
& tools/backing-track-chords/.venv/Scripts/python.exe tools/backing-track-chords/extract_chords.py `
  --harmony "tools/backing-track-chords/input/A-Frame Blues (Keyboard).mid" `
  --bass "tools/backing-track-chords/input/A-Frame Blues (Bass).mid" `
  --track-id a-frame-blues `
  --tracks-root "C:\Users\ichoo\app-guitare\public\backing-tracks" `
  --title "A-Frame Blues" --style blues --key G --bpm 115
```

Cette commande suppose le dossier `a-frame-blues` et les deux fichiers portant
exactement ce même identifiant. L'id est indépendant du titre éditorial.
Omettre `--bass` si absent. `--help` affiche les paramètres. En mode partagé,
`--audio`, `--output` et `--debug-dir` sont refusés : leurs chemins sont déterminés
par la convention, sous le dossier du morceau.

Pour un nouveau JSON, `--title`, `--style` et `--key` sont requis. La tonalité
affichée est éditoriale : elle ne contraint pas les accords détectés.
`--bpm` est facultatif : faute de BPM existant ou d'override, l'outil prend la
médiane des tempos MIDI pondérée par leur durée réelle, divisée par le scale
audio. C'est un nouveau repli de métadonnées (l'ancien outil n'estimait pas de
BPM éditorial), pas une quantification de la timeline. Le tempo implicite MIDI
de 120 BPM s'applique si aucun événement tempo n'est présent.

Un `Track_<id>.json` existant est chargé et validé **avant analyse** : syntaxe JSON,
clés uniques, nombres finis, schemaVersion 1, id, métadonnées, timeline ordonnée,
couverture et alignement cohérents. Un fichier invalide arrête l'opération même
si les overrides CLI auraient pu le réparer. Les champs éditoriaux et les champs
supplémentaires sont préservés. Seuls `durationMs`, `chordCoverageEndMs`,
`chordTimeline` et `analysis` sont recalculés ; les options CLI éditoriales
explicites remplacent les valeurs correspondantes.

Le JSON final comporte `schemaVersion: 1`, `id`, `title`, `style`, `key`, `bpm`,
`durationMs`, `chordCoverageEndMs`, `chordTimeline` et `analysis`. Les paramètres
`scale`, `offsetMs`, `meanSimilarity`, `midiDurationMs`, `audioDurationMs` sont
directement dans `analysis`, avec les diagnostics et empreintes des entrées.
L'écriture utilise un temporaire dans le même dossier, validation et relecture,
flush/fsync puis remplacement atomique. Un échec préserve l'ancien fichier et
nettoie le temporaire. Une modification éditoriale détectée pendant l'analyse
arrête le remplacement. Les diagnostics sont produits avant de remplacer le JSON.

L'ancien mode explicite `--audio ... --output ...` reste disponible pour les
analyses isolées : sorties hors `src/public`, sans métadonnées de Track, debug à
côté du JSON ou dans `--debug-dir`. Il ne se mélange pas au mode partagé.

## Méthode et contrats

- SMF type 0/1 PPQ. Les types 2 et SMPTE sont explicitement refusés. Parcours
  structurel des événements pour neutraliser seulement les KeySignature invalides
  en métadonnées opaques de même longueur. Copie temporaire uniquement si nécessaire.
  Aucune signature de tonalité, même valide, n'influence les accords.
- Conversion tick/seconde avec tous les événements de tempo de toutes les pistes,
  défaut MIDI de 500000 µs/noire. Notes superposées, note-on de vélocité zéro et
  pédale sustain sont pris en compte ; canal percussion exclu.
- Fenêtres de 100 ms par défaut (`--step`, entre 25 et 250 ms). Poids des notes :
  chevauchement × vélocité. Scores pour fondamentale, tierce, quinte, septième,
  absence de notes et notes étrangères. Basse normalisée séparément, poids borné
  par `--bass-weight` (0,65 par défaut), sans veto sur les notes de passage.
- Le vocabulaire vient directement de `src/domain/music` via
  `export-vocabulary.mjs`. Pas de table de notes, de grammaire ou de liste G7/C7/D7
  recopiée en Python. Défaut : major/minor/7/m7 dans les 12 fondamentales.
  Exemple d'extension : `--qualities major minor 7 m7 maj7 sus2 sus4 dim`.
  Orthographe canonique en bémols, sans estimation de tonalité.
- Viterbi avec émissions intégrées dans le temps et pénalité par changement
  (`--change-penalty 0.65`). Pas de grille de mesures ni de durée minimale dure.
  Fusion des états adjacents identiques uniquement. État de silence distinct ;
  des trous peuvent rester dans la timeline. Le lissage peut franchir de petites
  coupures entre articulations d'un même accord.
- `confidence` est une marge heuristique de score, **pas une probabilité calibrée**.
  Les notes MIDI transcrites restent susceptibles d'être erronées ; une tierce
  mineure persistante ne doit pas être arbitrairement remplacée par une septième
  dominante sous prétexte que le morceau est un blues.
- Audio mono 22050 Hz, HPSS harmonique (margin=3), chroma CQT à pas 512 échantillons
  (~23 ms). Chroma MIDI harmony + basse pondérée pour la seule synchronisation.
  Optimisation globale affine déterministe, puis affinement numérique local ;
  similarité cosinus pondérée davantage aux transitions. `meanSimilarity`
  correspond à cette moyenne pondérée, pas à une précision temporelle garantie.
- Domaine de recherche par défaut : scale [0,95 ; 1,05], offset [-5 ; 5] secondes.
  Ajustable via `--scale-bounds MIN MAX` et `--offset-bounds MIN MAX` pour les
  morceaux avec long pré-roll ou dérive inhabituelle. Un optimum en bordure est
  signalé. Les passages répétitifs peuvent donner des ambiguïtés de synchronisation.
- Tous les événements finaux sont en temps **audio**, millisecondes entières :
  `round((scale * midiSeconds + offset) * 1000)`. Départs négatifs coupés à zéro,
  événements bornés par la fin MIDI transformée et par la durée audio.
- La durée de référence est la fin du fichier harmony MIDI, événements de fin
  de piste compris. La basse ne prolonge jamais cette couverture. Une différence
  de durée harmony/bass >250 ms est signalée.
- `chordCoverageEndMs = transform(harmonyMidiDuration)` (et non la durée MIDI brute).
  Le dernier accord n'est jamais étendu pour remplir le backing. Si le MIDI dépasse
  l'audio, couverture transformée conservée et signalée, événements coupés à la
  durée audio. Aucun accord produit au-delà des notes/segments disponibles.
- V1 affine uniquement. Les résidus sont exposés pour décider si un futur
  raffinement DTW est nécessaire ; aucun déplacement silencieux des bornes vers
  un pic audio, ni extrapolation de la structure musicale.

## Sorties et validation humaine

En mode officiel : `Track_<id>.json` au niveau du morceau ; les autres fichiers
ci-dessous sont dans `_analysis/`. Le JSON `a-frame-blues.chords.json` décrit
l'ancien format d'analyse isolée et reste conservé comme référence historique.

- `a-frame-blues.chords.json` : alignement, couverture, `chords` en temps audio,
  paramètres, avertissements et SHA-256 des entrées. Ce n'est pas un détail
  BackingTrack directement importable : après validation, `chords` correspond
  au contenu à reporter dans `chordTimeline`.
- `midi-candidate.json` : segments avant transformation.
- `debug.csv` : midiStart/midiEnd/audioStart/audioEnd **en secondes**, accord,
  confiance. Le JSON final reste en millisecondes.
- `alignment-debug.png` : chroma MIDI transformé et chroma audio sur le même axe,
  lignes de changement, fin de couverture et correction affine. `--no-plot`
  permet de désactiver ce rendu.
- `timing-checks.json` : pour chaque transition contiguë, temps MIDI brut,
  temps audio transformé, pic harmonique audio local le plus proche (±800 ms),
  écart signé en ms, force du pic et confiance. Pic absent = `null`.
  Ces pics de nouveauté harmonique sont des **indices automatiques**, pas une
  vérité terrain : fills, anticipations et voicings peuvent créer d'autres pics.
  Écouter les transitions, notamment celles dépassant 250 ms ; le programme
  les imprime explicitement, même si leur confiance est faible.

Le relevé historique est conservé dans `output/REPORT.md`. Il ne force ni les chiffres
préliminaires d'alignement, ni un changement à 9,5 s, ni un vocabulaire blues.

## Tests

```powershell
& tools/backing-track-chords/.venv/Scripts/python.exe -m unittest discover -s tools/backing-track-chords -p "test_*.py" -v
```

Tests synthétiques sans accès réseau : tempo map multitrack, key signatures
invalides et préservation des sources, chevauchement/vélocité, tous les accords
du vocabulaire, basse et walking bass, lissage/fills/accord court, fusion/silence,
transformée affine, couverture, non-extrapolation, récupération d'un alignement
connu et déterminisme, détection d'absence de pic et protection des entrées.
Les assets réels ne sont pas nécessaires aux tests unitaires.

`test_track_files.py` couvre également les regex, la résolution stricte des
dossiers, les fichiers manquants ou concurrents, l'ignorance des fichiers inconnus,
les overrides et métadonnées conservées, le remplacement de timeline, la couverture,
le repli BPM et l'écriture atomique (dont un échec simulé). Un test d'orchestration
vérifie la production directe du JSON et des diagnostics sans modification audio.

Les dépendances Python restent dans `.venv/` ignoré par Git et ESLint ; aucun
package n'est ajouté au bundle Next.js ou Android. Les builds d'intégration ne
remplacent pas l'écoute humaine du résultat éditorial.
