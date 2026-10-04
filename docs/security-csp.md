# CSP de l’export statique

La politique reste `Content-Security-Policy-Report-Only`. Le générateur remplace
uniquement `script-src` dans `vercel.json`, sans autoriser `unsafe-inline` ou
`unsafe-eval`. Les autres directives et headers sont conservés.

`scripts/generate-csp.mjs` parcourt tous les HTML de `out/`, y compris les pages
404. Le parseur HTML `parse5` distingue les scripts exécutables des scripts avec
`src`, du JSON-LD, des blocs de données et du contenu inerte. Le hash SHA-256
porte sur la tranche exacte du fichier source, jamais sur un texte normalisé
par le parseur. Les hashes sont dédupliqués et remplacés à chaque génération.
Le script échoue sans modifier la configuration si l’export ou la politique
ne peut pas être analysé correctement.

## Vérification locale (PowerShell)

Depuis la racine du repository, avec Node et pnpm disponibles :

```powershell
pnpm test
pnpm lint
pnpm typecheck
$env:SITE_URL = 'https://fretlab.fr'
$env:FRETLAB_BUILD_TARGET = 'web'
pnpm run build
if ($LASTEXITCODE -ne 0) { throw 'Build échoué' }
pnpm run security:csp
if ($LASTEXITCODE -ne 0) { throw 'Génération CSP échouée' }
$env:PORT = '3001'
pnpm run preview:csp
```

`pnpm run build:secure` enchaîne build puis génération CSP et s’arrête si le
build échoue. Aucun hook récursif n’est utilisé. Le build Android reste séparé.

Ouvrir `http://127.0.0.1:3001/` et les pages outils/articles. Dans les outils de
développement, vérifier le header de la réponse HTML et les éventuels rapports
CSP dans la console. Tester les interactions après hydratation. La commande
`preview:csp` sert l’export avec le vrai header Report-Only ; `next dev` ne
représente pas cet export. Redémarrer le preview après une régénération.

`style-src 'self'` est volontairement conservé : les styles inline peuvent
encore produire des rapports. Cette étape couvre les scripts, pas la résolution
des rapports concernant les styles. Report-Only ne bloque pas les ressources.

## Tester sur Vercel sans reconstruire l’export

Les hashes appartiennent à un build précis. Ne pas déployer un nouveau build
avec les hashes d’un export précédent. Pour tester cette politique, préparer
un dossier statique contenant **le même `out/`** et sa configuration générée.
Cela évite de dépendre d’une modification de `vercel.json` pendant un build distant.

Après les commandes de build et génération réussies ci-dessus :

```powershell
$deploy = Join-Path $env:TEMP ('fretlab-csp-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $deploy | Out-Null
Copy-Item -Path ./out/* -Destination $deploy -Recurse
$config = Get-Content ./vercel.json -Raw | ConvertFrom-Json
$config | Add-Member -NotePropertyName framework -NotePropertyValue $null -Force
$config | Add-Member -NotePropertyName buildCommand -NotePropertyValue '' -Force
$config | Add-Member -NotePropertyName installCommand -NotePropertyValue '' -Force
$config | Add-Member -NotePropertyName outputDirectory -NotePropertyValue '.' -Force
$config | ConvertTo-Json -Depth 100 | Set-Content (Join-Path $deploy 'vercel.json') -Encoding utf8
pnpm dlx vercel --cwd $deploy
```

Utiliser PowerShell 7 pour ces commandes. Sélectionner le projet FretLab
existant lorsque la CLI Vercel demande de lier le dossier. La configuration
de déploiement supplémentaire est écrite uniquement dans le dossier temporaire ;
les headers restent identiques. Vérifier le preview Vercel avant la production.
Ces commandes déploient réellement : elles sont documentées, pas exécutées par
la génération CSP.

Lorsque vous décidez explicitement de publier **ce même dossier** :

```powershell
pnpm dlx vercel --cwd $deploy --prod
curl.exe -I https://fretlab.fr/
curl.exe -I https://fretlab.fr/outils/accordeur/
```

Vérifier sur les réponses de production la présence de
`Content-Security-Policy-Report-Only`, la directive générée et l’absence d’un
header CSP imposé ajouté ailleurs. Parcourir toutes les routes et examiner les
rapports `script-src` dans Chrome, puis tester les interactions. Une extension
du navigateur ou un script injecté par l’hébergement peut produire ses propres
rapports : ne pas ajouter automatiquement ses hashes.

Références : [configuration Vercel](https://vercel.com/docs/project-configuration/vercel-json),
[configuration du build](https://vercel.com/docs/builds/configure-a-build),
[CLI de déploiement](https://vercel.com/docs/cli/deploy).
