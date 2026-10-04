# Générateur de progressions

Route `/outils/progressions/`, calculs locaux identiques pour Web et Android.
Aucune IA, requête serveur, persistance ou nouvelle dépendance musicale.

## Modèle métier

`domain/music/harmony.ts` introduit Key (tonique orthographiée, mode majeur ou
mineur, gamme structurée). L’harmonisation empile tierce, quinte et éventuellement
septième dans la gamme existante ; elle reconnaît la qualité obtenue à partir
des intervalles. Notes, enharmonies, suffixes et parsing réutilisent le noyau
commun. Les qualités du dictionnaire ne sont pas étendues artificiellement
pour proposer des doigtés non disponibles ; le modèle harmonique ajoute m7b5
pour les septièmes demi-diminuées.

Une HarmonyChord contient le symbole affiché, le Chord parsé, sa qualité et ses
pitch classes connues. Les notes de basse des slash chords participent à
l’analyse. Les extensions non analysées restent valides comme symboles, avec
une analyse explicitement indisponible : aucune qualité n’est devinée.

`progression-model.ts` définit Progression et ProgressionBar. Chaque mesure
contient un accord structuré, le degré et son chiffre romain, le statut
diatonique, une éventuelle altération déclarée, son verrou et son état édité.
La progression conserve la tonalité, la famille et le template d’origine.
La chaîne `Am | F | C | G` n’est qu’une vue produite par `formatProgression`.
Les données sont sérialisables sans React ni dépendance à un futur backend.

## Bibliothèque de templates

Source de vérité : `domain/music/progression-templates.ts`. Un pas représente
une mesure ; les phrases de deux ou quatre mesures peuvent se répéter sur
huit mesures. Les douze mesures ont des templates dédiés, sans remplissage
automatique d’une boucle quelconque.

| Template | Mode / familles | Forme | Longueurs |
| --- | --- | --- | --- |
| pop-axis | Majeur · Pop/Rock | I V vi IV | 4, 8 |
| pop-doowop | Majeur · Pop | I vi IV V | 4, 8 |
| pop-relative | Majeur · Pop/Rock | vi IV I V | 4, 8 |
| rock-three | Majeur · Rock | I IV V IV | 4, 8 |
| minor-pop-rock | Mineur · Pop/Rock | i VI III VII | 4, 8 |
| minor-descending | Mineur · Pop/Rock | i VII VI VII | 4, 8 |
| minor-dominant | Mineur · Rock | i iv VI V | 4, 8 |
| blues-major-loop | Majeur · Blues | I7 IV7 I7 V7 | 4, 8 |
| blues-major-12 | Majeur · Blues | I7 I7 I7 I7 / IV7 IV7 I7 I7 / V7 IV7 I7 V7 | 12 |
| blues-major-quick | Majeur · Blues | I7 IV7 I7 I7 / IV7 IV7 I7 I7 / V7 IV7 I7 V7 | 12 |
| blues-minor-loop | Mineur · Blues | i7 iv7 i7 V7 | 4, 8 |
| blues-minor-12 | Mineur · Blues | i7 i7 i7 i7 / iv7 iv7 i7 i7 / V7 iv7 i7 V7 | 12 |
| blues-minor-quick | Mineur · Blues | i7 iv7 i7 i7 / iv7 iv7 i7 i7 / V7 iv7 i7 V7 | 12 |
| soul-major-vamp | Majeur · Soul-Funk/Blues | I7 IV7, répété | 4, 8 |
| soul-major-cadence | Majeur · Soul-Funk | ii7 V7 Imaj7 Imaj7 | 4, 8 |
| soul-minor-vamp | Mineur · Soul-Funk | i7 iv7, répété | 4, 8 |
| soul-minor-cadence | Mineur · Soul-Funk | iiø7 V7 i7 i7 | 4, 8 |

Les familles sont des filtres pratiques, pas une analyse universelle des genres.
Les dominantes majeures V/V7 en mineur portent l’altération
`harmonic-minor-dominant` : leur tierce utilise la sensible haussée. Les
septièmes dominantes de couleur blues portent `blues-dominant`. L’appartenance
à la gamme reste calculée sur les notes réelles : en C majeur, C7 et F7 sont
non diatoniques, tandis que G7 est diatonique. Ne pas confondre septième
dominante, qualité majeure et accord diatonique naturel.

