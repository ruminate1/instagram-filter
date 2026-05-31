import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    webExtension({
      manifest: resolve(__dirname, "src/manifest.json"),
      browser: process.env.TARGET ?? "firefox",
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
