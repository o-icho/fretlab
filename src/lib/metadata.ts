import type { Metadata } from "next";
import { absoluteUrl } from "./site.ts";
export const DEFAULT_TITLE = "FretLab — La boîte à outils du guitariste";
export const DEFAULT_DESCRIPTION =
  "Accords, accordeur, métronome et transposition : découvrez FretLab, la boîte à outils gratuite du guitariste, sans compte.";
export const SOCIAL_IMAGE = {
  url: absoluteUrl("/social/fretlab.png"),
  width: 1200,
  height: 630,
  alt: "FretLab — La boîte à outils du guitariste",
};
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  home = false,
): Metadata {
  const socialTitle = home ? title : `${title} | FretLab`;
  return {
    title: home ? { absolute: title } : title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: "website",
      title: socialTitle,
      description,
      url: absoluteUrl(path),
      locale: "fr_FR",
      siteName: "FretLab",
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}