Références : [analyse en chiffres romains](https://www.musictheory.net/lessons/44),
[forme blues](https://pulse.berklee.edu/?id=4&lesson=7).
Les exemples majeurs/mineurs et toutes les transpositions sont vérifiés dans
`harmony.test.mjs` et `progressions.test.mjs`, avec les notes attendues.

## Génération et verrous

`generateProgression` reçoit une source aléatoire explicite. L’UI fournit
Math.random ; les tests utilisent `createSeededRandom(seed)` ou une valeur
fixe. Le moteur choisit un template entier, jamais des accords indépendants.
Il exclut les résultats musicalement identiques au précédent.

Les verrous filtrent les templates sur les accords, qualités et basses des
mesures correspondantes. Les mesures verrouillées sont conservées exactement.
S’il ne reste aucun template, ou aucune autre progression, le moteur retourne
un résultat d’échec explicite ; la grille actuelle reste intacte. Changer
tonalité, mode ou longueur avec des verrous impose de déverrouiller d’abord.
Aucune substitution silencieuse ni tentative de « réparer » une grille libre.

`editProgressionBar` est indépendant de React. L’édition propose les triades
et septièmes diatoniques, puis une saisie libre utilisant le parser commun.
Les accords hors tonalité sont autorisés et signalés. Une mesure verrouillée
ne peut pas être éditée. Les mesures modifiées mais déverrouillées pourront
être remplacées à la prochaine génération, comme les autres mesures libres.

## Interface et intégrations

`ProgressionGenerator.tsx` orchestre les contrôles, la grille et l’éditeur.
Les réglages modifiés s’appliquent avec Générer ; le titre de la grille
continue à indiquer sa tonalité réelle tant que la génération n’a pas réussi.
Les boutons de verrouillage sont utilisables au clavier ; l’état est aussi
affiché en texte. La grille se répartit sur deux colonnes sur mobile.

Voir la gamme ouvre le visualiseur avec la tonique et la gamme majeure/mineure
naturelle. Le texte indique que les accords altérés peuvent contenir d’autres
notes : ce lien ne prétend pas résoudre « que jouer sur tous ces accords ».
Transposer transmet le texte via le paramètre `text` au transposeur existant.
`TransposerFromUrl` est un adaptateur sous Suspense compatible avec l’export
statique ; le parsing et la transposition restent dans le moteur commun.

Une analyse harmonique, un song builder ou une sauvegarde future pourra
consommer Progression et ses mesures, sans reparsing du texte de l’UI.
Un futur moteur rythmique pourra y associer durées/signatures lorsqu’elles
seront nécessaires. Aucun compte, faux stockage utilisateur ou backend n’est
créé à cette étape.

## Recette

Exécuter tests, lint, typecheck, build Web/CSP, export Android, cap sync et
android:check. Vérifier génération, édition, verrous bloquants, copie et
liens outils dans le navigateur, avec réseau coupé après chargement.
MANUAL TEST REQUIRED : démarrage Android hors réseau, navigation vers l’outil,
édition au clavier virtuel, copie depuis la WebView, retour Android,
portrait/paysage et reprise après passage en arrière-plan.

Validation de cette implémentation : 177 tests réussis (dont 21 tests
d’harmonisation et de progressions), lint et typecheck réussis. Build Web
statique et export Android réussis ; Capacitor synchronisé, `android:check`
valide 14 routes et 122 fichiers. La CLI Capacitor a été appelée directement
avec Node : le lanceur pnpm de cet environnement ne résolvait pas `cap`.
Le navigateur a vérifié génération, verrous compatibles et bloquants,
édition diatonique/libre et rejet d’une saisie invalide, copie avec/sans
degrés, intégrations transposeur/gammes et blues de douze mesures. Les calculs
et l’édition fonctionnent réseau coupé après chargement. Aucun débordement
horizontal à 320, 390, 768, 844 et 1440 px, aucune erreur React observée.
Ces contrôles navigateur ne remplacent pas la recette sur téléphone.
L’export final `out/` est celui du Web ; la CSP Report-Only est régénérée sur
ce build. Les fichiers Android synchronisés proviennent de l’export Android.
