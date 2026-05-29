import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  define: {
    "process.env.REACT_APP_BACKEND_URL": JSON.stringify(process.env.VITE_BACKEND_URL || ""),
    "process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY": JSON.stringify(process.env.VITE_STRIPE_PUBLISHABLE_KEY || ""),
    "process.env.REACT_APP_GOOGLE_MAPS_API_KEY": JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY || ""),
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
