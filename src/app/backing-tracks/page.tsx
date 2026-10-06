import { featureRouteFallback } from "@/config/requireFeature";
import { Suspense } from "react";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/metadata";
import { BackingTracks } from "@/features/backing-tracks/BackingTracks";
import { getBackingTrackSummaries } from "@/features/backing-tracks/catalogue";
import { BACKING_TRACK_ADMIN_ENABLED } from "@/features/backing-tracks/config";
export const metadata = pageMetadata("Backing tracks pour guitare", "Parcourez les accompagnements par genre, tonalité et tempo, puis jouez avec les accords synchronisés.", "/backing-tracks");
export default function Page() {
  const fallback = featureRouteFallback("backingTracks"); if (fallback) return fallback;
  return <Container><section className="page-intro"><p className="eyebrow">LA BOÎTE À OUTILS / 08</p><h1>Backing tracks</h1><p>Trouvez votre accompagnement et jouez avec les accords en vue.</p></section><Suspense fallback={<p>Chargement de la bibliothèque…</p>}><BackingTracks catalogue={getBackingTrackSummaries()} adminEnabled={BACKING_TRACK_ADMIN_ENABLED} /></Suspense></Container>;
}
