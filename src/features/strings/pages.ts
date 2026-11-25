import { getFeatureDefinition } from "../../config/features.ts";

export const stringsHub = getFeatureDefinition("strings");
export const stringGuidePath = "/articles/choisir-le-tirant-de-ses-cordes";
export const stringTools = {
  choisir: {
    title: "Choisir mes cordes",
    navLabel: "Choisir",
    description: "Quel tirant pour votre guitare ou votre basse, selon votre accordage et votre toucher ?",
    href: stringsHub.href + "/choisir",
    icon: "strings",
  },
  comparer: {
    title: "Comparer deux jeux",
    navLabel: "Comparer",
    description: "Voyez quelles cordes seront plus souples ou plus fermes en changeant de jeu ou d’accordage.",
    href: stringsHub.href + "/comparer",
    icon: "transpose",
  },
  justesse: {
    title: "Vérifier la justesse",
    navLabel: "Justesse",
    description: "Comparez au micro la note à vide et la note jouée à la 12ᵉ case, corde par corde.",
    href: stringsHub.href + "/justesse",
    icon: "tuner",
  },
} as const;
