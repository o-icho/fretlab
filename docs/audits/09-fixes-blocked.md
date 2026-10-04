# Étape 4 — Corrections HIGH, workflow arrêté

4 octobre 2026. Spécification : `docs/codex/09-fixes.md`.

## Correction effectuée

A2 : le test instrumenté Android vérifie désormais `com.fretlab.app` au lieu
de l'identifiant hérité du template. Ce changement reste non commité tant que
la validation native de l'étape 4 est bloquée. Aucun autre HIGH de code confirmé.

## Validations exécutées

- `npm run test` : 117 tests réussis.
- `npm run lint` : réussite sans warning.
- `npm run build` : réussite, avec `SITE_URL=https://example.com` exclusivement
  comme fixture de vérification SEO ; ce domaine n'est pas celui de FretLab.
- `npm run build:android` : réussite sans domaine public.
- Le build web sans SITE_URL est volontairement refusé par le garde de configuration.
- Synchronisation Capacitor et contrôle des assets embarqués après l'export Android.

## Blocage A1

Commande tentée : `./android/gradlew.bat -p android assembleDebug --offline --no-daemon`.
Le wrapper n'est pas en cache et tente de télécharger Gradle 8.14.3 ; le réseau
du sandbox renvoie `java.net.SocketException: Permission denied` avant l'exécution
des tâches. `--offline` ne dispense pas du premier téléchargement du wrapper.

Autres prérequis manquants : SDK Android 36 non trouvé aux emplacements usuels
ni via les variables SDK disponibles ; Android Studio et adb non trouvés.
Le JDK identifié est 17.0.11. `javac --release 21 -version` confirme
`release version 21 not supported`, tandis que Capacitor utilise Java 21.

Il ne s'agit pas d'une compilation Java réussie ou d'une erreur native déjà
diagnostiquée : les outils ne permettent pas encore de compiler l'application.
Le workflow s'arrête ici conformément à la demande. Les étapes 5 et 6 ne sont
ni exécutées ni déclarées validées. Aucun push, déploiement ou release effectué.

## Reprise

1. Installer/configurer Android Studio, JDK 21, Android SDK Platform 36,
   les build-tools appropriés et platform-tools. Accepter les licences SDK.
2. Configurer le Gradle JDK d'Android Studio ou JAVA_HOME ; laisser le wrapper
   récupérer sa distribution et les dépendances depuis un environnement autorisé.
3. `npm run build:android`, `npx cap sync android`, `npm run android:check`.
4. `./android/gradlew.bat -p android assembleDebug` puis les tests instrumentés
   avec un appareil connecté : `./android/gradlew.bat -p android connectedDebugAndroidTest`.
5. Terminer/commiter l'étape 4 avant de commencer `10-recette.md`, puis `11-release.md`.

MANUAL TEST REQUIRED : microphone réel/guitare, permission Android, libération
micro après arrêt/navigation/arrière-plan, timing métronome, retour système,
clavier, rotation, safe areas, démarrage à froid hors ligne et TalkBack.

Le domaine web demeure à choisir avant publication. Aucun secret n'a été créé,
affiché ou modifié ; les changements antérieurs non commitées sont préservés.
