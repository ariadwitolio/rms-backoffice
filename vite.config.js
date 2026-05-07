import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      // Use polling to avoid false positives from macOS/iCloud metadata updates
      // this is much more stable when the project is in a synced directory.
      usePolling: true,
      interval: 1000,
      ignored: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
      // Wait for the file to be fully written before triggering a reload
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100,
      },
    },
  },
  optimizeDeps: {
    // Include common dependencies to prevent restarts during "discovery"
    include: ["react", "react-dom", "react/jsx-runtime"],
  },
});