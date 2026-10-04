Prépare maintenant FretLab pour ses deux modes de distribution :

1. site web via Vercel
2. application Android via Google Play

Ne publie rien automatiquement.

Je veux uniquement préparer correctement les releases.

==================================================
PARTIE A — WEB
==================================================

Vérifier :

- build production
- static export si utilisé
- variables environnement
- metadataBase
- sitemap
- robots
- favicon
- Open Graph
- 404
- assets
- canonical
- absence localhost
- aucune configuration Capacitor visible dans l'expérience web

README :
documenter le déploiement Vercel.

==================================================
PARTIE B — ANDROID
==================================================

Auditer et préparer le projet Android pour une release.

Vérifier :

- applicationId
- versionCode
- versionName
- targetSdk
- compileSdk
- minSdk
- permissions
- manifest
- icône
- nom FretLab
- build type release
- debuggable false en release
- aucune URL de développement
- aucun localhost
- aucun server.url Capacitor de dev

==================================================
PERMISSIONS
==================================================

Justifier chaque permission Android.

FretLab devrait idéalement nécessiter uniquement les permissions
réellement utilisées.

Pour RECORD_AUDIO :

documenter exactement pourquoi elle est nécessaire.

==================================================
PRIVACY
==================================================

Créer ou vérifier une page web :

/confidentialite

ou une route équivalente.

Elle doit expliquer clairement :

- usage du microphone
- traitement local
- absence d'enregistrement audio
- absence de transmission audio
- éventuelles données réellement collectées

Ne prétendre à aucune pratique qui n'est pas garantie par le code.

Ajouter un lien vers cette page dans le footer.

==================================================
MICROPHONE
==================================================

Texte recommandé à adapter au comportement réel :

"FretLab utilise le microphone uniquement pour détecter la hauteur
des notes avec l'accordeur. L'analyse est réalisée localement sur votre
appareil. L'audio n'est ni enregistré, ni stocké, ni transmis."

Vérifier techniquement que cette affirmation est vraie.

==================================================
ASSETS PLAY STORE
==================================================

Créer une checklist documentée pour :

- icône application
- icône Play Store
- screenshots smartphone
- feature graphic
- nom application
- description courte
- description longue
- catégorie
- email support
- URL privacy policy

Ne génère pas nécessairement tous les visuels maintenant.
Créer la checklist.

==================================================
VERSIONING
==================================================

Documenter comment incrémenter :

versionCode
versionName

avant chaque release.

==================================================
SIGNATURE
==================================================

Documenter :

- génération de clé d'upload
- conservation sécurisée
- ne jamais commiter keystore ou mots de passe
- variables / configuration Gradle appropriées

Ajouter les fichiers sensibles appropriés à .gitignore si nécessaire.

NE CRÉE PAS de faux mots de passe ni de secrets.

==================================================
AAB
==================================================

Documenter comment produire :

Android App Bundle (.aab)

en release.

Vérifier que le projet peut être compilé en release si l'environnement
le permet.

==================================================
README
==================================================

Mettre à jour README avec :

- architecture Web + Android
- développement web
- build web
- static export
- Capacitor
- cap sync
- ouverture Android Studio
- lancement smartphone
- permissions microphone
- offline
- build Android debug
- build Android release
- versioning
- publication Play Store

==================================================
COMMANDES
==================================================

Documenter le workflow courant :

développement :

npm run dev

validation :

npm test
npm run lint
npm run build

Android :

npm run build
npx cap sync android
npx cap open android

Si pertinent, créer des scripts npm simples comme :

android:sync
android:open

mais uniquement si cela améliore réellement le workflow.

==================================================
VALIDATION FINALE
==================================================

À la fin :

- tests
- lint
- build web
- static export
- cap sync
- compilation Android debug
- compilation Android release si possible

Donne-moi ensuite deux procédures séparées :

PROCÉDURE WEB
de Git jusqu'à Vercel

PROCÉDURE ANDROID
du repository jusqu'au fichier .aab prêt pour Play Console

Ne publie rien automatiquement.