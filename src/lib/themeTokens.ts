import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export const THEME_TOKEN_ALLOWLIST = [
  "--gold", "--gold-light", "--gold-dark",
  "--bg-dark", "--bg-darker", "--bg-card", "--bg-elevated",
  "--text-primary", "--text-secondary", "--text-muted",
  "--success", "--error", "--warning",
] as const;

const HEX = /^#[0-9a-fA-F]{6}$/;
const HSL = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/;
export const isValidTokenValue = (v: unknown): v is string =>
  typeof v === "string" && (HEX.test(v) || HSL.test(v));

export function applyThemeTokens(tokens: Record<string, string>) {
  if (!tokens || typeof tokens !== "object") {
return;
}
  const root = document.documentElement;
  for (const [k, v] of Object.entries(tokens)) {
    if ((THEME_TOKEN_ALLOWLIST as readonly string[]).includes(k) && isValidTokenValue(v)) {
      root.style.setProperty(k, v);
    }
  }
}

export function clearThemeTokens() {
  const root = document.documentElement;
  for (const k of THEME_TOKEN_ALLOWLIST) {
root.style.removeProperty(k);
}
}

export async function loadThemeTokens(): Promise<Record<string, string> | null> {
  try {
    const { data } = await supabase
      .from("cms_settings")
      .select("setting_value")
      .eq("setting_key", "theme_tokens")
      .maybeSingle();
    return (data?.setting_value as Record<string, string>) ?? null;
  } catch (e) {
    logger.warn("loadThemeTokens failed", { error: e });
    return null;
  }
}

export async function saveThemeTokens(tokens: Record<string, string>) {
  const { data: existing } = await supabase
    .from("cms_settings")
    .select("id")
    .eq("setting_key", "theme_tokens")
    .maybeSingle();
  if (existing?.id) {
    return supabase.from("cms_settings").update({ setting_value: tokens }).eq("id", existing.id);
  }
  return supabase.from("cms_settings").insert({
    setting_key: "theme_tokens",
    setting_label: "AI Theme Tokens",
    setting_group: "theme",
    setting_value: tokens,
  });
}

export async function resetThemeTokens() {
  clearThemeTokens();
  return supabase.from("cms_settings").delete().eq("setting_key", "theme_tokens");
}

export async function generateThemeWithAI(prompt: string, currentTokens: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke("theme-ai-generate", {
    body: { prompt, currentTokens },
  });
  if (error) {
throw error;
}
  if (data?.error) {
throw new Error(data.error);
}
  return data;
}

export async function bootstrapTheme() {
  const tokens = await loadThemeTokens();
  if (tokens) {
applyThemeTokens(tokens);
}
}
