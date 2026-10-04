Nous allons maintenant effectuer la recette complète de FretLab.

Le produit possède deux cibles :

1. Web
2. Android Capacitor

Je veux tester les deux.

==================================================
A — RECETTE WEB
==================================================

Tester :

Accueil
→ navigation
→ quatre outils
→ articles

TRANSPOSEUR

Entrer :

Am F C G

+2

Attendu :

Bm G D A

Tester :

C/E G/B Am7 Fmaj7

Tester :
- dièses
- bémols
- reset
- copier

MÉTRONOME

- 120 BPM
- Start
- 140 BPM
- 3/4
- 6/8
- Stop

Vérifier qu'aucun timer/audio ne continue après Stop.

ACCORDS

Tester :

C
G
Am
F
Cmaj7
Am7
F#m
power chord

Vérifier les diagrammes.

ACCORDEUR

Vérifier :

- microphone non demandé automatiquement
- activation volontaire
- refus permission
- autorisation
- détection
- arrêt
- libération MediaStream

ARTICLES

- liste
- article
- liens vers outils
- article similaire

SEO

Vérifier :

- metadata
- sitemap
- robots
- canonical
- JSON-LD

==================================================
B — BUILD MOBILE
==================================================

Exécuter :

npm run build
npx cap sync android

Vérifier que le contenu de `out` est correctement intégré à Android.

Compiler le projet Android en mode debug.

==================================================
C — RECETTE ANDROID
==================================================

Tester sur un véritable appareil Android si l'environnement le permet.

Sinon indiquer explicitement les tests nécessitant une intervention humaine.

Tester :

LANCEMENT

- cold start
- warm start
- aucun écran blanc anormal
- design correct

NAVIGATION

- accueil
- outils
- articles
- retour Android
- navigation interne

RESPONSIVE

Tester portrait.

Tester paysage.

Vérifier safe areas.

==================================================
D — ACCORDEUR SUR VRAI TÉLÉPHONE
==================================================

Ceci est critique.

Tester :

E2 ≈ 82.41 Hz
A2 ≈ 110.00 Hz
D3 ≈ 146.83 Hz
G3 ≈ 196.00 Hz
B3 ≈ 246.94 Hz
E4 ≈ 329.63 Hz

Vérifier :

- détection attaque
- stabilité
- sustain
- release
- cents
- aiguille
- signal faible

Tester également :

- permission refusée
- permission accordée
- Stop
- retour page
- fermeture accordeur

Après arrêt :
le microphone Android ne doit plus être actif.

==================================================
E — CYCLE DE VIE
==================================================

Avec métronome actif :

- passer application en arrière-plan
- revenir

Avec accordeur actif :

- passer application en arrière-plan
- revenir

Définir le comportement voulu et vérifier qu'il est cohérent.

Tester écran verrouillé / déverrouillé si pertinent.

==================================================
F — OFFLINE
==================================================

Activer le mode avion.

Tester :

- accueil
- dictionnaire
- métronome
- accordeur
- transposeur

Ils doivent fonctionner.

Vérifier quels articles restent disponibles.

==================================================
G — CLAVIER ANDROID
==================================================

Dans transposeur :

- ouvrir textarea
- clavier apparaît
- saisir texte
- transposer
- fermer clavier

Aucun élément critique ne doit devenir inaccessible.

==================================================
H — PERFORMANCE
==================================================

Vérifier :

- démarrage
- navigation
- mémoire
- CPU accordeur
- CPU métronome
- absence de boucle excessive

==================================================
I — ACCESSIBILITÉ
==================================================

Web :
- clavier
- focus

Android :
- touch targets
- texte
- état tuner
- état metronome

==================================================
J — RÉSULTAT
==================================================

À la fin produire deux statuts :

WEB:
READY / NOT READY

ANDROID:
READY / NOT READY

Lister :

- blockers web
- blockers Android
- problèmes non bloquants
- tests nécessitant un vrai téléphone
- tests nécessitant éventuellement plusieurs modèles Android

Ne déclare pas Android READY si les tests microphone réels n'ont jamais été effectués.