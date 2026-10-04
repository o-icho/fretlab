# Pipeline local Codex pour FretLab

Le script `scripts/run-codex-pipeline.ps1` enchaîne des phases locales de développement, puis tests, lint et build. Il n’est pas exécuté automatiquement au démarrage, au commit ni par une tâche planifiée.

## Préparer les phases

Placer vos instructions dans les fichiers UTF-8 suivants, dans cet ordre :

1. `07b-seo-mobile.md`
2. `08-ux-mobile.md`
3. `09-audit.md`
4. `09-fixes.md`
5. `10-recette.md`
6. `11-release.md`

Les fichiers ne sont volontairement pas pré-remplis. Tous les prompts de la plage sélectionnée doivent exister et être non vides ; sinon le script s’arrête avant le premier appel à Codex. Décrire le périmètre, les livrables et les vérifications attendues. Ne jamais mettre de secret dans un prompt ou une checklist. La phase `11-release` reste limitée à des préparatifs locaux sans signature, secrets, publication ou push.

Prérequis : **PowerShell 7.4+** (`pwsh`, pas Windows PowerShell 5.1), Node.js compatible avec le projet, npm et Codex CLI dans PATH, dépendances déjà installées, authentification Codex effectuée préalablement. Utiliser une version récente de Codex prenant en charge `--ignore-user-config`, `--ephemeral`, `--json` et `--output-schema`. Le pipeline ne fait pas de login, d’installation automatique ni de modification de vos identifiants.

Utiliser un checkout de développement sans fichiers sensibles. Le script inspecte uniquement les noms des fichiers et s’arrête devant `.env`, `.env.local`, `.npmrc`, clés, keystores, `auth.json`, credentials et fichiers de signature usuels. Aucun déplacement, effacement ou affichage de leur contenu n’est effectué. `.env.example` reste admis uniquement comme exemple public. Le domaine public peut être fourni via `SITE_URL`, qui n’est pas un secret. Les dossiers de dépendances, build et métadonnées Git sont exclus de cette inspection ; ils doivent provenir de sources de confiance.

## Exécution

Si le terminal ne trouve pas `codex`, le script cherche automatiquement l’exécutable fourni par l’application desktop dans `%LOCALAPPDATA%/OpenAI/Codex/bin/<version>/codex.exe` et sélectionne le fichier le plus récemment modifié. Le PATH reste prioritaire. Pour imposer un exécutable, utiliser `-CodexPath "C:/chemin/vers/codex.exe"`. Aucune installation ni modification permanente du PATH n’est effectuée.

Pour Node.js et npm, le script privilégie également le PATH. Il peut réutiliser Node fourni avec Codex. npm 11 est une dépendance de développement locale et verrouillée du projet : si npm est absent du PATH, le pipeline utilise `node_modules/.bin/npm.cmd`. Il ne dépend plus du cache temporaire pnpm/Codex. Après un nouveau checkout, installer les dépendances avec `pnpm install --frozen-lockfile` ou `npm install` avant le pipeline. Aucune installation ni aucun téléchargement automatique n’est effectué par le pipeline. Les répertoires nécessaires sont ajoutés au PATH seulement pendant l’exécution, puis le PATH est restauré. Vous pouvez préciser `-NodePath "C:/chemin/node.exe"` et `-NpmPath "C:/chemin/npm.cmd"`. Si aucun runtime n’est disponible, installer Node.js avec npm puis rouvrir le terminal. Node.js 22.18 minimum est vérifié au démarrage.

Depuis la racine du repository :

```powershell
./scripts/run-codex-pipeline.ps1

# Plage inclusive
./scripts/run-codex-pipeline.ps1 -From "07b-seo-mobile" -To "08-ux-mobile"

# Une seule étape
./scripts/run-codex-pipeline.ps1 -From "09-audit" -To "09-audit"

# Après validation humaine de la phase précédente
./scripts/run-codex-pipeline.ps1 -From "10-recette"
```

Les valeurs sont les noms sans `.md`. `-From` vaut `07b-seo-mobile`, `-To` vaut `11-release`. Une plage inversée est refusée. Le script retrouve la racine depuis son emplacement, quelle que soit la directory courante, puis restaure la directory d’origine. Il ne saute aucune phase silencieusement et ne reprend pas automatiquement une session Codex antérieure.

## Contrôles et arrêts

Chaque phase lance `codex exec`, avec les instructions transmises par stdin UTF-8. La réponse finale respecte `response-schema.json` : `completed`, `manual_validation_required`, `blocked` ou `failed`, un résumé et une checklist. Un code de sortie non nul, un événement d’erreur Codex, une réponse absente/invalide ou un statut blocked/failed arrête immédiatement le pipeline. Un message sur stderr seul n’est pas traité comme un échec si le code de sortie et le résultat sont valides.

Après une phase localement achevée, les contrôles s’exécutent successivement :

```powershell
npm --ignore-scripts run test
npm --ignore-scripts run lint
npm --ignore-scripts run build
```

