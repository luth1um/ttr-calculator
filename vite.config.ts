/// <reference types="vitest/config" />
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/ttr-calculator/",
  build: {
    outDir: "dist/ttr-calculator",
  },
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(Date.now().toString()),
  },
  server: {
    open: true,
  },
  test: {
    exclude: ["**/node_modules/**", "e2e/**"],
  },
});
