// Vite entry - use import.meta.env directly
const env = import.meta.env;

import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./app";
import { bootstrapTheme } from "./lib/themeTokens";

// Apply persisted AI theme tokens before first paint
bootstrapTheme();

createRoot(document.getElementById("root")!).render(<App />);
