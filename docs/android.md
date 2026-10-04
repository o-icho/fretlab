# FretLab web et Android

## Audit avant modification

Les 12 pages publiques étaient pré-rendues. Aucune Server Action, API applicative, SSR obligatoire, middleware/proxy, cookie serveur ou récupération distante de données n’a été trouvé. Les composants serveur lisant `content/articles/*.md` s’exécutent au build : ils n’exigent pas de serveur embarqué. La route des articles définit déjà `generateStaticParams` et `dynamicParams = false`.

Incompatibilités et corrections :

- Le chargeur par défaut de `next/image` exige un serveur : `images.unoptimized = true` conserve dimensions, alt et lazy loading, avec des fichiers locaux.
- Le build ne produisait pas de dossier autonome : `output: "export"`, `trailingSlash: true`, sortie `out/`.
- Les routes metadata robots/sitemap sont maintenant explicitement `force-static`.
- `next start` ne sert pas un export : `npm start` utilise `scripts/serve-static.mjs` pour la prévisualisation locale. La production web peut héberger directement `out/` avec une résolution des dossiers vers `index.html` et `404.html` pour les erreurs.
- Le serveur Capacitor utilise un accueil SPA pour les routes sans extension. `StaticExportWebViewClient.java` sert le HTML propre à chaque route et conserve l’injection du pont Capacitor. Les requêtes de scripts, polices et navigation React restent gérées par Capacitor.
- `MainActivity.java` limite la capture à l'audio et à l'origine locale HTTPS. `RECORD_AUDIO` est demandée au clic. `MODIFY_AUDIO_SETTINGS`, permission normale sans dialogue, est aussi nécessaire au routage Chromium/WebView : son omission provoquait `NotReadableError` sur le téléphone testé. Aucune permission caméra ou stockage.

## Architecture

Une seule codebase React/Next.js, une seule feuille de styles et les quatre mêmes outils. Capacitor **8.5.2** (core, CLI, Android) et App **8.1.2**, versions stables vérifiées au registre npm. `capacitor.config.ts` : FretLab, `com.fretlab.app`, `webDir: out`, origine locale `https://localhost`. Aucun `server.url` distant ni live reload n’est configuré.

Le projet Android cible et compile l’API **36** (Android 16). Le minimum d’installation reste l’API 24 du template Capacitor ; target SDK et minimum d’OS sont deux paramètres différents. Cette configuration atteint le niveau cible requis actuellement par Google Play, sans constituer à elle seule une validation complète de publication.

Le manifeste conserve INTERNET et MODIFY_AUDIO_SETTINGS, permissions normales, et uniquement RECORD_AUDIO comme permission à demander à l’utilisateur. Le microphone est facultatif pour installer l’application. Aucune demande au démarrage : le bouton de l’accordeur déclenche `getUserMedia`, puis Android affiche son dialogue. Une permission refusée revient à l’état arrêté. Seule l’origine locale HTTPS et uniquement la ressource audio sont autorisées.

Aucun audio n’est enregistré, stocké ou transmis. Les tracks et AudioContext sont nettoyés à l’arrêt, à la sortie de la page et au passage en arrière-plan. Le métronome s’arrête également en arrière-plan ; la reprise de lecture est volontaire.

`NativeLifecycle` est la petite interface client pour App : retour dans l’historique, retour à l’accueil si une route a été ouverte seule, puis fermeture à la racine. Son montage ne demande aucune permission. SystemBars intégré assure les safe areas avec des icônes claires sur fond sombre ; le CSS applique les insets et conserve la charte FretLab. Le clavier utilise `adjustResize`, les contrôles tactiles atteignent 44 px, le zoom reste autorisé. L’orientation n’est pas verrouillée ; les changements sont gérés sans recharger la WebView.

Icônes et écran de lancement réutilisent le symbole FretLab local. Aucune dépendance aux fonts Google à l’exécution : `next/font` copie Manrope dans l’export. Le premier build peut avoir besoin du réseau pour télécharger la police. Les articles, positions d’accords et assets sont tous embarqués. Pas de service worker nécessaire pour le fonctionnement hors connexion de l’application native.

