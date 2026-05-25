// Single hook + helper to surface Lovable AI Gateway / Guesty 429/402 as
// friendly toasts. Use anywhere an AI / external API call is made (P5).
import { toast } from "sonner";

let lastToast = { key: "", at: 0 };

function dedupe(key, ms = 4000) {
  const now = Date.now();
  if (lastToast.key === key && now - lastToast.at < ms) return false;
  lastToast = { key, at: now };
  return true;
}

export function reportGatewayError(error, context = "AI service") {
  const status =
    error?.status ??
    error?.code ??
    (typeof error?.message === "string" && error.message.match(/\b(402|429|5\d\d)\b/)?.[1]);
  const msg = String(error?.message || error || "Unknown error");

  if (String(status) === "429" || /too many/i.test(msg)) {
    if (dedupe(`429:${context}`)) {
      toast.warning(`${context} is rate limited.`, {
        description: "Try again in a moment.",
      });
    }
    return "rate_limited";
  }
  if (String(status) === "402" || /payment required|credits/i.test(msg)) {
    if (dedupe(`402:${context}`)) {
      toast.error(`${context} credits exhausted.`, {
        description: "Add funds in workspace settings to continue.",
      });
    }
    return "credits_exhausted";
  }
  if (dedupe(`err:${msg}`)) toast.error(`${context} error`, { description: msg.slice(0, 200) });
  return "error";
}

export function useGatewayErrors() {
  return reportGatewayError;
}
