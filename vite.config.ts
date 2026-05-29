import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: { host: "::", port: 8080 },
  build: {
    target: "es2020",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor":   ["react", "react-dom"],
          "router":         ["react-router-dom"],
          "motion":         ["framer-motion"],
          "supabase":       ["@supabase/supabase-js"],
          "query":          ["@tanstack/react-query"],
          "ui-primitives":  ["@radix-ui/react-slot", "@radix-ui/react-label", "@radix-ui/react-tabs"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "framer-motion"],
  },
});
