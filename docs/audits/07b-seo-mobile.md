# Étape 1 — SEO après conversion mobile

Audit du 4 octobre 2026. Spécification : `docs/codex/07b-seo-mobile.md`.

## Résultat

L'export statique conserve les 12 pages publiques, dont les cinq articles.
Les routes articles utilisent `generateStaticParams` et ne nécessitent aucun serveur.
Les composants Android sont isolés ; aucun serveur distant Capacitor n'est configuré.

Régression corrigée : un build web sans domaine produisait silencieusement des
canonicals, un sitemap et des données structurées en localhost. Le build web
exige désormais `SITE_URL` avec une origine HTTPS publique. Le propriétaire
n'a pas encore de domaine : aucune adresse publique FretLab n'est inventée.
`npm run build:android` permet l'export embarqué sans ce préalable web.

## Vérification

- 117 tests unitaires réussis ; lint sans warning ; build statique réussi.
- Build web vérifié avec `https://example.com`, exclusivement comme fixture de test.
- Les 12 pages exportées ont un titre et une description uniques, un canonical,
  un Open Graph URL cohérent, un seul H1 et un seul main.
- Sitemap et robots servis ; articles avec Article et BreadcrumbList ; seuls les
  articles possèdent une date de modification documentée.
- Article lisible avec JavaScript désactivé ; polices locales et fond FretLab chargé.
- Favicon, icon, apple icon et image sociale disponibles ; route inconnue en 404.
- Résultats navigateur : `07b-browser.json`.

## À configurer avant publication

Fournir le véritable domaine HTTPS via `SITE_URL`, reconstruire et vérifier
les URL du sitemap, des canonicals et du JSON-LD sur l'hébergement réel.
L'origine locale HTTPS de la WebView Android sert uniquement à l'exécution
embarquée ; elle ne représente jamais un domaine de publication web.

MANUAL TEST REQUIRED : affichage et navigation dans une WebView sur téléphone.
Cette étape ne prétend pas valider Android sur appareil.

Le dépôt comportait déjà des modifications non commitées de conversion Android
et d'automatisation. Le commit de cet audit contient uniquement ses changements.
