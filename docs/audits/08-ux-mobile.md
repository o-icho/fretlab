# Étape 2 — UX Web et Android

Audit du 4 octobre 2026 selon `docs/codex/08-ux-mobile.md`.

## Contrôles effectués

Navigateur Edge/Chromium sur l'export de production : accueil, quatre outils,
liste et détail d'article, à propos, aux largeurs 320, 360, 375, 390, 412,
768, 1024 et 1440 px. Les 64 contrôles passent sans débordement horizontal
ni erreur JavaScript. Les contrôles principaux mesurés sont hauts d'au moins
44 px en mode tactile. Résultats détaillés : `08-browser.json`.

Le menu mobile s'ouvre, se ferme à la navigation et peut maintenant être fermé
avec Échap, en restaurant le focus sur son bouton. Les libellés et contrôles
des outils restent communs aux deux plateformes.

Les textes de confidentialité et de refus microphone désignent maintenant
l'appareil et les paramètres du navigateur ou de l'application. Aucun accès
microphone n'est demandé au chargement ; l'analyse reste locale.

Inspection du code : couleurs FretLab, focus visible, labels des champs,
SVG avec description, état textuel accordeur et métronome, réduction des
animations, hauteur dynamique du viewport, safe areas, `adjustResize`, aucune
orientation bloquée. Les hooks audio arrêtent la lecture/l'écoute lorsque
la page ou l'application passe en arrière-plan ; reprise volontaire.

117 tests réussis ; lint et build web passent. Synchronisation Capacitor et
comparaison des assets Android avec l'export exigées avant le commit.

## MANUAL TEST REQUIRED

- WebView réelle : portrait/paysage, encoche, status/navigation bars, petits et grands écrans.
- Clavier du transposeur : saisie, fermeture, boutons accessibles, copier/coller.
- Retour Android : historique, arrivée directe sur un outil, sortie depuis l'accueil.
- Microphone : refus, autorisation volontaire, arrêt, arrière-plan, verrouillage.
- Métronome : perception sonore, rythme visuel, arrêt et reprise après arrière-plan.
- TalkBack et lecteur d'écran web : annonces, navigation, agrandissement du texte.

Les contrôles Chromium ne remplacent aucun de ces tests sur téléphone.
