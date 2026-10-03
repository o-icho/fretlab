# Publier un article FretLab

Les articles sont des fichiers Markdown dans `content/articles/`. Le nom du fichier doit correspondre au slug. Ajouter un fichier, puis reconstruire et redéployer le site : aucun CMS, compte ou service externe n’est nécessaire.

```yaml
---
title: "Titre de l’article"
description: "Résumé pour le lecteur et les moteurs de recherche."
slug: mon-article
date: "2026-10-03"
author: FretLab
category: Pratique
tags: [guitare, débutant]
tool: accords
art: chord
---
```

`tool` : accords, metronome, accordeur ou transposeur. `art` : chord, rhythm ou strings. Ajouter `updatedAt: "YYYY-MM-DD"` uniquement pour une modification éditoriale réelle. Les dates doivent être entre guillemets. Image facultative : `image: { src: /images/mon-image.webp, alt: Description, width: 1200, height: 675 }`, avec le fichier dans `public/images/`.

Utiliser h2/h3 (le h1 est automatique), listes, tableaux GFM et citations `>` pour les conseils. Le HTML brut est ignoré et aucun JavaScript MDX n’est exécuté. Ajouter un lien vers l’outil choisi et un autre article existant. Le build valide les métadonnées, le contenu et les liens d’articles ; les ancres sont calculées depuis les vrais titres Markdown.

Copier `.env.example` en `.env.local` puis définir `SITE_URL` avec l’origine publique avant le build de production. Le prototype utilise `http://localhost:3000` par défaut. Cette valeur alimente canonical, Open Graph et JSON-LD ; elle ne doit pas contenir de chemin.

Les fonctions `getAllArticles`, `getArticleBySlug` et `getRelatedArticles` lisent le contenu côté serveur. Les pages sont pré-rendues via `generateStaticParams`, les slugs inconnus retournent 404. Le filtre de catégories est le seul composant client et reçoit des cartes rendues côté serveur. La durée de lecture estime 200 mots/minute.

Avant publication : `pnpm test`, `pnpm lint`, `pnpm build`. Les tests contrôlent aussi le maillage, les métadonnées et les données structurées.
