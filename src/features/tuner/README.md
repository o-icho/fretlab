# tuner

Accordeur monophonique local, sans transmission, enregistrement ou persistance audio.

- `audio/pitch.ts` : YIN indépendant du navigateur, fonction de différence normalisée,
  recherche du minimum de chaque creux, interpolation parabolique et léger lissage
  de la courbe des différences sous 400 Hz. Analyse 25–1600 Hz, avec marge sous le
  Si grave B0 (30,87 Hz). Le signal est moyenné pour réduire le taux d’échantillonnage
  à environ 24 kHz (facteur arrondi). Le seuil YIN vaut 0,12 à l’acquisition et 0,28
  en suivi. Le premier creux dont le résidu interpolé est inférieur ou égal à
  `1,5 × meilleur résidu + 0,005` est choisi : une harmonique dominante ne gagne pas
  sur un fondamental nettement plus périodique. Le premier creux comparable est
  préféré aux multiples de période. L’ancienne fréquence n’influence plus ce choix,
  pour éviter de bloquer une vraie montée d’octave ; le stabilisateur assure le suivi.
- `audio/tracking.ts` : RMS acquisition 0,003, release 0,0008 ; confiance acquisition
  0,88, suivi 0,72. Médiane de cinq fréquences validées, trois confirmations pour une
  nouvelle note, quatre pour une octave/quinte. Continuité à ±80 cents ; candidats à
  ±60 cents avec au maximum 200 ms entre frames. Hold 450 ms depuis la dernière
  mesure réellement acceptée, sans prolongation par les frames rejetées. Une corde
  réellement différente peut remplacer la précédente en environ 180–240 ms.
- `audio/constraints.ts` : désactivation d’echoCancellation, noiseSuppression et
  autoGainControl seulement si annoncés par getSupportedConstraints. Contraintes
  optionnelles, sans demande `exact`, pour garder la compatibilité navigateur.
- `audio/MicrophoneTuner.ts` : capture après clic avec ces contraintes, AudioContext,
  MediaStreamAudioSourceNode et AnalyserNode (taille adaptée au sample rate par
  `pitchBufferSize` : au moins quatre périodes à 25 Hz, 8192 samples à 44,1/48 kHz,
  16384 à 96 kHz ; bornes Web Audio 4096–32768). Aucune sortie vers les
  haut-parleurs. Analyse toutes les 60 ms par requestAnimationFrame. Buffer temporaire
  en mémoire seulement, remis à zéro/libéré à l’arrêt. Tracks stoppées, nœuds déconnectés,
  animation annulée et AudioContext fermé. Les permissions tardives après arrêt ou
  démontage sont invalidées et leurs tracks sont immédiatement stoppées.
- `audio/useTuner.ts` : état, erreurs de permission, activation et nettoyage React.
- `music/notes.ts` : conversion fréquence/MIDI, note/octave, cents et références
  guitare E2 A2 D3 G3 B3 E4, basse 4 cordes E1 A1 D2 G2 et basse 5 cordes B0 E1 A1 D2 G2,
  La4 = 440 Hz. Les accordages proviennent de `domain/music/tuning.ts` ; le catalogue
  de presets des gammes reste réservé à la guitare.
- `components/Tuner.tsx` : modes chromatique, guitare et basse 4/5 cordes (cible automatique ou corde
  sélectionnée), jauge limitée visuellement à ±50 cents, écart réel affiché et état
  textuel juste/trop bas/trop haut. La note détectée reste indépendante de la cible.

Tests `npm test` : conversions, cents, MIDI, buffers sinusoïdaux à 44,1/48/96 kHz,
harmoniques, silence, bruit déterministe, offset DC et stabilisation. Les tests de
tracking couvrent chaque corde standard à 44,1/48 kHz avec 3,6 secondes de décroissance
et bruit : ils exigent des détections brutes réellement acceptées sous l’ancien seuil
0,008, puis l’effacement au silence. Les tests existants sont conservés ; les anciennes
assertions de release/changement d’octave suivent désormais le hold temporel.

## Diagnostic sustain

