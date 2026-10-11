// Shared by the form and server. No credentials or recipient configuration here.
export const MAX_EXAMPLE_BYTES = 4_000_000;
export const EXAMPLE_ACCEPT = ".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4";
export const SUBMISSION_PATH = "/api/submit-example";
export function validEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value);
}
export function audioFileError(file: { name: string; size: number }): string | undefined {
  if (!/\.(mp3|wav|m4a)$/i.test(file.name)) return "Choisissez un fichier MP3, WAV ou M4A.";
  if (file.size <= 0 || file.size > MAX_EXAMPLE_BYTES) return "Le fichier doit être non vide et ne pas dépasser 4 Mo.";
}
export function submissionEndpoint(native: boolean, origin?: string): string {
  if (!native) return SUBMISSION_PATH;
  if (!origin) throw new Error("Serveur d’envoi non configuré.");
  const url = new URL(origin);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Origine HTTPS invalide.");
  return url.origin + SUBMISSION_PATH;
}
