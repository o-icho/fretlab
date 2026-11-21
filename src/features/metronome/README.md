# metronome

`rhythm.ts` : validation du BPM, signatures, intervalles, progression des mesures et
planification pure des prochains événements, sons par repère et mises à jour immuables.
Tests métier avec `npm test`, sans mock audio. `audio.test.mjs` complète ces tests
avec un faux AudioContext et des callbacks contrôlés, en exécutant le vrai moteur
et le scheduler partagé : silences, changements en lecture, nettoyage et signatures.

`audio.ts` : AudioContext créé lors du premier geste utilisateur, master gain,
oscillateurs courts avec enveloppe, scheduler réveillé toutes les 25 ms qui programme
100 ms à l’avance sur `AudioContext.currentTime`. Les timers ne déclenchent pas les
clics directement. Un réveil tardif saute les clics manqués plutôt que les cumuler.
Chaque oscillateur est arrêté, déconnecté et retiré après son clic. L’arrêt annule
les timers, l’animation et tous les clics en attente. Le démontage ferme le contexte.
Une génération invalide les démarrages asynchrones annulés.

La boucle de réveil et la synchronisation visuelle résident maintenant dans
`features/audio/AudioScheduler.ts`, partagé avec la boîte à rythmes. La
planification du clic, la signature et les voix du métronome restent ici.
Les limites de tempo sont réexportées depuis `domain/rhythm/tempo.ts`.

`useMetronome.ts` : état, réglages, cycle de vie audio, erreurs et raccourci espace.
Les champs éditables et contrôles natifs conservent leur comportement clavier.

`Metronome.tsx` et `metronome.module.css` : interface responsive isolée.
L’indicateur suit les timestamps audio via requestAnimationFrame, avec compensation
de la latence de sortie. Le son reste indépendant des rafraîchissements de l’écran.

En 2/4, 3/4, 4/4 et 7/4, le BPM compte les noires. En 6/8, 9/8 et 12/8, il compte
les noires pointées : respectivement deux, trois et quatre pulsations divisées en
trois croches, avec six, neuf et douze repères. En 5/8 et 7/8, le BPM compte les
croches régulières, sans imposer un groupement asymétrique. L’unité est explicite
dans `SIGNATURE_INFO` et affichée sous le BPM. Les accents restent configurables
pour marquer librement un groupement (par exemple 2+3 ou 2+2+3).

Chaque repère est un bouton clavier/tactile : accentué (jaune, >, 1400 Hz) → normal
(bleu ciel, •, 850 Hz) → silence (vide) → accentué. Le silence n’alloue aucun
oscillateur mais conserve sa place dans la mesure et dans la file visuelle. Les
couleurs sont atténuées à l’arrêt et hors du repère courant ; le repère courant
s’éclaire, y compris le contour d’un silence. Labels, symboles et numéros complètent
la couleur. Les contrôles se répartissent sur plusieurs lignes sur petit écran.

La première ouverture et chaque changement de signature donnent un premier repère
accentué et tous les autres normaux. L’ancienne case « Accentuer le premier temps »
et l’ancien clic secondaire automatique du 6/8 sont remplacés par les choix individuels.
Les réglages restent en mémoire, sont conservés après arrêt/redémarrage et après
changement de tempo/volume, sans persistance locale.

Le changement de signature recommence au premier repère ; un changement de BPM
prend effet sur les prochains clics non encore programmés. Un changement de son
remplace aussi les clics futurs déjà programmés dans les 100 ms de lookahead, sans
déplacer le curseur ni dupliquer la file visuelle. Un clic déjà commencé finit normalement.

Validation des sons et signatures : 380 tests passent (dont les tests précédents
inchangés), lint et typecheck réussis, exports Web/Android et synchronisation
Capacitor réussis. Dans le navigateur : cycle complet par clic/Entrée/Espace,
modification en lecture, suivi visuel d’une mesure entièrement silencieuse,
arrêt, nouvelles signatures et affichage à 320 px sans débordement vérifiés.
MANUAL TEST REQUIRED : contrôle auditif et synchronisation sur téléphone Android
réel, portrait/paysage, transitions arrière-plan et lancement sans réseau.

## Tap Tempo

`tapTempo.ts` est indépendant de React et du navigateur. Il reçoit des timestamps
monotones en millisecondes et conserve les huit derniers intervalles. Après au
moins quatre intervalles (cinq frappes), il calcule la médiane, écarte les écarts
supérieurs à 15 % et moyenne les intervalles retenus. L’application automatique
exige au moins quatre intervalles retenus, 75 % d’accord et une dernière frappe
cohérente. Un rythme irrégulier conserve le BPM actuel. La fenêtre glissante
permet de retrouver un nouveau tempo après plusieurs frappes régulières.

Une pause de 2,5 secondes efface la séquence, sans changer le BPM du métronome.
Le tempo mesuré n’est jamais doublé, divisé ou limité artificiellement : hors
de 40–240 BPM, il est affiché avec une indication et n’est pas appliqué.

`TapTempoControl.tsx` fournit `performance.now()`, l’affichage et le callback de BPM vers
le réglage existant. Un seul événement `click` natif gère souris, tactile et
clavier (Entrée/Espace sur le bouton), avec répétition clavier neutralisée.
Il ne crée aucun son ni AudioContext et ne démarre pas le métronome. On tape l’unité
affichée : noire pointée en 6/8, 9/8 et 12/8 ; croche en 5/8 et 7/8 ; noire en /4.
Le timer d’inactivité est annulé au démontage ; le cycle de vie partagé efface
également la séquence lors du passage en arrière-plan.

Les tests couvrent tempos réguliers, limites, 65 BPM sans conversion, valeurs
aberrantes, irrégularité, changement de tempo, pause et timestamps invalides.
MANUAL TEST REQUIRED : régularité tactile sur téléphone Android réel,
clavier virtuel, portrait/paysage, arrière-plan et fonctionnement en mode avion.

Validation Tap Tempo : 190 tests passent, lint et typecheck réussis ; exports
Web/Android et synchronisation Capacitor réussis (14 routes, 122 fichiers).
La CSP Report-Only a été régénérée sur le build Web final. Dans Edge, les
gestes souris/tactiles/clavier, le reset, les valeurs hors plage, le mode hors
ligne après chargement et quatre tailles de viewport (320 à 1440 px) ont été
vérifiés. Les tests d’intégration injectent uniquement l’horloge des frappes
pour obtenir des intervalles exacts ; l’interface et le transport Web Audio
réel sont exercés. Aucun AudioContext n’est créé par le Tap à l’arrêt.
