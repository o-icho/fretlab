import { getEnabledFeatures, type FeatureDefinition } from "../config/features.ts";
// Compatibility facade for existing navigation, cards and editorial recommendations.
export const tools = getEnabledFeatures();
export type Tool = FeatureDefinition;
export function toolHref(slug: string) {
  const tool = tools.find(tool => tool.slug === slug);
  if (!tool) throw new Error("Outil indisponible : " + slug);
  return tool.href;
}
