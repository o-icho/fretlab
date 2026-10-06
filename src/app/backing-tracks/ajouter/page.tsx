import { featureRouteFallback } from "@/config/requireFeature";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { BACKING_TRACK_ADMIN_ENABLED } from "@/features/backing-tracks/config";
import { BackingTrackAuthoring } from "@/features/backing-tracks/BackingTrackAuthoring";
import { getBackingTracks } from "@/features/backing-tracks/catalogue";
export const metadata = { title: "Ajouter un backing track", robots: { index: false, follow: false } };
export default function Page() {
  const fallback = featureRouteFallback("backingTracks"); if (fallback) return fallback;
  if (!BACKING_TRACK_ADMIN_ENABLED) notFound();
  return <Container><section className="page-intro"><h1>Ajouter un morceau</h1><p>Espace éditorial local. Les imports restent sur cet appareil.</p><Link href="/backing-tracks/">Retour à la bibliothèque</Link></section><BackingTrackAuthoring catalogue={getBackingTracks()} /></Container>;
}
