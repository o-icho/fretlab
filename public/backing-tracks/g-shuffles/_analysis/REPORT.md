# G Major Shuffle — réextraction avec Guitar

Sources : Keyboard (principal), Guitar (complément harmonique), Bass (basse).
Les sources partagent le même arrangement ; chaque tempo map est décodée en secondes.
La couverture reste définie par le MIDI principal, jamais prolongée par Guitar.
Les MP3 et MIDI source sont inchangés.

Commande depuis la racine :
    tools/backing-track-chords/.venv/Scripts/python.exe tools/backing-track-chords/extract_chords.py --harmony "tools/backing-track-chords/input/G Major Shuffle (Keyboard).mid" --additional-harmony "tools/backing-track-chords/input/G Major Shuffle (Guitar).mid" --bass "tools/backing-track-chords/input/G Major Shuffle (Bass).mid" --track-id g-shuffles --tracks-root public/backing-tracks

## Comparaison
Ancienne timeline conservée localement dans tools/backing-track-chords/input/g-shuffles-before-guitar/Track_g-shuffles.json (ignoré par Git).
Avant : {'events': 56, 'covered17to34ms': 181, 'durationsMs': {'Ab': 300, 'Am': 598, 'Am7': 17959, 'Bbm': 200, 'Bm': 499, 'Bm7': 1896, 'C': 24247, 'D': 9079, 'Db': 1397, 'Dm': 499, 'Em7': 39511, 'G': 53379, 'Gm': 7283}}
Après : {'events': 75, 'covered17to34ms': 17000, 'durationsMs': {'Am': 2208, 'Am7': 27696, 'Bm': 1907, 'Bm7': 1606, 'C': 33619, 'D': 12646, 'Dm': 2008, 'Em': 7727, 'Em7': 54592, 'F': 200, 'G': 57987, 'Gm': 47368}}
Couverture finale : 250014 ms ; durée audio : 250149 ms.
Similarité chroma : 0.643500 → 0.651628.
Le tempo éditorial existant est conservé.

## Limites musicales
Le trou 17–34 s est rempli par des événements calculés depuis les notes Guitar.
Cela ne certifie pas leurs accords : des Em/Em7 et Gm persistent malgré la tonalité
éditoriale G. Aucun remplacement automatique par G, aucune harmonisation imposée.
12 transitions restent signalées. Vérifier à l'écoute avant de considérer la grille
comme validée. L'offset MIDI/audio n'est pas exampleOffsetMs.
MANUAL TEST REQUIRED : validation musicale et téléphone Android physique.
