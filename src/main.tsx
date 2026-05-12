// CRA -> Vite shim: map process.env.REACT_APP_* to import.meta.env equivalents
// Must run before any other imports below it.
const env = (import.meta as any).env || {};
(globalThis as any).process = (globalThis as any).process || {
  env: {
    NODE_ENV: env.MODE,
    REACT_APP_BACKEND_URL: env.VITE_BACKEND_URL || "",
    REACT_APP_STRIPE_PUBLISHABLE_KEY: env.VITE_STRIPE_PUBLISHABLE_KEY || "",
    REACT_APP_GOOGLE_MAPS_API_KEY: env.VITE_GOOGLE_MAPS_API_KEY || "",
  },
};

import { createRoot } from "react-dom/client";
import "./index.css";
// @ts-ignore - .js entry from ported CRA app
import App from "./App.js";

createRoot(document.getElementById("root")!).render(<App />);
