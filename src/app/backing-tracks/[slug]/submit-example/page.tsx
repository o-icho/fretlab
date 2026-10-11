import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { featureRouteFallback } from "@/config/requireFeature";
import { getBackingTrackSummaries } from "@/features/backing-tracks/catalogue";
import { ExampleSubmissionForm } from "@/features/backing-tracks/ExampleSubmissionForm";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/features/backing-tracks/backingTracks.module.css";

export const dynamicParams = false;
export function generateStaticParams() { return getBackingTrackSummaries().map(({ slug }) => ({ slug })); }
async function findTrack(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const track = getBackingTrackSummaries().find(track => track.slug === slug);
  if (!track) notFound();
  return track;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const track = await findTrack(params);
  return { ...pageMetadata(`Envoyer un exemple — ${track.title}`, "Proposez votre exemple audio à FretLab pour revue.", `/backing-tracks/${track.slug}/submit-example`), robots: { index: false, follow: true } };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const fallback = featureRouteFallback("backingTracks"); if (fallback) return fallback;
  const track = await findTrack(params);
  return <Container><section className="page-intro"><Link href={`/backing-tracks/${track.slug}/`}>{track.title}</Link><h1>Envoyez votre exemple</h1><p>Proposez votre interprétation de {track.title}.</p></section><div className={styles.workspace}><ExampleSubmissionForm slug={track.slug} /></div></Container>;
}
