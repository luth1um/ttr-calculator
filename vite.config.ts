import { createHash } from "crypto";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/ttr-calculator/",
  plugins: [
    VitePWA({
      injectRegister: "script-defer",
      manifest: {
        name: "TTR Calculator",
        short_name: "TTR Calc",
        description: "Calculate your new TTR rating after table tennis matches.",
        theme_color: "#1a73e8",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "icon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,json,webmanifest}"],
        // Locales are requested with a cache-busting "v" query parameter.
        ignoreURLParametersMatching: [/^v$/],
        // Takes control of the very first page load (matters on iOS, where a home-screen app
        // has its own storage and installs the service worker from scratch). A new service
        // worker still waits for every app window to close, so updates apply on a cold start.
        clientsClaim: true,
      },
    }),
  ],
  build: {
    outDir: "dist/ttr-calculator",
  },
  define: {
    __LOCALES_HASH__: JSON.stringify(hashDirectory("public/locales/")),
  },
  server: {
    open: true,
  },
  test: {
    exclude: ["**/node_modules/**", "e2e/**"],
  },
});

function hashDirectory(dirPath: string): string {
  const hash = createHash("sha256");
  const files = readdirSync(dirPath).sort();

  for (const file of files) {
    const fullPath = join(dirPath, file);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      const subDirHash = hashDirectory(fullPath);
      hash.update(subDirHash);
    } else {
      const fileContent = readFileSync(fullPath);
      hash.update(fileContent);
    }
  }

  return hash.digest("hex").slice(0, 8);
}
