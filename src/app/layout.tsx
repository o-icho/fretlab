import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import {
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  SOCIAL_IMAGE,
} from "@/lib/metadata";
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | FretLab",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "FretLab",
  openGraph: {
    locale: "fr_FR",
    type: "website",
    siteName: "FretLab",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={manrope.variable} data-scroll-behavior="smooth">
      <body className="bg-background text-foreground font-sans antialiased">
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <Header />
        <main id="contenu">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