## Installer et démarrer sur smartphone

Prérequis : Node.js 22.18+ (Node 24 recommandé), npm, Android Studio compatible Capacitor 8 (2025.2.1 ou ultérieur), SDK Android 36 et outils SDK, JDK 21 configuré pour Gradle. Utiliser le JDK embarqué d’Android Studio lorsqu’il est compatible. Le wrapper Gradle est fourni. Cette machine dispose de JDK 17 mais Android Studio, SDK et ADB n’ont pas été détectés : aucune compilation APK ni installation sur appareil n’a été effectuée ici.

Depuis la racine du projet :

```sh
npm install
npm run test
npm run lint
npm run build
npx cap sync android
npm run android:check
npx cap open android
```

Le dépôt utilise déjà `pnpm-lock.yaml` : `pnpm install --frozen-lockfile` conserve les versions verrouillées si vous utilisez pnpm. Les mêmes scripts sont disponibles dans les deux gestionnaires. Ne pas exécuter `cap add android` à nouveau : la plateforme existe.

Sur le téléphone : activer les options développeur et le débogage USB, connecter par USB et accepter l’autorisation de l’ordinateur. Dans Android Studio, ouvrir le dossier `android`, installer le SDK proposé, sélectionner le téléphone puis **Run**. On peut aussi utiliser `npx cap run android` lorsque SDK, JDK et ADB sont configurés. Il s’agit d’un lancement debug, sans release signée.

Après chaque modification React, CSS ou contenu : `npm run build` puis `npx cap sync android`, puis relancer depuis Android Studio. La version web utilise exactement `out/`. `SITE_URL` concerne seulement les URL SEO publiques ; il ne configure pas le serveur de l’application Android.

## Vérifications effectuées

`npm run test`, `npm run lint`, `npm run build`, `npx cap sync android` réussis. 116 tests passent. `android:check` compare les 107 fichiers de l’export aux assets Android par SHA-256, contrôle les 12 routes, le SDK, les permissions et l’absence d’URL distante.

Test navigateur des assets Android à l’origine HTTPS locale simulée, avec réseau désactivé : 12 routes accessibles, aucune requête externe, accord Am, transposition et copie, lecture/arrêt du métronome, accordeur avec microphone synthétique, arrêt des tracks après Stop/arrière-plan/navigation, navigation React et retour réussis, sans erreur React. Rapport : `docs/android-validation.json`.

Ce test valide la codebase web embarquée. Il ne remplace pas une compilation Android ni les tests des dialogues de permission, insets ou gestionnaires Java dans une véritable WebView.

## Avant la publication Google Play (étape ultérieure)

- Compiler et installer le debug sur un Android 16/API 36 et sur une version antérieure prise en charge.
- Vérifier accès microphone sur premier clic uniquement, refus, autorisation permanente, révocation dans les réglages, interruption et réactivation ; essayer une vraie guitare et plusieurs micros.
- Démarrage à froid en mode avion, rechargement et navigation directe sur outils et articles.
- Arrêt audio lors du verrouillage, changement d’application, navigation et fermeture ; aucun indicateur microphone résiduel.
- Retour matériel/gestuel et fermeture à la racine, clavier, écrans petits et tablettes, rotation, mode partagé, safe areas et navigation à trois boutons/gestuelle.
- Valider l’accordeur et le timing audio sur des WebView à jour, écouteurs et Bluetooth ; vérifier l’accessibilité avec TalkBack.
- À l’étape release seulement : icône finale, version, signature, bundle AAB, exigences Play en vigueur, fiche, politique de confidentialité et formulaire Data safety. Aucune release, clé de signature ou soumission n’est préparée dans cette étape.

Sources : [export statique Next.js](https://nextjs.org/docs/app/guides/static-exports), [prérequis Capacitor](https://capacitorjs.com/docs/getting-started/environment-setup), [Android Capacitor](https://capacitorjs.com/docs/android), [niveau cible Google Play](https://developer.android.com/google/play/requirements/target-sdk).
