import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.fretlab.app",
  appName: "FretLab",
  webDir: "out",
  backgroundColor: "#111318",
  server: { hostname: "localhost", androidScheme: "https" },
  android: { backgroundColor: "#111318" },
  plugins: {
    SystemBars: {
      style: "DARK",
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
    },
  },
};
export default config;
