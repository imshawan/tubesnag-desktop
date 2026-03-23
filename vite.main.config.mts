import path from "node:path";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  optimizeDeps: {
    exclude: ['better-sqlite3'],
  },
  build: {
    commonjsOptions: {
      ignoreDynamicRequires: true,
    },
    rollupOptions: {
      external: ['better-sqlite3', 'electron'],
      output: {
        format: 'cjs',
      },
    },
  },
  ssr: {
    external: ['better-sqlite3'],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
