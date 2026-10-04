# Étape 3 — Audit architecture Web + Capacitor

4 octobre 2026. Spécification lue : `docs/codex/09-audit.md`.
Cette étape n'a modifié aucun code applicatif.

## Architecture examinée

- Next App Router : export statique, routes outils, articles pré-générés,
  métadonnées, robots/sitemap, composants serveur et frontières client.
- Articles : fichiers Markdown lus au build ; aucun parsing de la collection
  côté navigateur. HTML brut désactivé, JSON-LD échappé.
- Accord : dataset explicite de 108 accords et 426 positions, provenance MIT
  et rejets documentés ; recherche enharmonique ; SVG décrit pour l'accessibilité.
- Transposeur : grammaire musicale explicite, paroles conservées, slash chords,
  notation, copie avec gestion d'échec et nettoyage du timer.
- Métronome : horloge AudioContext, horizon 100 ms, réveil 25 ms, génération
  courte oscillator/gain, nettoyage des voix et callbacks ; BPM/signature testés.
- Accordeur : YIN, buffer 4096, analyse toutes les 60 ms, RMS/confiance,
  stabilisation avec rétention bornée ; nettoyage tracks, nodes, RAF et contexte.
- Microphone : activation volontaire, annulation de démarrage par génération,
  traitement mémoire local ; aucune transmission, MediaRecorder ou stockage audio.
- Cycle de vie : arrêt audio sur visibilité/background, reprise volontaire,
  handlers natifs installés et retirés dans un composant isolé.
- Capacitor 8 : identité FretLab/com.fretlab.app, out, pas de server.url distant,
  origine HTTPS localhost réservée aux fichiers embarqués, pas d'allowNavigation.
- Java : pages HTML propres à chaque route, injection du bridge conservée,
  demandes microphone limitées à l'origine locale et à AUDIO_CAPTURE.
- Android : minSdk 24, compile/targetSdk 36, RECORD_AUDIO + INTERNET, absence
  de cleartext et backup, orientation libre, clavier adjustResize.
- Sécurité : navigation externe déléguée au comportement Capacitor ; pas de
  mixed content autorisé ; le debugging dépend du caractère debug de l'application
  dans CapConfig. Aucun fichier d'environnement ou de signature dans out.
- Offline : données, polices next/font, CSS et scripts embarqués. Aucun CDN ou API
  indispensable aux outils ; le lien de provenance externe n'est pas nécessaire.

L'inspection et les tests ne prouvent pas le comportement d'une WebView réelle,
la précision acoustique, ni une absence absolue de fuite sur appareil.

## Problèmes classés et plan priorisé

| ID | Gravité | Plateforme / fichier | Problème, conséquence, correction |
|---|---|---|---|
| A1 | HIGH | ANDROID — environnement de compilation | SDK Android/adb/Android Studio non trouvés aux emplacements usuels ; seul JDK 17 identifié alors que Capacitor compile en Java 21. Impossible de valider l'APK. Configurer JDK 21 et SDK 36 puis compiler debug. |
| A2 | HIGH | ANDROID — android/app/src/androidTest/java/com/getcapacitor/myapp/ExampleInstrumentedTest.java | Assertion héritée `com.getcapacitor.app` incompatible avec `com.fretlab.app` : la recette instrumentée échouera même sur une application correcte. Corriger l'identité attendue. |
| A3 | MEDIUM | BOTH — src/components/NativeLifecycle.tsx | Imports Capacitor statiques dans un composant racine client : coût aussi sur le web. Optimisation éventuelle par import différé, à mesurer avant modification. |
| A4 | MEDIUM | ANDROID — recette physique | Navigation par retour, permissions, safe areas, offline, CPU accordeur et arrière-plan non validés sur téléphone. MANUAL TEST REQUIRED. |
| A5 | MEDIUM | WEB — configuration SITE_URL | Aucun domaine encore choisi. Le garde du build empêche une publication avec canonicals localhost. Définir le véritable domaine avant release web. |
| A6 | LOW | ANDROID — android/app/src/test/java/com/getcapacitor/myapp/ExampleUnitTest.java | Test addition du template sans valeur métier. Remplacer à terme par tests natifs utiles, sans ajouter de mocks fragiles. |

Aucun CRITICAL confirmé par l'audit. A1 est un blocage d'environnement, pas une
raison de changer la stack. Ordre : corriger A2, tenter la compilation et lever A1,
puis seulement effectuer recette et préparation release.

## Validation avant commit

Suite de 117 tests, lint et build statique web avec une origine de test publique.
Les 12 routes sont pré-rendues ; synchronisation Android vérifiée à l'étape 2.
Le domaine `https://example.com` n'est jamais présenté comme le domaine FretLab.
