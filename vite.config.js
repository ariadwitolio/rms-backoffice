import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    warmup: {
      // Pre-transform App.jsx on server start so the first browser request
      // doesn't have to wait for the heavy 1 MB JSX file to be compiled.
      clientFiles: ["./src/App.jsx", "./src/main.jsx"],
    },
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


