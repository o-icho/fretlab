# E Dorian Guitar Solos — extraction éditoriale

- MIDI principal : Keyboard ; compléments : Strings et Synth. Aucune basse fournie.
- Durée backing : 208569 ms ; MIDI : 204599 ms.
- Couverture harmonique transformée : 204883 ms. Aucune extrapolation.
- 43 événements ; BPM dérivé de la tempo map MIDI et de l'alignement : 86.022.
- Scale : 0.999133049 ; offset : 460.977 ms ; similarité : 0.686753.
- Tonalité éditoriale : E dorien, d'après le nom fourni. Le détecteur n'est pas contraint à ce mode.
- Style Rock provisoire, à confirmer. Exemple décalé de 0 ms par défaut ; synchronisation à vérifier à l'écoute.
- MP3 renommés selon la convention, SHA-256 inchangé.

## Revue nécessaire

Cette timeline est une extraction automatique, pas une transcription musicalement certifiée.
Vérifier les accords et les transitions, notamment autour de 13,05 s, 35,33 s,
91,18 s et 195,99 s (écart au pic harmonique local supérieur à 250 ms).
Les accords reconnus comprennent E majeur et C#m7 malgré le nom « E Dorian » :
ne pas les remplacer arbitrairement par Em ; vérifier les sources à l'écoute.

- 4 boundaries (1 with confidence >=0.65) have no nearby peak or >250 ms residual; inspect timing-checks.json.

## Reproduire l'extraction

Depuis la racine du repository (PowerShell) :

```powershell
& tools/backing-track-chords/.venv/Scripts/python.exe tools/backing-track-chords/extract_chords.py `
  --harmony 'tools/backing-track-chords/input/E Dorian Guitar Solos (Keyboard).mid' `
  --additional-harmony 'tools/backing-track-chords/input/E Dorian Guitar Solos (Strings).mid' `
  --additional-harmony 'tools/backing-track-chords/input/E Dorian Guitar Solos (Synth).mid' `
  --track-id e-dorian --tracks-root public/backing-tracks
```

Le JSON existant fournit titre, style, tonalité et BPM. Pour recalculer également
le BPM, utiliser une extraction isolée et `midi_bpm` comme lors de l'import initial.
