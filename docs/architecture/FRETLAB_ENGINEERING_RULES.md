# Règles d’ingénierie FretLab

## Principes permanents

FretLab partage une seule codebase Next.js/TypeScript/React entre le Web
(fretlab.fr, Vercel) et Android (Capacitor). La cohérence musicale et métier
prime sur les raccourcis de code. Ne pas créer de variantes FeatureWeb et
FeatureAndroid sans contrainte technique démontrée. Isoler les adaptations
de plateforme ; conserver les composants métier et UI communs.

Les outils déterministes restent locaux et utilisables sans réseau dans
l’application Android. Cela s’appliquera aussi aux gammes, progressions,
tap tempo, boîte à rythmes, patterns et song mode. Ne pas introduire de serveur
obligatoire, de Server Actions ou d’API distante pour leurs calculs. Préserver
l’export statique Next.js, les routes pré-générées et les articles.

Comptes, synchronisation, favoris, groupes, setlists, tablatures, coach IA,
analyse musicale et backing tracks pourront nécessiter ultérieurement un
backend, PostgreSQL, stockage objet et traitements asynchrones. Ne pas les
implémenter par anticipation, ni ajouter Redis, microservices ou Kubernetes.

## Source de vérité musicale

`src/domain/music` est indépendant de React, du DOM, du stockage et de Capacitor :

- `pitch.ts` : PitchClass 0–11, NoteSpelling (lettre et altération), parsing
  des notes, tables dièses/bémols, transposition. L’identité sonore et
  l’orthographe sont séparées ; C# et Db partagent une pitch class mais pas
  leur spelling. Les doubles altérations ne sont pas encore supportées.
- `chords.ts` : grammaire stricte commune, modèle Chord (fondamentale,
  suffixe préservé, basse optionnelle), validation et transposition.
- `catalog.ts` : fondamentales proposées et neuf qualités du dictionnaire,
  suffixes canoniques et labels. Ce catalogue ne prétend pas décrire tous
  les accords acceptés par le transposeur.
- `query.ts` : adaptation des saisies de recherche (espaces, casse, alias
  français) vers le parsing commun. Cette tolérance ne s’applique pas aux paroles.

Ne pas recopier les tables de notes ou écrire une nouvelle grammaire d’accords
dans une feature. Les anciens points d’entrée restent des façades compatibles.
Le transposeur conserve la détection des contextes musicaux et la préservation
exacte des paroles dans sa feature. Le dictionnaire conserve ses positions
issues du dataset documenté et ne fabrique pas de doigtés pour les accords absents.

`intervals.ts` représente un intervalle par son degré et ses demi-tons.
`scales.ts` expose les définitions et le modèle Scale, avec pitch classes,
orthographe et intervalles. `fretboard.ts` mappe une gamme sur un Tuning et
une zone explicites. Réutiliser ces objets pour les futures progressions et
l’analyse harmonique. `harmony.ts` définit maintenant Key, l’harmonisation
des triades/septièmes et les pitch classes connues d’un accord. Le parser
reste unique ; les extensions non analysées ne reçoivent pas une qualité devinée.
`progression-model.ts`, `progression-templates.ts` et `progressions.ts`
représentent les mesures, les templates explicites et leur génération testable.
Les verrous filtrent des templates entiers ; aucun accord arbitraire ne doit
être introduit pour contourner une incompatibilité. Les emprunts harmoniques
et couleurs blues doivent rester explicitement distingués du diatonisme naturel.
Ne pas assimiler un intervalle diatonique
à son seul nombre de demi-tons ; conserver la tonalité et le degré pour choisir
une orthographe correcte (une préférence globale dièse/bémol ne suffit pas).
Ne pas inventer aujourd’hui des modèles inutilisés ni une implémentation
approximative des qualités à partir du suffixe brut.

