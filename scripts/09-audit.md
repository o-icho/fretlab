Je veux maintenant que tu agisses comme reviewer senior avant la recette finale.

FretLab est maintenant une application multi-cible :

- Next.js Web
- Android via Capacitor

Ne modifie rien immédiatement.

==================================================
ÉTAPE 1 — AUDIT COMPLET
==================================================

Analyse complètement le repository.

Inclure :

- code Next.js
- TypeScript
- React
- Tailwind
- configuration Capacitor
- projet android/
- Gradle/configuration Android pertinente

==================================================
ARCHITECTURE
==================================================

Chercher :

- mauvaise séparation des responsabilités
- duplication
- dépendances inutiles
- logique spécifique Android contaminant inutilement le web
- abstraction excessive
- fork inutile de composants web/mobile

==================================================
NEXT.JS / STATIC EXPORT
==================================================

Vérifier :

- output: export
- génération du dossier out
- routes dynamiques
- articles
- generateStaticParams
- assets
- liens internes
- next/image
- fonctionnalités serveur incompatibles avec static export

==================================================
CAPACITOR
==================================================

Auditer :

capacitor.config.*

Vérifier notamment :

- appId
- appName
- webDir
- paramètres Android
- aucun server.url de développement utilisé en production
- aucune URL localhost
- sync correcte

==================================================
ANDROID
==================================================

Inspecter la configuration Android pertinente.

Vérifier :

- package/applicationId
- minSdk
- targetSdk
- compileSdk
- permissions
- manifest
- thème
- WebView
- intent filters

Ne demander que les permissions réellement nécessaires.

==================================================
MICROPHONE
==================================================

Vérifier :

- RECORD_AUDIO
- permission runtime
- aucune permission micro au démarrage
- MediaStream correctement arrêté
- AudioContext correctement nettoyé
- traitement audio local uniquement

Chercher :

- microphone restant actif
- MediaStream leak
- AudioContext leak
- requestAnimationFrame abandonné
- permission WebView mal gérée

==================================================
TUNER
==================================================

Auditer :

- pitch detection
- buffer
- RMS
- sustain/release
- stabilisation
- calcul fréquence/note
- octave
- cents
- comportement Android WebView
- reprise après background/foreground

==================================================
METRONOME
==================================================

Auditer :

- scheduler Web Audio
- dérive
- double start
- timers
- audio nodes
- changement BPM
- changement signature
- background/foreground Android

==================================================
CYCLE DE VIE MOBILE
==================================================

Inspecter le comportement lorsque :

- application passe en background
- revient au premier plan
- écran s'éteint
- orientation change
- WebView est recréée

Éviter les états incohérents.

==================================================
BOUTON RETOUR ANDROID
==================================================

Vérifier :

- historique
- navigation
- double handlers
- fermeture prématurée

==================================================
TRANSPOSEUR
==================================================

Auditer :

- parsing
- faux positifs
- slash chords
- enharmonie
- copier/coller Android
- clavier virtuel

==================================================
DICTIONNAIRE D'ACCORDS
==================================================

Auditer :

- dataset
- SVG
- responsive
- barre
- cases
- cordes ouvertes
- touch

==================================================
OFFLINE
==================================================

Les fonctionnalités suivantes doivent fonctionner sans réseau dans
l'application installée :

- dictionnaire d'accords
- métronome
- accordeur
- transposeur

Vérifier qu'aucune dépendance distante indispensable n'est requise.

Attention notamment :

- fonts
- scripts externes
- CDN
- images essentielles
- API externes

==================================================
SÉCURITÉ
==================================================

Chercher notamment :

- navigation arbitraire de WebView
- URL externe non contrôlée
- secrets dans le bundle
- clés API
- permissions Android inutiles
- mixed content
- debugging activé en release
- fichiers sensibles embarqués

==================================================
SEO WEB
==================================================

Vérifier que l'ajout Android n'a pas cassé :

- sitemap
- robots
- metadata
- canonical
- structured data
- articles

==================================================
PERFORMANCES
==================================================

Auditer séparément :

WEB :
- JS envoyé
- client components
- images
- fonts
- bundle

ANDROID :
- bundle embarqué
- dépendances Capacitor
- assets inutiles
- temps de lancement

==================================================
TESTS
==================================================

Identifier :

- logique critique sans test
- tests fragiles
- tests insuffisants
- différences web/mobile non testées

==================================================
CLASSIFICATION
==================================================

Classer chaque problème :

CRITICAL
HIGH
MEDIUM
LOW

Pour chacun :

- fichier
- plateforme concernée : WEB / ANDROID / BOTH
- problème
- conséquence
- correction

NE MODIFIE RIEN pendant cette étape.

À la fin :
donne un plan de correction priorisé.