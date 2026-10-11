# Guitar Solo in Am — extraction éditoriale

Keyboard est la source principale, Synth est combiné comme source harmonique.
Aucune piste de basse distincte fournie. Aucun MIDI modifié ; les MP3 sont
renommés selon la convention du catalogue avec vérification SHA-256.

- Style : Funk ; tonalité Am, selon l'indication utilisateur.
- Tempo estimé par tempo map MIDI / alignement : 127.369 BPM.
- Durée backing : 215689 ms.
- Couverture harmonique : 212548 ms ; aucune extrapolation.
- 96 événements d'accords.
- Scale : 0.998458643 ; offset : 67.538 ms.
- Similarité chromatique moyenne : 0.614851.

## Validation humaine nécessaire

La similarité est inférieure au seuil de revue 0,65 de l'outil. Dix transitions
présentent un écart supérieur à 250 ms ou aucun pic harmonique proche.
La timeline est une proposition automatique : écouter les accords et leur
placement avant de la considérer comme définitive. Consulter timing-checks.json,
debug.csv et alignment-debug.png. Aucun ajustement arbitraire n'a été ajouté.
Le décalage Example/Backing reste à 0 par défaut, à vérifier à l'écoute.

## Reproduire

Depuis la racine (PowerShell) :

```powershell
& tools/backing-track-chords/.venv/Scripts/python.exe tools/backing-track-chords/extract_chords.py `
  --harmony 'tools/backing-track-chords/input/Guitar Solo in Am (Keyboard).mid' `
  --additional-harmony 'tools/backing-track-chords/input/Guitar Solo in Am (Synth).mid' `
  --track-id a-minor-funk --tracks-root public/backing-tracks
```

Une nouvelle extraction remplace les corrections manuelles de timeline.
