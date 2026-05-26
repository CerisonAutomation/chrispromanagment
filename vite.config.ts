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
  build: {
    target: "esnext",
    minify: "oxc",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-dom") || id.includes("react/")) return "react";
          if (id.includes("@radix-ui") || id.includes("cmdk") || id.includes("vaul") || id.includes("sonner")) return "ui";
          if (id.includes("leaflet") || id.includes("react-leaflet")) return "map";
          if (id.includes("ethers") || id.includes("web3") || id.includes("xrpl")) return "web3";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("date-fns")) return "date-fns";
          if (id.includes("framer-motion") || id.includes("lucide")) return "motion-icons";
          if (id.includes("@tiptap") || id.includes("prosemirror")) return "editor";
          if (id.includes("@tensorflow")) return "tensorflow";
          if (id.includes("recharts") || id.includes("d3-") || id.includes("victory")) return "charts";
          if (id.includes("@dnd-kit") || id.includes("@hello-pangea")) return "dnd";
          if (id.includes("@stripe")) return "stripe";
          if (id.includes("swiper") || id.includes("embla")) return "carousel";
          if (id.includes("@tanstack")) return "query";
          if (id.includes("socket.io")) return "socket";
          if (id.includes("zustand") || id.includes("zod") || id.includes("axios")) return "utils";
          return "vendor";
        },
      },
    },
    reportCompressedSize: true,
  },
}));
