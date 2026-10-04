Effectue maintenant un audit UX, responsive et accessibilité complet de FretLab.

IMPORTANT :

FretLab possède maintenant deux cibles depuis la même codebase :

1. site web Next.js
2. application Android Capacitor

Je veux conserver la même identité graphique et autant que possible
les mêmes composants.

Ne crée pas deux interfaces complètement différentes.

==================================================
RESPONSIVE WEB
==================================================

Tester mentalement et dans le code les largeurs :

320 px
360 px
375 px
390 px
412 px
768 px
1024 px
1440 px

Auditer :

- accueil
- dictionnaire d'accords
- métronome
- accordeur
- transposeur
- articles
- article
- à propos

Éviter tout scroll horizontal involontaire.

==================================================
ANDROID / CAPACITOR
==================================================

Vérifier également l'affichage dans une WebView Android.

Prendre en compte :

- status bar Android
- navigation bar Android
- safe areas
- appareils avec encoche
- grands écrans Android
- petits écrans Android
- clavier virtuel
- rotation portrait/paysage
- changement de taille de viewport
- retour depuis l'arrière-plan

Ne pas laisser du contenu important passer sous :

- la status bar
- la navigation système

Utiliser env(safe-area-inset-*) si approprié.

==================================================
TOUCH
==================================================

Tous les contrôles importants doivent être facilement utilisables au doigt.

Vérifier notamment :

- boutons +/- du métronome
- Start / Stop
- contrôles de l'accordeur
- boutons du transposeur
- sélection des accords
- menu mobile
- CTA

Éviter les zones tactiles trop petites.

==================================================
NAVIGATION MOBILE
==================================================

Auditer la navigation actuelle dans l'application Android.

Ne remplace pas obligatoirement le menu actuel.

Mais si une adaptation mobile simple améliore nettement l'expérience,
propose-la avant de créer une architecture complexe.

La navigation doit rester cohérente entre web et Android.

==================================================
BOUTON RETOUR ANDROID
==================================================

Vérifier le comportement du bouton / geste retour Android.

Comportement attendu :

- si une navigation interne peut être remontée :
  revenir à la page précédente

- ne pas fermer brutalement l'application lorsqu'un historique pertinent existe

- éviter les doubles handlers

Ne pas casser le comportement du navigateur web.

==================================================
ACCORDAGE / MICROPHONE
==================================================

Auditer précisément l'UX de permission microphone.

Avant permission :
"Activer le microphone"

Après refus :
afficher une explication claire.

Après autorisation :
l'accordeur fonctionne normalement.

Ne jamais demander le microphone automatiquement au démarrage.

Afficher :

"Le son de votre microphone est traité uniquement sur votre appareil."

Vérifier que cette formulation reste vraie techniquement.

==================================================
MÉTRONOME
==================================================

Sur téléphone :

- BPM très lisible
- Start/Stop accessible
- indicateur de beat visible
- pas de déplacement gênant de layout pendant la lecture

Si l'application passe en arrière-plan puis revient au premier plan,
l'état doit rester cohérent.

==================================================
CLAVIER MOBILE
==================================================

Tester particulièrement le transposeur.

Lorsque le clavier apparaît :

- textarea reste utilisable
- boutons essentiels accessibles
- aucun contenu important masqué
- pas de layout cassé

==================================================
ORIENTATION
==================================================

Portrait = expérience prioritaire.

Paysage doit néanmoins rester utilisable.

Ne pas bloquer une orientation sans nécessité.

==================================================
ACCESSIBILITÉ
==================================================

Auditer :

- contrastes
- focus
- navigation clavier sur web
- labels
- aria-label
- boutons
- menu
- SVG
- messages d'état
- lecteurs d'écran

L'accordeur doit afficher textuellement :

- trop bas
- juste
- trop haut

Le métronome doit afficher textuellement :

- actif
- arrêté

Ne pas transmettre une information uniquement par couleur.

==================================================
PREFERS REDUCED MOTION
==================================================

Respecter prefers-reduced-motion lorsque pertinent.

==================================================
CONTRAINTE IMPORTANTE
==================================================

Ne crée pas des forks de composants du type :

MetronomeWeb
MetronomeAndroid

sauf nécessité technique réelle.

Préférer les mêmes composants avec de petites adaptations spécifiques
à la plateforme.

À LA FIN :

- corriger les problèmes identifiés
- tests
- lint
- build web
- npx cap sync android

Puis résumer :

1. améliorations communes
2. améliorations spécifiques web
3. améliorations spécifiques Android