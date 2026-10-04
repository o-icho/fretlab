import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";
import { getPublicSiteUrl } from "./src/lib/site.ts";

export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) {
    const target = process.env.FRETLAB_BUILD_TARGET ?? "web";
    if (target !== "web" && target !== "android") throw new Error("FRETLAB_BUILD_TARGET doit être web ou android.");
    if (target === "web") getPublicSiteUrl(process.env.SITE_URL);
  }
  return {
    poweredByHeader: false,
    // A production build must not overwrite the running dev server's assets.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  };
}