Le précédent seuil fixe 0,008 arrêtait YIN avant même d’estimer le pitch du signal
faible. Un E2 synthétique d’amplitude initiale 0,025, décroissant exponentiellement
avec constante 1,2 s, était perdu vers 1,1 s. Son RMS à 2 s est pourtant encore
0,00353 et à 3 s 0,00153. Les trois frames invalides suivantes effaçaient l’affichage
en environ 180–200 ms. La confiance unique 0,88 ne permettait pas de suivre un signal
plus bruité ; un candidat >60 cents effaçait immédiatement l’ancienne note.

Lors de la correction initiale du sustain, 4096 échantillons avaient été conservés : environ 7 périodes E2 à 48 kHz (85 ms), dont environ
3,5 périodes dans la fenêtre YIN. Sur ce même cas synthétique, 8192 n’améliorait pas
la coupure par RMS et doublait la durée du buffer (171 ms). Aucune modification de
requestAnimationFrame, de l’intervalle de 60 ms ni du smoothingTimeConstant=0 : le
lissage fréquentiel de l’AnalyserNode ne stabilise pas son buffer temporel.
La prise en charge des basses exige désormais une fenêtre plus longue : environ
171–186 ms aux fréquences usuelles, avant les confirmations temporelles. Le buffer
fixe de 4096 samples ne contenait pas assez de périodes du Si grave, surtout à 96 kHz.

En développement uniquement, ouvrir `/outils/accordeur?tunerDebug=1`, puis activer le
microphone. `console.debug` affiche au maximum quatre diagnostics par seconde : RMS,
pitch brut, pitch retenu, confiance, note, âge du dernier pitch accepté et motif
de rejet. Les réglages microphone demandés/effectifs sont également affichés.
Sans ce paramètre, ou en production, aucun log de diagnostic n’est émis. Les buffers
audio ne sont jamais journalisés, transmis ou persistés.

Essai sur guitare physique : jouer E2 puis A2 et laisser résonner, essayer E4,
répéter doucement puis fortement et arrêter le son. Vérifier que l’âge du dernier
pitch reste proche de zéro pendant le sustain (véritable suivi) et que l’affichage
s’efface après le passage sous le seuil, au plus tard après le hold de 450 ms.

Référence algorithme : de Cheveigné et Kawahara, _YIN, a fundamental frequency
estimator for speech and music_, JASA 111 (2002), DOI 10.1121/1.1458024.
https://iro.umontreal.ca/~pift6080/H09/documents/papers/yin_pitch_tracker.pdf

Sur un appareil réel, jouer une seule corde près du microphone ; les accords,
le bruit ambiant et les traitements automatiques du microphone peuvent limiter
la détection. La page nécessite HTTPS ou localhost pour getUserMedia.

## Recette basse — MANUAL TEST REQUIRED

Les signaux synthétiques couvrent B0/E1/A1/D2/G2 à 44,1/48/96 kHz, désaccordage
±100 cents, phases différentes, bruit, offset DC, harmoniques dominantes et
fondamental absent avec plusieurs harmoniques. Vérifier physiquement sur Web et Android :

- Chaque corde d’une basse 4 et 5 cordes, en cible automatique puis manuelle ;
  Si grave un peu trop bas, puis juste, puis trop haut, sans affichage à l’octave.
- Cordes étouffées avant de jouer la suivante, attaques faibles/fortes et sustain ;
  changements de corde et véritables changements d’octave sans verrouillage.
- Micro intégré et, si disponible, interface audio ; comparer à un accordeur matériel.
  Le micro peut filtrer les graves. Si seul un harmonique isolé est capté, le
  fondamental n’est pas déductible de manière fiable. Ne pas forcer une octave
  à partir du mode ou de la corde sélectionnée.
- Portrait/paysage, navigation clavier, microphone refusé/révoqué, arrêt et retour
  d’arrière-plan, puis lancement hors ligne sur Android.

Aucune validation sur instrument physique ou téléphone n’a été effectuée dans
cette implémentation ; les tests synthétiques ne la remplacent pas.
