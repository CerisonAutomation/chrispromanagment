// CRA -> Vite shim: process.env.REACT_APP_* keys (Vite `define` also handles these).
const env = (import.meta as any).env || {};
(globalThis as any).process = (globalThis as any).process || {
  env: {
    NODE_ENV: env.MODE,
    REACT_APP_BACKEND_URL: env.VITE_BACKEND_URL || "",
    REACT_APP_STRIPE_PUBLISHABLE_KEY: env.VITE_STRIPE_PUBLISHABLE_KEY || "",
    REACT_APP_GOOGLE_MAPS_API_KEY: env.VITE_GOOGLE_MAPS_API_KEY || "",
  },
};

// Route all /api/* axios + fetch calls to Lovable Cloud (Supabase + edge fns).
import "./lib/api-adapter.js";

import { createRoot } from "react-dom/client";
import "./index.css";
// @ts-ignore - JSX entry from ported CRA app
import App from "./App.jsx";

createRoot(document.getElementById("root")!).render(<App />);

