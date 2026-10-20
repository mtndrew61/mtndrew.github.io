import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.stepquest.walk",
  appName: "Step Quest",
  webDir: "dist",
  ios: {
    contentInset: "automatic",
  },
};

export default config;
