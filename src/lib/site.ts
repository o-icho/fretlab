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
export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}
