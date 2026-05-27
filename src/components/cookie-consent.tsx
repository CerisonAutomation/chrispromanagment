import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cpm_cookie_consent";

type ConsentState = "accepted" | "declined" | null;

function getStored(): ConsentState {
  try {
    return (localStorage.getItem(STORAGE_KEY) as ConsentState) ?? null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Delay so it doesn't flash on first render
    const t = setTimeout(() => {
      if (getStored() === null) {
        setVisible(true);
        setAnimating(true);
      }
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const dismiss = (choice: "accepted" | "declined") => {
    try {
 localStorage.setItem(STORAGE_KEY, choice); 
} catch { /* noop */ }
    setAnimating(false);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) {
return null;
}

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-[9999]",
        "bg-[#161618] border border-white/10 shadow-2xl",
        "transition-all duration-300 ease-out",
        animating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Cookie className="w-4 h-4 text-[#C9A84C]" />
          <span className="text-sm font-semibold text-[#F5F5F0]">Cookie Settings</span>
        </div>
        <button
          onClick={() => dismiss("declined")}
          className="text-[#71717A] hover:text-[#F5F5F0] transition-colors"
          aria-label="Decline and close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 pb-4">
        <p className="text-xs text-[#A1A1AA] leading-relaxed mb-4">
          We use strictly necessary cookies for bookings, and optional analytics cookies
          to improve your experience. No advertising cookies.{" "}
          <Link to="/privacy-policy" className="text-[#C9A84C] hover:underline" onClick={() => dismiss("accepted")}>
            Privacy Policy
          </Link>
        </p>

        <div className="flex gap-2">
          <Button
            onClick={() => dismiss("declined")}
            variant="outline"
            size="sm"
            className="flex-1 border-white/10 text-[#A1A1AA] hover:text-[#F5F5F0] rounded-none text-xs"
          >
            Necessary only
          </Button>
          <Button
            onClick={() => dismiss("accepted")}
            size="sm"
            className="flex-1 bg-[#C9A84C] text-[#0F0F10] hover:bg-[#D4B85C] rounded-none text-xs font-semibold"
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
