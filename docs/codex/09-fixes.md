Applique maintenant les corrections CRITICAL et HIGH de l'audit.

Préserver :

- comportement web
- comportement Android
- design
- fonctionnalités
- static export

Ne résous pas un bug Android en cassant le site web et inversement.

Après correction :

npm test
npm run lint
npm run build
npx cap sync android

Puis vérifie que le projet Android compile.

Donne la liste exacte des corrections appliquées.