# Crazy Solo — Pop en La mineur

- Sources : Crazy Solo (Keyboard), (Synth), (Strings). Keyboard fixe la couverture ; les autres pistes complètent l'harmonie.
- Style Pop, tonalité Am selon les fichiers fournis ; titre issu des noms MIDI.
- Durée audio : 210954 ms ; couverture harmonique : 207989 ms.
- Tempo estimé : 84.989 BPM ; 71 événements.
- Alignement : scale 0.999967694, offset 359.334 ms, similarité 0.663097.
- MP3 renommés selon la convention avec SHA-256 conservé ; aucune ré-encodage.
- Aucun accord extrapolé après la couverture MIDI transformée.
- Example/Backing : offset par défaut 0 ms, à confirmer à l'écoute.

## Revue musicale

La timeline reste une proposition automatique. Vérifier à l'écoute les accords et transitions signalées dans timing-checks.json.

- 6 boundaries (0 with confidence >=0.65) have no nearby peak or >250 ms residual; inspect timing-checks.json.

## Reproduire (PowerShell depuis la racine)

```powershell
& tools/backing-track-chords/.venv/Scripts/python.exe tools/backing-track-chords/extract_chords.py `
 --harmony 'tools/backing-track-chords/input/Crazy Solo (Keyboard).mid' `
 --additional-harmony 'tools/backing-track-chords/input/Crazy Solo (Synth).mid' `
 --additional-harmony 'tools/backing-track-chords/input/Crazy Solo (Strings).mid' `
 --track-id a-minor-pop --tracks-root public/backing-tracks
```

Ne pas relancer cette extraction après des corrections manuelles de timeline sans les sauvegarder.
