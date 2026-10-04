# Accordeur Android : arrêt immédiat du microphone

Diagnostic et correction du 4 octobre 2026, vérifiés sur le téléphone physique
connecté par ADB. Aucun audio n'a été enregistré ou exporté pendant le diagnostic.

## Cause confirmée

Le manifeste omettait `android.permission.MODIFY_AUDIO_SETTINGS`. Chromium/WebView
ne pouvait pas sélectionner sa route audio. Trace du processus FretLab avant
correction : `audio_manager_android.cc:885 — Unable to select communication device!`.
`getUserMedia()` rejetait avec `NotReadableError` avant de rendre un MediaStream.

L'arrêt observé était le chemin `catch` de `MicrophoneTuner.start()` qui appelait
`stop()` et fermait son AudioContext. Aucun appel applicatif à `track.stop()` ne
précédait cet échec : aucune piste n'avait encore été remise à l'application.

Comparaison sur le même téléphone : un APK ne modifiant que cette permission
a conservé une piste `live`, enabled et non muted pendant 12 secondes après le clic.
Cela confirme le lien causal sans modifier le pitch detection ni les contraintes audio.

`MODIFY_AUDIO_SETTINGS` est une permission normale de routage audio, sans dialogue
runtime. Seule `RECORD_AUDIO` reste demandée volontairement au clic. Le gestionnaire
WebView continue à vérifier l'origine HTTPS locale et AUDIO_CAPTURE uniquement.

Références techniques :
- [Chromium AudioManagerAndroid](https://chromium.googlesource.com/chromium/src/media/+/master/audio/android/audio_manager_android.h), dépendance aux deux permissions pour les appareils audio de communication.
- `node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/BridgeWebChromeClient.java` inclut déjà MODIFY_AUDIO_SETTINGS dans les permissions audio attendues.

## Audit du cycle de vie

- Bouton : uniquement `onClick`, aucun événement pointer/touch/mouse de relâchement.
- Aucun effet React ne démarre automatiquement le microphone ; cleanup au démontage
  uniquement. L'état de détection n'est pas une dépendance déclenchant ce cleanup.
- Une génération invalide les opérations asynchrones annulées ; un résultat tardif
  est immédiatement arrêté et ne peut remplacer une nouvelle session.
- `visibilitychange` et `fretlab:pause` conservent leur comportement de nettoyage,
  avec une raison explicite. Aucun listener blur/focus ne coupe le microphone.
- App.appStateChange Android vient de onResume/onStop ; aucun listener App.pause
  n'a été ajouté. Le dialogue réel de permission testé n'a pas annulé la session.
- Strict Mode, algorithme YIN, filtrage, seuils et contraintes audio inchangés.

## Avant / après

Avant : clic → getUserMedia → échec du routage WebView → NotReadableError →
stop(error) → AudioContext fermé → retour au bouton Activer.

Après : clic → permission si nécessaire → MediaStream actif → piste live →
écoute durable → bouton Arrêter ou véritable arrière-plan → nettoyage unique.

## Traces temporaires

Ouvrir `/outils/accordeur/?tunerDebug=1` pour les traces JavaScript `[TUNER]`.
Elles restent disponibles dans l'export Android de production, mais sont désactivées
sans ce paramètre. Les traces du permission handler Java sont limitées aux APK debug.
Aucun buffer, son, identifiant ou nom de périphérique dans ces nouvelles traces.

Activation normale :

```text
[TUNER] start requested                         session=1
[TUNER] requesting getUserMedia                 session=1
[TUNER] getUserMedia resolved                   active=true
[TUNER] stream created                         active=true
[TUNER] track state                            readyState=live enabled=true muted=false
[TUNER] running                                session=1
```

Arrêt volontaire :

```text
[TUNER] stop requested by UI/lifecycle          reason=user-button
[TUNER] STOP requested                         reason=user-button session=1
[TUNER] track.stop called by application        reason=user-button readyState=live
```

Les autres causes sont identifiées : component-unmount, visibilitychange,
app-background, error, track-ended, audio-context-state, restart et
late-permission-result. Les événements mute/unmute sont tracés sans arrêter la piste.

## Validation

- 127 tests unitaires : dont dix tests nouveaux du vrai moteur avec une frontière
  navigateur simulée (permission asynchrone/refusée, résultat tardif, nouvelle session,
  erreur NotReadableError, arrêt idempotent, interruption, mute et nettoyage).
- Lint réussi ; cache local `.pnpm-store` exclu de l'analyse des sources.
- Build web avec `SITE_URL=https://example.com`, fixture SEO uniquement.
- Build Android sans domaine ; cap sync ; 12 routes et 107 assets vérifiés.
- Compilation `:app:assembleDebug` avec JDK 21 et installation debug réussies.
- Téléphone : première permission après révocation, acceptée par l'utilisateur ;
  écoute maintenue 15 secondes ; Stop coupe une seule fois.
- Téléphone : passage réel à l'accueil Android ; arrêt `app-background` une seule
  fois ; retour dans FretLab sans réactivation automatique.
- Traces reproductibles : `tuner-android-permission.json` et `tuner-android-background.json`.
- Navigateur Edge, source audio synthétique : aucune demande au chargement,
  un démarrage par clic, aucun arrêt au relâchement, permission asynchrone et
  blur temporaire sans annulation, Stop unique, résultat tardif nettoyé et
  démontage React à la navigation. Rapport : `tuner-web-lifecycle.json`.
- Après les tests, appops Android ne signale aucune capture RECORD_AUDIO en cours.

Observation distincte dans les anciens logs : certaines requêtes de préchargement
Next RSC `__PAGE__.txt` ne trouvaient pas leur asset Android. Ce point n'est pas
la cause de l'échec microphone, reproduit sur une page déjà chargée ; il reste à
examiner dans la recette générale de navigation, hors de cette correction ciblée.

Ces vérifications concernent le cycle de vie, pas une nouvelle qualification
acoustique du pitch detection. Les autres modèles de téléphone restent à tester.

## Fichiers concernés

Manifeste Android, MainActivity (traces debug), `MicrophoneTuner.ts`, `useTuner.ts`,
`diagnostics.ts`, `useAudioPause.ts` (raisons), `lifecycle.test.mjs`, commande test
dans package.json, `check-android.mjs`, exclusion de cache ESLint et documentation.

Après une modification web : `npm run build:android`, `npm run android:sync`, puis
compiler/lancer l'application depuis Android Studio. L'APK corrigé a déjà été
installé sur le téléphone utilisé pour cette vérification.