Les conversions MIDI/fréquence résident dans `domain/music/midi.ts` et les
accordages explicites dans `domain/music/tuning.ts`. Ils sont partagés par
l’accordeur et le visualiseur de gammes ; l’ancien point d’entrée de l’accordeur
réexporte les conversions pour préserver ses consommateurs. Les fonctions de tempo et signatures
résident dans `features/metronome/rhythm.ts` ; même règle de réutilisation.
Le 6/8 actuel compte les BPM à la noire pointée avec trois subdivisions :
préserver cette convention et représenter explicitement l’unité de pulsation
si de nouvelles fonctionnalités l’exigent. Les limites 40–240 sont celles
du métronome actuel, pas une règle universelle de la musique.

## État, stockage, audio et interface

Les composants React orchestrent et affichent ; les fonctions musicales pures
doivent être testables sans navigateur. Ajouter une abstraction de repository
uniquement lorsqu’une feature sauvegarde réellement des données. Ne pas appeler
localStorage/IndexedDB directement dans les composants. Par exemple un
PatternRepository local pourra recevoir plus tard un adaptateur distant,
sans déplacer les règles métier dans l’UI. Prévoir validation/versionnement
des données persistées lorsque cette persistance est introduite.

Conserver le scheduler fondé sur l’horloge AudioContext, la libération des
ressources audio et les arrêts en arrière-plan. `NativeLifecycle` isole les
événements Capacitor ; `useAudioPause` les rend disponibles aux outils audio.
Ne pas disperser les conditions de plateforme. Le microphone est volontaire,
traité localement, sans stockage ni transmission.

Préserver la charte graphique, les zones tactiles, les safe areas et le clavier.
Portrait prioritaire, paysage utilisable. Ne jamais transmettre une information
uniquement par couleur. Vérifier foreground/background et absence de réseau
sur appareil réel ; marquer MANUAL TEST REQUIRED si non testé physiquement.

## SEO, performances et validation

Chaque nouvel outil public doit avoir une route, un title, une description,
une canonical, une entrée sitemap et des liens internes. Conserver les pages
éditoriales pré-rendues. Pas de dépendance musicale/audio lourde pour des
opérations simples, ni de bundle client global : imports ciblés et séparation
naturelle par route/feature. Lire les guides Next.js locaux avant modification.

Toute nouvelle logique métier doit avoir des tests de résultats musicaux
vérifiables, y compris enharmonies et erreurs de saisie. Exécuter tests, lint,
typecheck, build Web et export Android ; synchroniser Capacitor si approprié.
Un build réussi n’est pas une validation sur téléphone. Ne pas déployer, pousser
ou créer une release sans instruction explicite. Ne pas modifier les secrets.
Après un build Web destiné au déploiement, régénérer la CSP sur cet export exact.

## Audit et périmètre de cette consolidation

Avant cette étape : trois représentations des notes (transposeur, accordeur,
dictionnaire), parsing réparti entre transposeur et recherche, qualités liées
au modèle de doigtés. Les tests existaient déjà pour les outils et les données.
Le domaine musical, les hooks et les pipelines audio étaient déjà séparés.
Pas de persistance locale dispersée détectée ; une intégration Capacitor
centralisée et un hook d’arrêt audio commun sont déjà présents.

Cette étape mutualise les notes et le parsing, extrait le catalogue des
qualités et conserve des façades pour les consommateurs existants. Aucun
dataset, pipeline audio, scheduler, rendu, route, article ou comportement
de plateforme n’est réécrit. Aucun repository générique, Scale, Key ou moteur
rythmique supplémentaire n’est créé avant un besoin effectif.

Validation de cette étape : 138 tests réussis, lint et typecheck réussis,
export Android puis `pnpm exec cap sync android` et `pnpm run android:check`
réussis (12 routes, 108 fichiers synchronisés). Build Web avec
`SITE_URL=https://fretlab.fr` réussi et CSP Report-Only régénérée sur cet export.
Le premier essai de build était bloqué par le téléchargement réseau de Manrope ;
la relance avec accès réseau a réussi sans modification des polices.
`out/` contient finalement le build Web ; les assets Android synchronisés
proviennent du build Android précédent. Aucun APK ni déploiement n’a été produit.
MANUAL TEST REQUIRED : vérification sur téléphone des quatre outils hors ligne,
du microphone, du retour Android et des transitions arrière-plan/premier plan.
