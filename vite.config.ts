import { createHash } from "crypto";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

/// <reference types="vitest/config" />
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/ttr-calculator/",
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
