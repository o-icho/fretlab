# Exemples audio envoyés pour revue

## Architecture

Next.js conserve `output: "export"`, les pages pré-générées dans `out/` et
le même formulaire React pour Web et Capacitor Android. Le POST dynamique
est une **Vercel Function Node**, hors de `src/app` :
`api/submit-example.ts`, endpoint **POST /api/submit-example**.

`vercel.json` utilise le preset **Other** (`framework: null`),
`buildCommand: pnpm run build:secure`, `outputDirectory: out` : Vercel sert
l'export statique et déploie la fonction du dossier `api/`. Ne pas rétablir
le preset Next.js, qui attendrait une API Next incompatible avec cet export.
Les headers existants, notamment CSP Report-Only, sont conservés.
Vérifier les éventuels overrides du dashboard avant le prochain déploiement.

La fonction embarque seulement le JSON de configuration et les `Track_*.json`
versionnés via `functions.includeFiles`. Les titres et identifiants viennent
de ces données validées, jamais de champs libres envoyés par le client.
Elle ne dépend ni du scanner en cours de build ni de fichiers MP3 embarqués.
Resend reste une dépendance exclusivement serveur, hors du bundle Android.

## Configuration manuelle obligatoire

1. Créer un compte [Resend](https://resend.com).
2. Créer une clé API d'envoi.
3. Renseigner **RESEND_API_KEY** dans les variables serveur Vercel.
4. Vérifier/configurer son domaine d'expédition dans Resend puis renseigner
   **RESEND_FROM_EMAIL** avec une adresse simple de ce domaine vérifié
   (sans nom d'affichage). Configurer aussi ces variables pour les previews
   si l'envoi doit y être testé.
5. Remplacer **CHANGE_ME@example.com** dans **config/backing-tracks.json**
   par le destinataire réel. Aucun fallback. Ce JSON n'est pas dans `public/`
   et n'est jamais importé par le client.

Sans configuration valide, le serveur répond **503 SERVER_CONFIGURATION_ERROR**,
sans appeler Resend. Le client affiche seulement « L'envoi a échoué.
Réessayez plus tard. ». Aucun secret ni détail brut Resend n'est renvoyé/loggé.
Ne jamais utiliser de variable NEXT_PUBLIC pour une clé API.

Pour Android, définir au build **NEXT_PUBLIC_SUBMISSION_ORIGIN** sur l'origine
HTTPS du site déployé, par exemple `https://fretlab.fr` (pas de chemin).
Web utilise toujours son propre `/api/submit-example`, y compris en preview.
La fonction autorise le CORS pour sa propre origine et `https://localhost`,
l'origine déjà configurée dans Capacitor. Le header `X-FretLab-Submission: 1`
est requis et les autres origines sont refusées. Cela ne remplace pas une
protection anti-spam : configurer une règle de limitation de débit Vercel
sur cet endpoint avant de l'exposer largement. Aucun compteur local volatile
n'est présenté comme une protection distribuée.

## Fichiers et limite effective

MP3, WAV ou M4A ; **4 000 000 octets (4 Mo)** maximum par fichier, non vide.
Vérification serveur de l'extension et de la signature du conteneur ; cette
vérification n'est pas une analyse audio ni un antivirus.
Corps multipart limité à 4 064 000 octets, y compris sans Content-Length.

La limite Vercel est de [4,5 Mo pour toute la requête](https://vercel.com/docs/functions/limitations#request-body-size).
Le seuil de 4 Mo laisse une marge pour les champs et l'enveloppe multipart.
Les 20 Mo demandés ne sont donc pas supportés par cet endpoint V1. Un WAV
long devra être compressé en MP3/M4A par son auteur avant envoi.
La pièce jointe est transmise en base64 via le [SDK Resend](https://resend.com/docs/dashboard/emails/attachments).

Le fichier n'est jamais écrit sur disque ni copié dans `public/` : il passe
en mémoire puis est envoyé **en pièce jointe**, avec sujet
`[FretLab] Example submission - <track title>`. Le corps contient id, titre,
slug, pseudo/email/commentaire facultatifs et nom du fichier. L'email
utilisateur sert seulement de Reply-To, jamais de destinataire ou d'expéditeur.
La contribution n'est ni approuvée ni publiée automatiquement. Resend et la
boîte du destinataire reçoivent le fichier et les champs, comme indiqué sur
le formulaire. La confirmation signifie que Resend a accepté l'envoi,
pas une preuve de livraison en boîte de réception.

## Contenu sans exemple ou sans accords

`Backingtrack_<id>.mp3` reste obligatoire ; `Example_<id>.mp3` est optionnel.
Le scanner rejette les doublons et les identifiants incohérents. Sans exemple,
aucun `exampleUrl` n'est publié : le CTA « Example not available · Send yours »
remplace le toggle et mène à la page pré-générée de contribution.
Le transport existant des morceaux avec exemple est inchangé.

`chordTimeline: []` est valide et affiche « Accords non disponibles » dans
le conteneur fixe. Une timeline non vide conserve ses trous et sa limite
de couverture : conteneur vide, aucune extrapolation et aucune rétraction.

## Vérification locale et déploiement ultérieur

PowerShell depuis la racine :

```powershell
pnpm test
pnpm lint
pnpm typecheck
$env:SITE_URL = 'https://fretlab.fr'
pnpm run build
pnpm run security:csp
# Serveur statique + le vrai handler local (aucun secret requis pour tester le 503)
node scripts/serve-static.mjs --with-api
```

Ouvrir `/backing-tracks/a-frame-blues/submit-example/`. `next dev` et le
serveur statique sans `--with-api` n'hébergent pas la fonction d'envoi.
Les tests unitaires injectent un expéditeur simulé : aucun email réel.
Configurer de vraies valeurs puis cliquer Envoyer déclenche un **véritable email**.

Android :

```powershell
$env:NEXT_PUBLIC_SUBMISSION_ORIGIN = 'https://fretlab.fr'
pnpm run build:android
pnpm run android:sync
pnpm run android:check
```

L'envoi nécessite Internet. Les outils et fichiers audio locaux conservent
leur fonctionnement offline ; le formulaire signale proprement l'échec réseau.

**MANUAL TEST REQUIRED** après configuration : déployer une preview Vercel,
vérifier la présence de la fonction et l'ouverture directe des pages statiques,
envoyer un petit MP3/WAV/M4A, vérifier la pièce jointe et les champs reçus.
Tester le sélecteur de fichiers Android, le CORS, l'envoi réel et l'échec hors
ligne sur téléphone. Aucun déploiement ni envoi réel n'est effectué par les tests.

## Fichiers de cette évolution

- Configuration : `config/backing-tracks.json`, `.env.example`, `vercel.json`,
  `package.json`, `pnpm-lock.yaml`.
- Serveur : `api/submit-example.ts`, `server/example-submission.ts`,
  `server/example-submission.test.mjs`.
- Formulaire : `src/app/backing-tracks/[slug]/submit-example/page.tsx`,
  `src/features/backing-tracks/ExampleSubmissionForm.tsx`,
  `src/features/backing-tracks/submission.ts`.
- Player/données : `src/features/backing-tracks/BackingTrackPlayer.tsx`,
  `backingTracks.module.css`, `content.ts`, `detail.ts` dans le même dossier.
- Scanner et aperçu : `scripts/generate-backing-tracks-catalog.mjs`,
  `scripts/generate-backing-tracks-catalog.test.mjs`, `scripts/serve-static.mjs`.
- Compatibilité de l'outil éditorial : `tools/backing-track-chords/track_files.py`,
  `extract_chords.py`, `test_track_files.py`, `README.md` dans le même dossier.
- Documentation : ce document et `docs/architecture/FRETLAB_ENGINEERING_RULES.md`.

Les modifications de timelines/analyse déjà présentes dans le répertoire de
travail ne font pas partie de cette évolution.
