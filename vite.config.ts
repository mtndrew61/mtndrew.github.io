import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative asset paths so the iOS shell can load dist/ over the file protocol.
  base: "./",
  plugins: [react()],
});
