# metronome

`rhythm.ts` : validation du BPM, signatures, intervalles, progression des mesures et
planification pure des prochains événements. Tests avec `npm test`, sans mock audio.

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

En 2/4, 3/4 et 4/4, le BPM compte les noires. En 6/8, il compte les noires pointées :
deux pulsations divisées en trois croches, avec six indicateurs et un clic secondaire
sur la quatrième croche. Le changement de signature recommence au premier temps ;
un changement de BPM prend effet sur les prochains clics non encore programmés.

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
Il ne crée aucun son ni AudioContext et ne démarre pas le métronome. En 6/8,
on tape la noire pointée, conformément à l’unité déjà affichée.
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
