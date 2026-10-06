import Link from "next/link";
import type { ReactNode } from "react";
import { getFeatureDefinition, isFeatureEnabled, type FeatureId } from "@/config/features";

export function FeatureLink({ featureId, children, query }: { featureId: FeatureId; children: ReactNode; query?: string }) {
  if (!isFeatureEnabled(featureId)) return null;
  const feature = getFeatureDefinition(featureId);
  return <Link href={feature.href + (query ? "?" + query : "")}>{children}</Link>;
}
