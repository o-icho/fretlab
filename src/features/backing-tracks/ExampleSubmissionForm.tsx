"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Capacitor } from "@capacitor/core";
import { audioFileError, EXAMPLE_ACCEPT, submissionEndpoint } from "./submission";
import styles from "./backingTracks.module.css";

export function ExampleSubmissionForm({ slug }: { slug: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [validation, setValidation] = useState("");
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = new FormData(event.currentTarget);
    const audio = form.get("audio");
    const error = audio instanceof File ? audioFileError(audio) : "Choisissez un fichier audio.";
    setValidation(error ?? "");
    if (error) return;
    const controller = new AbortController();
    pending.current = controller;
    setStatus("sending");
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const endpoint = submissionEndpoint(Capacitor.isNativePlatform(), process.env.NEXT_PUBLIC_SUBMISSION_ORIGIN);
      const response = await fetch(endpoint, { method: "POST", body: form, headers: { "X-FretLab-Submission": "1" }, signal: controller.signal });
      if (!response.ok || (await response.json()).code !== "SENT") throw new Error("Send failed");
      setStatus("success");
    } catch { setStatus("error"); }
    finally { clearTimeout(timeout); pending.current = null; }
  }
  if (status === "success") return <section className={styles.library}><p role="status">Merci, votre exemple a bien été envoyé.</p><Link className={styles.contribute} href={`/backing-tracks/${slug}/`}>Retour au backing track</Link></section>;
  return <form className={`${styles.library} ${styles.submission}`} onSubmit={submit} aria-busy={status === "sending"}>
    <input type="hidden" name="slug" value={slug} />
    <p className={styles.help}>MP3, WAV ou M4A · 4 Mo maximum. Votre fichier sera envoyé par email pour revue, sans publication automatique. Une connexion Internet est nécessaire.</p>
    <fieldset disabled={status === "sending"}>
      <legend className="sr-only">Votre exemple audio</legend>
      <label htmlFor="example-audio">Audio (obligatoire)</label><input id="example-audio" name="audio" type="file" accept={EXAMPLE_ACCEPT} required aria-describedby="submission-validation" />
      <label htmlFor="example-pseudo">Pseudo (facultatif)</label><input id="example-pseudo" name="pseudo" maxLength={80} autoComplete="nickname" />
      <label htmlFor="example-email">Email (facultatif)</label><input id="example-email" name="email" type="email" maxLength={254} autoComplete="email" />
      <label htmlFor="example-comment">Commentaire (facultatif)</label><textarea id="example-comment" name="comment" maxLength={2000} rows={5} />
      <p id="submission-validation" role="alert" className={styles.message}>{validation}</p>
      <button type="submit">{status === "sending" ? "Envoi en cours…" : "Envoyer mon exemple"}</button>
    </fieldset>
    {status === "error" && <p role="alert" className={styles.message}>L&apos;envoi a échoué. Réessayez plus tard.</p>}
    <p className={styles.help}>Votre audio et les informations renseignées sont transmis à FretLab via Resend, uniquement pour examiner votre contribution.</p>
    <Link href={`/backing-tracks/${slug}/`}>Retour au backing track</Link>
  </form>;
}
