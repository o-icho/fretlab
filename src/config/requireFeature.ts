import { createElement } from "react";
import { isFeatureEnabled, type FeatureId } from "./features.ts";

/** Static Web/Capacitor fallback: no hydration or HTTP status dependency. */
export function featureRouteFallback(id: FeatureId) {
  if (isFeatureEnabled(id)) return null;
  return createElement("section", { className: "container page-intro" },
    createElement("meta", { name: "robots", content: "noindex, nofollow" }),
    createElement("h1", null, "Fonctionnalité indisponible"),
    createElement("p", null, "Retrouvez les outils disponibles depuis l’accueil."),
    createElement("a", { href: "/" }, "Retour à l’accueil"));
}
