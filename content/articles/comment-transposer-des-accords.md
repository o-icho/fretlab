---
title: "Comment transposer une grille d'accords"
description: "Déplacez tous les accords du même nombre de demi-tons et conservez leur caractère majeur, mineur ou enrichi."
slug: "comment-transposer-des-accords"
date: "2026-10-03"
author: "FretLab"
category: "Théorie"
tags: ["transposition", "tonalité", "accords"]
tool: "transposeur"
art: "chord"
---

Transposer une grille consiste à déplacer tous ses accords du même intervalle. Vous pouvez ainsi adapter la hauteur d'un accompagnement à votre voix ou essayer une tonalité dont les positions vous conviennent mieux. Le caractère de chaque accord reste le même : un mineur reste mineur, une septième reste une septième.

Le [transposeur FretLab](/outils/transposeur) effectue ce déplacement à partir d'un texte. Vous choisissez le nombre de demi-tons et la notation en dièses ou en bémols.

## Compter les demi-tons

La suite chromatique en dièses est : **C, C#, D, D#, E, F, F#, G, G#, A, A#, B**, puis de nouveau C. Chaque pas vaut un demi-ton. Entre E et F, comme entre B et C, le pas est également un demi-ton ; il n'y a pas de touche intermédiaire dans cette liste.

Pour monter de deux demi-tons, avancez de deux places. Pour descendre, comptez dans l'autre sens. Vous pouvez vérifier ce principe sur une grille courte avant de modifier tout un morceau.

## Conserver le type d'accord

Le nom commence par une fondamentale, parfois accompagnée d'un dièse ou d'un bémol. Le suffixe indique le type d'accord. Dans Am7, A est la fondamentale et m7 est le suffixe.

| Accord initial | Transposition | Résultat |
| -------------- | ------------- | -------- |
| C              | +2 demi-tons  | D        |
| Am             | +2 demi-tons  | Bm       |
| F#m7           | +1 demi-ton   | Gm7      |
| Bbmaj7         | +2 demi-tons  | Cmaj7    |
| G/B            | −2 demi-tons  | F/A      |

### Ne pas oublier les basses

Dans un accord comme C/E, la partie après la barre indique la basse. Elle doit être déplacée du même intervalle que l'accord. Avec +2 demi-tons, C devient D et E devient F# : le résultat est **D/F#**.

## Préparer le texte dans FretLab

Placez les accords sur leurs propres lignes. Les paroles sont conservées, ainsi que les espaces et les retours à la ligne. Si les accords sont au milieu d'une phrase, mettez-les entre crochets pour les distinguer des mots ordinaires.

```text
Am       F
Une ligne de paroles

C        G
Une autre ligne
```

Avec +2 demi-tons, la grille devient Bm, G, D et A. Dans une phrase, vous pouvez écrire `[Am]Bonjour [F]à tous`. Un simple mot qui commence par A ou C ne doit pas être traité comme un accord.

> **Conseil :** vérifiez quelques accords du résultat avant de jouer. La longueur d'un nom peut changer, par exemple C vers C#, même lorsque les espaces originaux sont conservés.

## Choisir dièses ou bémols

C# et Db désignent la même hauteur dans le système utilisé ici. Le choix de notation améliore la lisibilité de votre grille ; le transposeur propose les deux écritures. Il ne détermine pas automatiquement toutes les conventions d'écriture d'une tonalité.

Si un accord transposé vous est inconnu, cherchez sa position dans le [dictionnaire](/outils/accords). Le guide [pour lire un diagramme](/articles/comment-lire-un-diagramme-accord-guitare) explique comment passer du nom au doigté. Transposer modifie la hauteur des accords, pas le rythme : gardez votre accompagnement habituel pour comparer les versions.
