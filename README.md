# FretLab

Prototype de la boîte à outils gratuite du guitariste. Les quatre outils sont fonctionnels côté navigateur ; les articles sont publiés depuis des fichiers Markdown locaux.

## Démarrer

Node.js 22.18 minimum et pnpm sont nécessaires (tests TypeScript natifs).

```sh
pnpm install
pnpm dev
```

Ouvrir http://127.0.0.1:3000.

Le serveur de développement utilise `.next-dev` et le build de production utilise
`.next`, pour éviter qu’un build écrase les styles d’une session de développement.
`pnpm build` exporte aussi le site autonome dans `out/`. `pnpm start` sert ce dossier
sans serveur Next.js ; `next start` n’est plus utilisé. Le même export est embarqué
dans Android avec Capacitor. Voir [le guide Android](docs/android.md).

Tailwind CSS et `@tailwindcss/postcss` sont en version 4.3.3 (voir le lockfile).
La configuration v4 repose sur `@import "tailwindcss"`, les tokens `@theme inline`
et le plugin PostCSS `@tailwindcss/postcss`. Aucun fichier de configuration v3 ni
directive `@tailwind base/components/utilities` n’est nécessaire.

```sh
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm start
```

## Architecture

- `src/app` : App Router, layout commun, accueil, articles, à propos, quatre routes outils et page 404.
- `src/components` : Header, Footer, Container, Button, SectionTitle, ToolCard ; présentations partagées des articles et des pages d’attente.
- `src/lib/content.ts` : données typées des outils.
- `content/articles` : contenu Markdown et métadonnées YAML.
- `src/features/articles` : lecture et validation côté serveur, recherche, articles associés, SEO, rendu Markdown et filtre de catégories.
- `src/features/chords`, `metronome`, `tuner`, `transposer` : logique, interfaces et tests propres à chacun des outils.
- `src/app/globals.css` : Tailwind CSS 4, tokens de couleur et styles responsives.

Les routes sont prérendues ; les interfaces interactives des outils et le menu mobile sont des composants clients. Pas de base de données, compte ou appel LLM. L'envoi des contributions audio utilise une fonction serveur dédiée (voir [le guide](docs/backing-track-submissions.md)). Les illustrations SVG et CSS sont locales, sans dépendance graphique. L’accordeur traite le microphone uniquement en mémoire dans le navigateur, sans transmission ni enregistrement.

## Mesure d'audience Web

`@vercel/analytics` est intégré globalement via `Analytics` de
`@vercel/analytics/next` dans `src/app/layout.tsx`, qui reste un Server Component.
Il est rendu uniquement lors d'un build Web de production Vercel
(`NODE_ENV=production`, `VERCEL_ENV=production`, cible `FRETLAB_BUILD_TARGET`
absente ou `web`). Les builds Android (`build:android`), le développement local
et les previews ne l'activent pas. L'export statique reste inchangé.

Dans Vercel, ouvrir **Analytics / Web Analytics**, sélectionner le projet FretLab,
puis cliquer **Enable** si ce n'est pas déjà activé. Après un prochain déploiement
de production, visiter `https://fretlab.fr` et naviguer entre plusieurs pages.
Les statistiques (visiteurs, pages vues, pages, référents, pays et appareils)
apparaissent ensuite dans ce tableau de bord ; aucune donnée rétroactive n'est
collectée. Les bloqueurs de contenu peuvent empêcher la mesure.
Vérifier dans l'onglet Réseau du navigateur le chargement du script Analytics
et ses requêtes sur le domaine du site (`/_vercel/insights/*` ou la route
générée par Vercel). L'activation prend effet après déploiement, pas sur localhost.

Aucun événement métier personnalisé, cookie marketing, identifiant utilisateur,
Google Analytics ou bannière n'est ajouté. Seule l'intégration standard Vercel
Web Analytics est utilisée. Aucune clé API n'est nécessaire. La CSP existante
autorise déjà les scripts et connexions de même origine.
Voir [le guide officiel](https://vercel.com/docs/analytics/quickstart).

Manrope est chargée via `next/font/google` et servie localement en production. Le premier build nécessite l’accès aux serveurs de polices Google. TypeScript est en mode strict et ESLint utilise les règles Next.js Core Web Vitals et TypeScript.

## Accessibilité et SEO

Langue française, HTML sémantique, lien d’évitement, focus visible, état de navigation courant, menus utilisables au clavier, réduction des mouvements et métadonnées propres à chaque page. Les articles possèdent des liens internes, un sommaire, des métadonnées Open Graph et des données structurées Article / BreadcrumbList.

Définir `SITE_URL` avec le domaine public avant un build de production. Le prototype utilise `http://localhost:3000` pour les canonicals. Voir [le guide éditorial](docs/editorial.md) pour ajouter et publier un article.

Le sitemap et robots.txt sont générés par l’App Router. Métadonnées Open Graph / Twitter, image sociale locale, favicon et icône Apple sont inclus. Voir [l’audit SEO technique](docs/seo.md) pour les décisions et les vérifications.

Les quatre outils possèdent des tests unitaires : transposition, rythmes et scheduler, données des accords, conversions musicales et détection YIN avec buffers synthétiques. `pnpm test` lance toute la suite sans dépendance de test externe. Vérifier également le lint, les types et le build, puis les interactions et l’absence de débordement sur mobile/tablette/desktop.
