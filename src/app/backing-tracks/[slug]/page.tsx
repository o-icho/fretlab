import Link from "next/link";
import { featureRouteFallback } from "@/config/requireFeature";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/metadata";
import { getBackingTrackSummaries } from "@/features/backing-tracks/catalogue";
import { TrackDetailPlayer } from "@/features/backing-tracks/TrackDetailPlayer";
import styles from "@/features/backing-tracks/backingTracks.module.css";

export const dynamicParams = false;
export function generateStaticParams() {
  return getBackingTrackSummaries().map(({ slug }) => ({ slug }));
}
async function findTrack(params: Promise<{ slug: string }>) {

  const { slug } = await params;
  const track = getBackingTrackSummaries().find(track => track.slug === slug);
  if (!track) notFound();
  return track;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const track = await findTrack(params);
  return pageMetadata(`${track.title} — Backing track guitare`, `Jouez sur ${track.title}, en ${track.key} à ${track.bpm} BPM, avec les accords synchronisés.`, `/backing-tracks/${track.slug}`);
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const fallback = featureRouteFallback("backingTracks"); if (fallback) return fallback;
  const track = await findTrack(params);
  return <Container><section className="page-intro"><Link href="/backing-tracks/">Tous les backing tracks</Link><h1>{track.title}</h1></section><div className={styles.workspace}><TrackDetailPlayer summary={track} /></div></Container>;
}
