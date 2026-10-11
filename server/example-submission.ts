// Server only. Kept outside src/app so Next's static export remains unchanged.
import { MAX_EXAMPLE_BYTES, audioFileError, validEmail } from "../src/features/backing-tracks/submission.ts";
import type { BackingTrackSummary } from "../src/domain/music/backingTracks.ts";

export interface SubmissionMail {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  attachments: { filename: string; content: string }[];
}
interface Dependencies {
  configuration(): Promise<{ recipientEmail: unknown; apiKey: string | undefined; fromEmail: string | undefined }>;
  tracks(): Promise<BackingTrackSummary[]>;
  send(apiKey: string, mail: SubmissionMail): Promise<void>;
  enabled: boolean;
}
const MAX_BODY_BYTES = MAX_EXAMPLE_BYTES + 64_000;
class InvalidSubmission extends Error {
  status: number;
  constructor(status = 400) { super("Invalid submission"); this.status = status; }
}
async function boundedForm(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) throw new InvalidSubmission(415);
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) throw new InvalidSubmission(413);
  const reader = request.body?.getReader();
  if (!reader) throw new InvalidSubmission();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new InvalidSubmission(413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return await new Response(new Blob(chunks), { headers: { "Content-Type": request.headers.get("content-type")! } }).formData(); }
  catch { throw new InvalidSubmission(); }
}
function field(form: FormData, key: string, max: number) {
  const values = form.getAll(key);
  if (values.length > 1 || (values.length && typeof values[0] !== "string")) throw new InvalidSubmission();
  const value = String(values[0] ?? "").trim();
  if (value.length > max || /[\u0000\u000b\u000c]/.test(value)) throw new InvalidSubmission();
  return value;
}
// Container signatures, not audio analysis; never trust extension/MIME alone.
export function matchesAudioSignature(name: string, bytes: Uint8Array): boolean {
  const ascii = (start: number, end: number) => Buffer.from(bytes.subarray(start, end)).toString("ascii");
  if (/\.mp3$/i.test(name)) return bytes.length >= 10 && (ascii(0, 3) === "ID3" || (bytes[0] === 255 && (bytes[1] & 0xe0) === 0xe0));
  if (/\.wav$/i.test(name)) return bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WAVE";
  return /\.m4a$/i.test(name) && bytes.length >= 16 && ascii(4, 8) === "ftyp" && /^(M4A |M4B |isom|iso2|mp41|mp42)$/.test(ascii(8, 12));
}
export function createSubmissionHandler(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get("origin");
    const allowed = origin === new URL(request.url).origin || origin === "https://localhost";
    const headers = new Headers({ "Cache-Control": "no-store", "Vary": "Origin" });
    if (allowed && origin) headers.set("Access-Control-Allow-Origin", origin);
    const reply = (status: number, code: string) => Response.json({ code }, { status, headers });
    if (!deps.enabled) return reply(404, "NOT_FOUND");
    if (!allowed) return reply(403, "FORBIDDEN");
    if (request.method === "OPTIONS") {
      headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type, X-FretLab-Submission");
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "POST") { headers.set("Allow", "POST, OPTIONS"); return reply(405, "METHOD_NOT_ALLOWED"); }
    if (request.headers.get("X-FretLab-Submission") !== "1") return reply(403, "FORBIDDEN");
    let config: Awaited<ReturnType<Dependencies["configuration"]>>;
    try {
      config = await deps.configuration();
      if (typeof config.recipientEmail !== "string" || !validEmail(config.recipientEmail) || config.recipientEmail.toLowerCase() === "change_me@example.com" || !config.apiKey?.trim() || !config.fromEmail || !validEmail(config.fromEmail)) throw new Error("Configuration");
    } catch { return reply(503, "SERVER_CONFIGURATION_ERROR"); }
    try {
      const form = await boundedForm(request);
      const permitted = new Set(["slug", "pseudo", "email", "comment", "audio"]);
      for (const key of form.keys()) if (!permitted.has(key)) throw new InvalidSubmission();
      const slug = field(form, "slug", 120);
      const pseudo = field(form, "pseudo", 80), email = field(form, "email", 254), comment = field(form, "comment", 2000);
      if (email && !validEmail(email)) throw new InvalidSubmission();
      const track = (await deps.tracks()).find(track => track.slug === slug);
      if (!track) return reply(404, "TRACK_NOT_FOUND");
      const files = form.getAll("audio");
      const file = files[0];
      if (files.length !== 1 || !(file instanceof File) || file.name.length > 200 || /[\r\n\x00\\/]/.test(file.name)) throw new InvalidSubmission();
      if (audioFileError(file)) throw new InvalidSubmission(file.size > MAX_EXAMPLE_BYTES ? 413 : 400);
      const content = Buffer.from(await file.arrayBuffer());
      if (!matchesAudioSignature(file.name, content)) throw new InvalidSubmission(415);
      await deps.send(config.apiKey!, {
        from: config.fromEmail!, to: config.recipientEmail as string,
        subject: `[FretLab] Example submission - ${track.title}`,
        text: [`Track id: ${track.id}`, `Track title: ${track.title}`, `Track slug: ${track.slug}`, `Pseudo: ${pseudo || "—"}`, `Email: ${email || "—"}`, `Commentaire: ${comment || "—"}`, `Fichier: ${file.name}`, "Soumission pour revue uniquement. Non approuvée, non publiée."].join("\n"),
        ...(email ? { replyTo: email } : {}),
        attachments: [{ filename: file.name, content: content.toString("base64") }],
      });
      return reply(200, "SENT");
    } catch (error) {
      return error instanceof InvalidSubmission ? reply(error.status, "INVALID_SUBMISSION") : reply(502, "SEND_FAILED");
    }
  };
}
