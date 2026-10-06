# G Major Shuffle — extraction initiale

- id : g-shuffles
- titre : G Major Shuffle
- style éditorial retenu : blues (shuffle)
- tonalité éditoriale : G, d'après le nom fourni
- tempo estimé MIDI/alignement : 151.476 BPM
- durée backing : 250149 ms
- couverture harmonique : 249215 ms
- événements : 56
- scale MIDI vers backing : 0.997741449
- offset MIDI vers backing : 1092.717 ms
- similarité chroma moyenne : 0.643500 (pas une probabilité de justesse)

Sources : G Major Shuffle (Keyboard).mid et G Major Shuffle (Bass).mid.
MP3 renommés selon la convention g-shuffles, octets vérifiés inchangés.
Les MIDI restent dans tools/backing-track-chords/input/, ignoré par Git.
Aucune correction harmonique manuelle ni extrapolation n'a été appliquée.

## Reproduction depuis la racine du dépôt

    tools/backing-track-chords/.venv/Scripts/python.exe tools/backing-track-chords/extract_chords.py --harmony "tools/backing-track-chords/input/G Major Shuffle (Keyboard).mid" --bass "tools/backing-track-chords/input/G Major Shuffle (Bass).mid" --track-id g-shuffles --tracks-root public/backing-tracks --title "G Major Shuffle" --style blues --key G

## Validation musicale restante

Extraction initiale à relire à l'écoute : similarité inférieure au seuil 0.65,
12 transitions sans pic proche ou présentant un résidu supérieur à 250 ms.
Deux de ces transitions ont une confiance heuristique >=0.65.
Consulter timing-checks.json et alignment-debug.png. Les accords et leur timing
ne sont pas certifiés par les tests techniques du player.

L'offset ci-dessus aligne le MIDI au backing ; ce n'est PAS exampleOffsetMs.
Le passage backing/exemple utilise le défaut 0 : l'alignement musical des deux
exports reste à vérifier à l'écoute, en particulier sur téléphone Android.
