export function getSiteUrl(
  value = process.env.SITE_URL ?? "http://localhost:3000",
): string {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error(
      "SITE_URL doit être une origine HTTP(S), sans chemin ni paramètres.",
    );
  return url.origin;
}
export const SITE_URL = getSiteUrl();
/** A public web export must never silently inherit the local preview origin. */
export function getPublicSiteUrl(value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error("SITE_URL est requis pour un build web public. Configurer votre domaine HTTPS, ou utiliser npm run build:android pour un export local Android.");
  }
  const origin = getSiteUrl(value);
  const url = new URL(origin);
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || !host.includes(".") || host === "localhost" || /\.(localhost|local|internal|test|invalid)$/.test(host) || /^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(":")) {
    throw new Error("SITE_URL doit désigner un domaine public HTTPS, sans adresse locale ou IP.");
  }
  return origin;
}
export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}
