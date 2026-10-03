# SEO technique FretLab

Audit et vérification du build de production réalisés le 4 octobre 2026.

## Audit initial

Le template de titre, la description globale, `metadataBase`, les articles statiques et leurs données Article / BreadcrumbList existaient. Les outils et la page À propos n’avaient pas de canonical. L’accueil héritait seulement des métadonnées globales. Il manquait sitemap, robots, Twitter, image sociale et icône Apple.

## Configuration

Définir `SITE_URL=https://votre-domaine.example` dans l’environnement **avant le build**. Ne pas ajouter de chemin. Le prototype utilise `http://localhost:3000` par défaut ; remplacer cette valeur pour la publication. Aucun domaine public n’a été présumé.

`src/lib/metadata.ts` centralise les métadonnées des pages, le canonical et les valeurs Open Graph / Twitter. Chaque route fournit un titre et un résumé distincts. Les articles conservent le type Open Graph `article`, les dates réelles et leur propre image lorsqu’elle est renseignée.

`src/app/sitemap.ts` produit 12 URL : accueil, quatre outils, liste des articles, cinq articles et À propos. `lastModified` provient uniquement de `updatedAt` ou `date` pour les articles. Aucune date de build ou de fichier n’est présentée comme une modification éditoriale.

`src/app/robots.ts` autorise toutes les pages et tous les assets, avec un lien absolu vers le sitemap. La 404 renvoie `noindex` et propose des liens vers accueil, outils et articles.

Les seules données structurées sont Article et BreadcrumbList sur les articles, alimentées par leurs vraies métadonnées. Aucun schéma artificiel, score ou avis n’est ajouté.

## Images et performances

L’image de partage est un PNG local 1200 × 630 d’environ 33 Ko, avec sa source SVG dans `public/social/`. Favicon ICO, icône SVG et icône Apple PNG sont servis par les conventions Next.js. L’ICO a été vérifié par le build et par HTTP.

Les images éditoriales facultatives utilisent `next/image`, dimensions explicites et texte alternatif. Les illustrations de cartes sont décoratives et masquées aux lecteurs d’écran. Le chargement différé par défaut est conservé. Les illustrations actuelles sont des SVG/CSS sans téléchargement externe. Manrope utilise `next/font` et est servie localement avec une police de repli.

Les pages, le Markdown et les cartes restent des composants serveur. Le menu et le filtre de catégories sont de petites interfaces client ; les outils interactifs restent limités à leurs routes. Aucun parsing Markdown ni logique audio n’a été trouvé dans les scripts initiaux de la page article testée. La mesure comprend 8 scripts initiaux, environ 184 Ko compressés en gzip, framework Next/React compris. Pas de nouvelle dépendance ajoutée pour cette passe.

## Validation

- 116 tests unitaires réussis, lint sans avertissement et build réussi.
- Les 12 pages sont pré-rendues, les 5 articles via `generateStaticParams`.
- Crawl du build de production : 12 titres et descriptions distincts, un H1, un main, navigation et footer, canonicals et métadonnées sociales cohérents.
- Tous les liens internes rencontrés répondent en 200 ; toutes les pages publiques possèdent un lien entrant.
- Sitemap : 12 URL et 5 dates fiables ; robots : autorisation globale sans disallow.
- Lecture des articles sans JavaScript, JSON-LD cohérent, page inconnue en 404 avec noindex, icônes et image sociale en 200.
- Page article contrôlée à 390 px sans débordement ; aucune erreur React ; CLS local observé à 0.

Ces mesures locales ne constituent pas des Core Web Vitals de terrain. Le rapport HTTP et les mesures figurent dans `docs/seo-validation.json`. Après changement de domaine, reconstruire le site et vérifier les URL absolues sur le domaine publié.
