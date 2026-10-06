# Slow Blues in C — extraction initiale

Titre : Slow Blues in C ; style : blues ; tonalité éditoriale : C.
Tempo MIDI/alignement : 167.075 BPM (à confirmer à l'écoute ; aucune division
arbitraire par deux malgré le titre « Slow »).
Durée backing : 266211 ms ; couverture publiée : 266211 ms ; 42 événements.

## Choix des sources
Keyboard : 716 notes, registre MIDI 36–79, source harmonique retenue.
Synth : 416 notes, polyphonique ; pas une basse dédiée.
Woodwinds : 69 notes, monophonique aiguë (57–81) ; non utilisé pour déterminer
les accords d'accompagnement. Les trois fichiers source restent intacts dans
tools/backing-track-chords/input/ (ignoré par Git).
Les MP3 ont uniquement été renommés, avec vérification des empreintes.

## Reproduction
    tools/backing-track-chords/.venv/Scripts/python.exe tools/backing-track-chords/extract_chords.py --harmony "tools/backing-track-chords/input/Slow Blues in C (Keyboard).mid" --track-id c-slow-blues --tracks-root public/backing-tracks --title "Slow Blues in C" --style blues --key C

## Couverture et points à écouter
Fin MIDI transformée : 266694 ms (conservée dans analysis.transformedMidiCoverageEndMs).
La couverture publique est bornée à l'audio, 266211 ms. Les événements étaient
déjà bornés à l'audio par l'analyse ; aucun accord n'a été prolongé ou inventé.
Le correctif de l'exporteur rend ce bornage reproductible lors des prochaines analyses.

Similarité chroma : 0.670341 ; scale : 1.007347304 ; offset MIDI/audio : 970.872 ms.
Sept transitions sont signalées dans timing-checks.json, dont les premières
à environ 10.44 s, 19.00 s et 27.46 s. Vérifier les accords et le placement à l'écoute.
Ce rapport ne constitue pas une validation musicale humaine.

L'offset MIDI/audio n'est pas exampleOffsetMs. Le player utilise le défaut 0
entre les deux versions audio ; leur alignement musical reste à vérifier.
MANUAL TEST REQUIRED : écoute et test Android physique.
