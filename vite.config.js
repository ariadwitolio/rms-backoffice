import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
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
    include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime"],
    // Skip scanning source files — all deps are local modules, no new npm packages to discover.
    // Saves ~40s cold-start caused by esbuild scanning the large useAppHandlers.jsx.
    noDiscovery: true,
  },
});


