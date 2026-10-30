# Chicken-Pickin’ Country — import éditorial

Les MP3 ont été renommés selon la convention FretLab, sans réencodage ; les
empreintes SHA-256 ont été vérifiées avant/après renommage.

`Track_e-country.json` contient les 194 accords fournis. Les débuts en secondes
sont convertis en millisecondes arrondies. Chaque accord dure jusqu'au début du
suivant ; le dernier finit à la borne de couverture. Aucun accord n'est ajouté.
Le fichier de progression original est conservé dans ce dossier.

Durée du backing mesurée avec HTMLAudioElement dans Edge : 212,753504 secondes.
La bibliothèque Python libsndfile annonce à tort 125,1485 secondes pour ce MP3.
La couverture MIDI fournie (212,781292 s) est bornée à la durée du backing
arrondie à 212754 ms. L'exemple dure 214,255854 secondes ; offset initial : 0.
La correspondance à l'écoute entre les deux exports reste à vérifier.

Le MIDI lead contient 659 événements de tempo, de 182,039387 à 213,144629 BPM.
Le champ `bpm` est leur moyenne pondérée par le temps sur la durée du backing :
203,76 BPM. Cette valeur sert à l'affichage et au filtre existants, pas à piloter
la lecture. La carte complète est conservée dans `analysis.tempoMap` ; le player
ignore `analysis` et synchronise les accords uniquement sur le temps audio.

Le MIDI comporte une métadonnée de tonalité invalide (18 dièses) : elle a été
ignorée en mémoire pour lire les tempos, sans modifier le MIDI original ni ses
notes. La tonalité éditoriale E provient du contexte du morceau et de la grille.

MANUAL TEST REQUIRED : écoute du backing, du switch Exemple et des accords,
notamment en fin de morceau, sur Web et Android physique.
