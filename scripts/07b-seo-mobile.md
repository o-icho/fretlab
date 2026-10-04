Depuis le dernier audit SEO, le projet FretLab a été modifié pour supporter
également une application Android via Capacitor.

Le même repository doit maintenant produire :

1. le site web Next.js
2. un export statique utilisé par Capacitor Android

Avant de poursuivre, vérifie que cette conversion n'a introduit aucune
régression sur la version web et son SEO.

AUDITER NOTAMMENT :

- next.config.*
- output: "export"
- routes statiques
- routes articles dynamiques
- generateStaticParams si nécessaire
- metadata Next.js
- title
- descriptions
- canonical
- Open Graph
- sitemap.xml
- robots.txt
- JSON-LD
- BreadcrumbList
- Article structured data
- favicon
- images
- URLs internes

Vérifier que tous les articles sont encore générés au build.

Vérifier que :

npm run build

produit correctement le dossier :

out/

Vérifier également que les URLs du site public ne contiennent jamais
de chemin Android/Capacitor ou de référence localhost.

IMPORTANT :

La version Android ne doit pas dégrader le SEO de la version web.

Les adaptations spécifiques Android doivent rester isolées lorsqu'elles
ne concernent pas le site.

Corrige uniquement les régressions réellement trouvées.

À la fin :

- tests
- lint
- build

et donne-moi un résumé des vérifications effectuées.