Ce sont les scripts demandés `npm run test`, `npm run lint` et `npm run build` ; `--ignore-scripts` désactive uniquement les hooks npm pre/post implicites. Au premier échec, aucun autre contrôle ni aucune autre phase n’est lancé. Les commandes test/lint/build sont mémorisées au début : si Codex les modifie, le pipeline s’arrête avant leur exécution afin de permettre une relecture. Pour une modification légitime, relire le diff puis relancer explicitement la phase ; aucun changement n’est annulé automatiquement.

Pas de retry automatique, rollback, commit, push, publication ou nettoyage récursif. L’export et les fichiers générés ordinaires du build restent permis. La synchronisation Android et les compilations debug peuvent être demandées dans une phase ; elles ne sont pas ajoutées implicitement par le pipeline.

Codes de sortie :

| Code | Signification |
| --- | --- |
| `0` | Toute la plage sélectionnée a réussi. |
| `1` | Échec, configuration invalide, prérequis absent ou blocage Codex. |
| `2` | Travail local et contrôles réussis, attente de validation humaine. |

## Validation sur smartphone

`manual-checklists.json` définit des points d’arrêt obligatoires après `08-ux-mobile`, `09-fixes`, `10-recette` et `11-release`. Les contrôles automatiques passent d’abord, puis le script affiche exactement :

```text
MANUAL VALIDATION REQUIRED
```

Il affiche la checklist et une commande pour reprendre à l’étape suivante, puis quitte avec le code 2. Il ne demande pas un simple « oui » dans le terminal et ne continue jamais seul après ce point. Les preuves navigateur ou microphone synthétique ne sont pas considérées comme une recette sur vrai appareil.

Si une autre phase exige du matériel, Codex doit renvoyer `manual_validation_required` et sa checklist. Vous pouvez également ajouter une entrée de checklist pour cette phase dans `manual-checklists.json`. Toute checklist retournée par Codex entraîne un arrêt, même si le statut était completed. Un statut manuel sans checklist est une erreur.

Après test humain, consigner les résultats et anomalies dans un document sans données privées. `-From` est une reprise volontaire : il n’atteste pas automatiquement que les tests humains ont été réalisés. S’il reste une anomalie, corriger et relancer la phase concernée au lieu de passer à la suivante. Après `11-release`, le pipeline reste terminé ; toute distribution est une opération humaine distincte.

## Journaux et protections

Une exécution crée `logs/codex/<date-heure>-<identifiant>/`. Pour chaque étape :

- `<étape>.codex.jsonl` : sortie Codex et stderr filtrés, avec le code de sortie. Le filtrage et les lignes stderr peuvent empêcher une consommation comme JSONL strict ; ce fichier est un journal de diagnostic.
- `<étape>.result.json` : résultat structuré filtré.
- `<étape>.test.log`, `.lint.log`, `.build.log` : sorties des contrôles exécutés et codes de sortie.
- `<étape>.manual.md` : checklist au point d’arrêt humain.

Les journaux sont ignorés par Git. Le terminal affiche la progression, le résumé et les contrôles ; les détails des outils Codex restent dans le journal. Les valeurs ayant des formats de clés connus, Bearer, mots de passe ou assignations sensibles sont masquées avant écriture/affichage. Aucun dump de l’environnement ni lecture d’un fichier d’authentification n’est réalisé par le script.

Codex utilise `workspace-write`, aucune élévation (`never`), réseau des commandes désactivé, environnement enfant réduit aux variables système nécessaires, sans configuration utilisateur personnalisée et sans persistance de session. L’authentification CLI préexistante reste utilisée. Le réseau du service Codex est distinct du réseau interdit aux commandes de l’agent.

Les interdictions de publication, push, destruction du repository et accès aux secrets sont aussi prioritaires dans chaque prompt. **Un prompt ou un filtre de logs n’est pas une barrière de sécurité absolue face à du code arbitraire.** Les scripts npm, tests, prompts et dépendances doivent rester de confiance, et aucun secret réel ne doit se trouver dans le checkout ou l’environnement des contrôles. Le pipeline n’est pas un système de confinement de code malveillant. Il ne propose aucun mode danger-full-access ni option de contournement.

## Vérifier la syntaxe sans lancer le pipeline

```powershell
$tokens = $null
$syntaxErrors = $null
[System.Management.Automation.Language.Parser]::ParseFile(
    (Resolve-Path './scripts/run-codex-pipeline.ps1').Path,
    [ref]$tokens,
    [ref]$syntaxErrors
) | Out-Null
if ($syntaxErrors.Count) { throw 'Syntaxe PowerShell invalide.' }
'Syntaxe PowerShell valide'
```

Ce contrôle parse le fichier ; il n’exécute ni le pipeline ni Codex ni les scripts npm. Référence : [documentation officielle du mode non interactif Codex](https://developers.openai.com/codex/noninteractive).
