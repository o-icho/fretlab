# Feature flags

## Configuration commune
src/config/features.ts est la source versionnée des flags de build Web et Android.
FeatureId est dérivé des clés de featureFlags :
chordDictionary, metronome, tuner, transposer, scales, chordProgressions,
drumMachine, backingTracks.

Les six outils actifs restent disponibles. chordProgressions et drumMachine sont
false. Pour réactiver la boîte à rythmes : drumMachine: true. Pour désactiver
un outil : mettre son booléen à false. Rebuild/déploiement Web et export Android,
cap sync puis nouvelle application sont nécessaires. Aucun flag réseau.

Le même fichier contient le registre (id, href, slug, name, short, description,
icon, color, number). Le booléen n'est pas recopié dans les métadonnées.
Helpers : isFeatureEnabled, getFeatureDefinition, getEnabledFeatures.
src/lib/content.ts est une façade compatible, toujours filtrée : header, menu
mobile, footer, homepage et recommandations existantes consomment cette liste.
Le sitemap lit également le registre. Pas de navigation spécifique Android.

## Routes et liens
Chaque route outil appelle featureRouteFallback (src/config/requireFeature.ts)
avant de rendre son interface. Une feature désactivée affiche uniquement
« Fonctionnalité indisponible », un retour accueil et une meta robots noindex,
nofollow. Le rendu est statique et ne dépend pas de JavaScript pour bloquer
l'outil. Les routes peuvent répondre HTTP 200 en hébergement statique :
ce n'est pas une garantie de vrai statut HTTP 404.

Ce choix est volontaire : notFound() sur cette version de Next/export produisait
un document d'erreur sans page pré-rendue utilisable pour la validation Android.
Aucun code métier n'est supprimé. Les flags contrôlent l'expérience publique,
pas l'autorisation de sécurité ou la confidentialité du code livré.

FeatureLink lie les recommandations à un FeatureId. Les CTA d'articles ne sont
rendus que si leur outil est actif. Les liens Markdown vers un outil désactivé
deviennent du texte sans lien. Aucun article actuel ne cite les deux outils
désactivés. Les slugs tool des articles existants sont conservés, résolus via le
registre pour ne pas imposer une migration de contenu sans besoin.

Pour ajouter une feature : ajouter son flag et sa définition, protéger sa route
avec featureRouteFallback et utiliser FeatureLink pour ses liens éditoriaux.
Les listes et le sitemap se mettent automatiquement à jour.

## Limites délibérées
Les textes et metadata SEO propres à chaque page restent dans leur route :
ils ne constituent pas une seconde liste de features.
Le flag éditorial NEXT_PUBLIC_BACKING_TRACK_ADMIN_ENABLED reste séparé : il
contrôle un écran d'import local, pas un outil public, et conserve son comportement.
Il est subordonné à backingTracks pour l'accès à la route.
Aucune gestion premium, compte ou plateforme n'est implémentée.

## Validation
pnpm test ; pnpm run lint ; pnpm run typecheck.
pnpm run build:android ; pnpm run android:sync ; pnpm run android:check.
SITE_URL doit être configuré pour pnpm run build:secure (Web + CSP).
Vérifier les liens publics, sitemap, articles et accès directs désactivés.
MANUAL TEST REQUIRED : validation finale sur téléphone Android physique.
