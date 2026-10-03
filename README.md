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
En production locale, arrêter `pnpm start` avant de relancer `pnpm build`, puis
redémarrer `pnpm start` : le processus doit charger les nouveaux noms de fichiers
CSS/JavaScript. Ne pas garder un ancien serveur de production actif après un build.

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

Les routes sont prérendues ; les interfaces interactives des quatre outils et le menu mobile sont des composants clients. Aucun backend applicatif, base de données, compte, analytics ou appel LLM. Les illustrations SVG et CSS sont locales, sans dépendance graphique. L’accordeur traite le microphone uniquement en mémoire dans le navigateur, sans transmission ni enregistrement.

Manrope est chargée via `next/font/google` et servie localement en production. Le premier build nécessite l’accès aux serveurs de polices Google. TypeScript est en mode strict et ESLint utilise les règles Next.js Core Web Vitals et TypeScript.

## Accessibilité et SEO

Langue française, HTML sémantique, lien d’évitement, focus visible, état de navigation courant, menus utilisables au clavier, réduction des mouvements et métadonnées propres à chaque page. Les articles possèdent des liens internes, un sommaire, des métadonnées Open Graph et des données structurées Article / BreadcrumbList.

Définir `SITE_URL` avec le domaine public avant un build de production. Le prototype utilise `http://localhost:3000` pour les canonicals. Voir [le guide éditorial](docs/editorial.md) pour ajouter et publier un article.

Le sitemap et robots.txt sont générés par l’App Router. Métadonnées Open Graph / Twitter, image sociale locale, favicon et icône Apple sont inclus. Voir [l’audit SEO technique](docs/seo.md) pour les décisions et les vérifications.

Les quatre outils possèdent des tests unitaires : transposition, rythmes et scheduler, données des accords, conversions musicales et détection YIN avec buffers synthétiques. `pnpm test` lance toute la suite sans dépendance de test externe. Vérifier également le lint, les types et le build, puis les interactions et l’absence de débordement sur mobile/tablette/desktop.
