import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.fretlab.app",
  appName: "FretLab",
  webDir: "out",
  backgroundColor: "#151321",
  server: { hostname: "localhost", androidScheme: "https" },
  android: { backgroundColor: "#151321" },
  plugins: {
    SystemBars: {
      style: "DARK",
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
    },
  },
};
export default config;
