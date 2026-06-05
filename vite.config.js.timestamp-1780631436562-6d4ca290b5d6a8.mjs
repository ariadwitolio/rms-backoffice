// vite.config.js
import { defineConfig } from "file:///Users/aria/Documents/rms-backoffice/node_modules/vite/dist/node/index.js";
import react from "file:///Users/aria/Documents/rms-backoffice/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      // Use polling to avoid false positives from macOS/iCloud metadata updates
      // this is much more stable when the project is in a synced directory.
      usePolling: true,
      interval: 1e3,
      ignored: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
      // Wait for the file to be fully written before triggering a reload
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    }
  },
  optimizeDeps: {
    // Include common dependencies to prevent restarts during "discovery"
    include: ["react", "react-dom", "react/jsx-runtime"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYXJpYS9Eb2N1bWVudHMvcm1zLWJhY2tvZmZpY2VcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9hcmlhL0RvY3VtZW50cy9ybXMtYmFja29mZmljZS92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYXJpYS9Eb2N1bWVudHMvcm1zLWJhY2tvZmZpY2Uvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICB3YXRjaDoge1xuICAgICAgLy8gVXNlIHBvbGxpbmcgdG8gYXZvaWQgZmFsc2UgcG9zaXRpdmVzIGZyb20gbWFjT1MvaUNsb3VkIG1ldGFkYXRhIHVwZGF0ZXNcbiAgICAgIC8vIHRoaXMgaXMgbXVjaCBtb3JlIHN0YWJsZSB3aGVuIHRoZSBwcm9qZWN0IGlzIGluIGEgc3luY2VkIGRpcmVjdG9yeS5cbiAgICAgIHVzZVBvbGxpbmc6IHRydWUsXG4gICAgICBpbnRlcnZhbDogMTAwMCxcbiAgICAgIGlnbm9yZWQ6IFtcIioqL25vZGVfbW9kdWxlcy8qKlwiLCBcIioqL2Rpc3QvKipcIiwgXCIqKi8uZ2l0LyoqXCJdLFxuICAgICAgLy8gV2FpdCBmb3IgdGhlIGZpbGUgdG8gYmUgZnVsbHkgd3JpdHRlbiBiZWZvcmUgdHJpZ2dlcmluZyBhIHJlbG9hZFxuICAgICAgYXdhaXRXcml0ZUZpbmlzaDoge1xuICAgICAgICBzdGFiaWxpdHlUaHJlc2hvbGQ6IDUwMCxcbiAgICAgICAgcG9sbEludGVydmFsOiAxMDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIC8vIEluY2x1ZGUgY29tbW9uIGRlcGVuZGVuY2llcyB0byBwcmV2ZW50IHJlc3RhcnRzIGR1cmluZyBcImRpc2NvdmVyeVwiXG4gICAgaW5jbHVkZTogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIiwgXCJyZWFjdC9qc3gtcnVudGltZVwiXSxcbiAgfSxcbn0pO1xuXG5cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFIsU0FBUyxvQkFBb0I7QUFDM1QsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixPQUFPO0FBQUE7QUFBQTtBQUFBLE1BR0wsWUFBWTtBQUFBLE1BQ1osVUFBVTtBQUFBLE1BQ1YsU0FBUyxDQUFDLHNCQUFzQixjQUFjLFlBQVk7QUFBQTtBQUFBLE1BRTFELGtCQUFrQjtBQUFBLFFBQ2hCLG9CQUFvQjtBQUFBLFFBQ3BCLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUE7QUFBQSxJQUVaLFNBQVMsQ0FBQyxTQUFTLGFBQWEsbUJBQW1CO0FBQUEsRUFDckQ7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
