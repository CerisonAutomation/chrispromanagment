import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./app";
import { bootstrapTheme } from "./lib/themeTokens";

bootstrapTheme();

createRoot(document.getElementById("root")!).render(<App />);
