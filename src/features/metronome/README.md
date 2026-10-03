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

`useMetronome.ts` : état, réglages, cycle de vie audio, erreurs et raccourci espace.
Les champs éditables et contrôles natifs conservent leur comportement clavier.

`Metronome.tsx` et `metronome.module.css` : interface responsive isolée.
L’indicateur suit les timestamps audio via requestAnimationFrame, avec compensation
de la latence de sortie. Le son reste indépendant des rafraîchissements de l’écran.

En 2/4, 3/4 et 4/4, le BPM compte les noires. En 6/8, il compte les noires pointées :
deux pulsations divisées en trois croches, avec six indicateurs et un clic secondaire
sur la quatrième croche. Le changement de signature recommence au premier temps ;
un changement de BPM prend effet sur les prochains clics non encore programmés.
