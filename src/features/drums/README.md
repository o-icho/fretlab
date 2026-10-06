# Boîte à rythmes V1

Route `/outils/boite-a-rythmes/`. Batterie synthétique locale, onze patterns,
sans samples, CDN, IA ou backend. Sauvegarde locale des patterns utilisateur.
Même moteur et interface sur Web et
Capacitor Android. Le kit Basic est électronique, sans promesse de réalisme acoustique.

## Temps et transport

`features/audio/AudioScheduler.ts` est partagé avec le métronome : réveil toutes
les 25 ms, horizon de 100 ms, programmation sur `AudioContext.currentTime`.
Le timer remplit l’horloge audio, il ne déclenche pas directement les coups.
Une seule chaîne de timers et une seule animation par lecteur. Les événements
visuels utilisent l’horloge de sortie et sa latence ; seule la grille s’abonne
au store, actualisé au changement de pas, pas à chaque frame.

`domain/rhythm/drums.ts` planifie les pas et les coups sans navigateur. Une
frappe passée après un retard du scheduler est ignorée, jamais rattrapée en
rafale. Les cycles anciens peuvent être sautés sans boucle proportionnelle
à la durée du retard. Les limites 40–240 et le clamp sont partagés dans
`domain/rhythm/tempo.ts`, réexportés par l’ancien module du métronome.

Lecture démarre au premier pas, 40 ms dans le futur. Stop annule timers,
animation, voix déjà programmées, décompte et changement en attente. Le BPM
affecte les pas non encore programmés, sans recréer le scheduler. Le pattern
choisi est appliqué au prochain début de mesure non encore programmé (une
frontière située dans les 100 ms déjà préparées peut être dépassée). Plusieurs
choix successifs remplacent la demande en attente. La grille d’édition affiche
le brouillon immédiatement, nomme le pattern encore audible et indique les
modifications en attente. Le pas courant s’affiche quand ce brouillon est joué.
Un pattern à plusieurs
mesures peut être remplacé au début de toute mesure, pas seulement de son cycle.

## Modèle et signatures

`DrumPattern` contient id, nom, style, description, meter, nombre de mesures,
subdivision et pistes. `DrumTrack` associe un instrument à des événements.
Chaque événement représente une position **bar / beat / part** (indices à zéro)
et une vélocité entre 0 exclu et 1 inclus. La subdivision compte les parts par
unité écrite ; le meter déclare beats, beatUnit et pulseBeats :

| Signature | beats / beatUnit | pulseBeats | Unité du BPM | Exemple de grille |
| --- | --- | --- | --- | --- |
| 4/4 | 4 / 4 | 1 | noire | 16 doubles croches ou 12 triolets |
| 3/4 | 3 / 4 | 1 | noire | 6 croches |
| 6/8 | 6 / 8 | 3 | noire pointée | 6 croches, deux pulsations |

Le décompte de 0, 1 ou 2 mesures utilise un clic par pulsation (4, 3 ou 2),
accentue le début de mesure et ne joue aucun instrument. La grille montre les
subdivisions ; le nombre de pulsations du 6/8 n’est pas confondu avec ses six
croches. L’option de décompte se règle avant Lecture.

## Presets

`presets.ts` définit des formes simples originales, vérifiées par leurs
positions, plutôt que des reproductions d’enregistrements. Son helper compact
de création de pistes se transforme immédiatement en événements structurés.

| Famille | Preset | Caractéristique |
| --- | --- | --- |
| Rock | Basic Rock | kick 1/3, snare 2/4, hi-hat en croches |
| Rock | Driving Rock | relances de kick et crash |
| Rock | Half-Time Rock | snare sur 3, tempo inchangé |
| Blues | Straight Blues | kick sur les quatre temps, croches droites |
| Blues | Shuffle Blues | triplets, première et troisième subdivisions, rapport 2:1 |
| Blues | Slow Blues | 6/8, kick première pulsation, snare seconde |
| Funk | Basic Funk | syncopes de kick, ghost notes, doubles croches |
| Metal | Heavy | groupes de kicks en doubles croches |
| Metal | Thrash | croches de kick et snare sur les contretemps en croche |
| Pop | Basic Pop | quatre kicks, ouverture de hi-hat en fin de mesure |
| Pop | Pop Waltz | 3/4, snare sur 2 et 3 |

## Son et cycle de vie

`DrumSoundProvider` reçoit instrument, temps absolu et vélocité. `DrumPlayer`
accepte une factory de kit : un futur SampleBasedDrumKit pourra charger des
assets à licence compatible puis respecter ce même contrat. Aucune dépendance
du transport aux oscillateurs, aux filtres ou aux buffers.

`BasicDrumKit` combine kick avec enveloppe de pitch, snare bruit + sinus,
hi-hats bruit filtré et crash bruit avec décroissance longue. Les charlestons
fermés étouffent les ouverts à leur temps programmé. Le modèle prévoit ride
et toms ; leurs voix synthétiques sont disponibles sans ajouter de pistes UI
aux presets V1. Les vélocités modulent l’amplitude ; seul le volume général
est exposé. Chaque source a un arrêt programmé et déconnecte ses nœuds à sa fin.
Stop détruit aussi les voix futures ; le démontage ferme l’AudioContext.

`useDrumMachine` détient une seule source de vérité des réglages. Le composant
Tap Tempo du métronome la met à jour directement. Les démarrages asynchrones
annulés ne peuvent pas réactiver un lecteur arrêté. `useAudioPause` réutilise
le cycle de vie Web/Android : arrière-plan = Stop, retour = reste arrêté.

## Extensions et validation

Le Pattern Editor modifie les mêmes événements et vélocités ; les fills
pourront utiliser plusieurs mesures ou des changements de patterns aux
frontières. Une future variation temporelle devra être bornée et seedable.
Le Backing Track Builder pourra consommer ce transport et ces données en
ajoutant sa propre orchestration ; aucune basse/guitare n’est créée ici.

Tests métier : conversions 4/4, 3/4, 6/8, triplets, BPM, limites, décompte,
vélocités, boucles multimesures, file de changement, retard et redémarrage.
Test du scheduler partagé : horloge audio, une seule chaîne, nettoyage,
échec du provider. La recette navigateur vérifie le transport audio réel,
le Tap réutilisé, l’arrêt des voix, les transitions et le métronome existant.
MANUAL TEST REQUIRED : qualité sonore et latence sur smartphone Android réel,
arrière-plan, retour Android, casque/Bluetooth et mode avion dès le démarrage.

Recette réalisée : 207 tests réussis, lint/typecheck réussis. Le navigateur
Edge a exercé de vrais AudioContext : décompte 4/4 et 6/8, changement de pattern
différé, BPM en lecture, Stop, passage en arrière-plan, lecture sans réseau
après chargement, Tap tactile et navigation interne. Les sources actives et
connexions sont vérifiées à l’arrêt ; le contexte ferme à la sortie de la page.
Le métronome a été vérifié après extraction du scheduler. Aucune erreur React
ou violation script-src observée ; rendu contrôlé à 320, 390, 768, 844 et
1440 px. Les libellés accessibles restent dans le conteneur défilant afin
de ne pas élargir la page sur mobile. Cette recette ne remplace pas l’écoute
et les essais sur appareil réel.

Les exports finaux Web et Android passent ; Capacitor est synchronisé et
`android:check` valide 15 routes / 128 fichiers. `out/` contient le build Web
avec sa CSP Report-Only régénérée ; les assets Android proviennent de l’export
Android. Aucun APK de release n’est produit par cette validation.

## Pattern Editor et bibliothèque locale

`editor/patternEditing.ts` expose des opérations pures sur le même DrumPattern
que le player. UserPattern ajoute `createdAt`, `updatedAt`, `basedOnPresetId` ;
`id` et `name` restent ceux du pattern. Aucun userId local ou format parallèle.
Les identifiants `user-…` sont stables ; une duplication crée une nouvelle identité.

Les presets sont gelés en profondeur. La première édition ou le premier mute
crée une copie « Nom - copie ». Une case passe de silence (événement absent)
à Normal (0,75), Accent (1), puis silence. Les autres vélocités du preset sont
préservées. `DrumTrack.muted` filtre les événements dans le moteur sans effacer
les notes de la grille. Pas de solo en V1. La file de lecture compare les
snapshots par référence, pas uniquement par ID : plusieurs éditions du même
pattern remplacent la demande en attente et s’appliquent à la prochaine mesure.

Vider les frappes, Réinitialiser et Supprimer demandent confirmation. Changer
de pattern avec un brouillon non sauvegardé demande confirmation. Les liens
sortant de la page et le rechargement sont aussi protégés dans les limites des
confirmations du navigateur. Réinitialiser restaure les notes/mutes du preset
en conservant le nom et l’identité utilisateur. La sauvegarde n’est remplacée
qu’avec Sauvegarder. Dupliquer conserve le contenu courant dans la nouvelle copie.

`PatternRepository` expose list/save/remove. `LocalPatternRepository` est le
seul accès à localStorage, après hydratation. La clé `fretlab.drum-patterns`
contient `{ schemaVersion: 1, patterns: [...] }`. Chaque entrée est validée
structurellement puis par le validateur musical commun. La bibliothèque est
limitée à 100 patterns / un million de caractères JSON et relue avant mutation
pour préserver ses autres entrées. Une édition ancienne ne remplace pas une
version sauvegardée plus récente ; elle peut être dupliquée séparément.

Aucun format antérieur n’existait : pas de migration fictive. Une future version
devra ajouter sa migration au décodeur. Version inconnue, corruption, stockage
désactivé ou quota plein conservent les données existantes et le brouillon.
Le stockage dépend de l’origine Web (domaine/port) ou de l’application Android,
sans synchronisation entre eux. Effacer leurs données supprime les sauvegardes.

Validation éditeur : 221 tests, lint/typecheck et builds Web/Android réussis ;
cap sync et android:check réussis (15 routes, 129 fichiers). Dans Edge : cycle
tactile/clavier et focus à la copie, mute/accent réellement transmis au Web Audio,
CRUD local, confirmations acceptées/refusées, sauvegarde hors ligne puis
rechargement, quota plein et version inconnue. Cinq viewports de 320 à 1440 px,
cellules de 44 px minimum, noms collants et défilement local vérifiés. La CSP
finale correspond au build Web. MANUAL TEST REQUIRED : édition, persistance après
redémarrage, retour Android et démarrage en mode avion sur téléphone réel.
