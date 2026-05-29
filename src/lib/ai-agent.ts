/**
 * CMS AI Agent Service
 *
 * Patterns lifted from:
 *  - OpenPage: AgentPanel generateResponse() + patch diff format
 *  - OpenPage: generate.ts Gemini API call structure + system prompt style
 *  - OpenBuild: aiComponentService detectComponentType() + style presets
 *  - OpenPage: deploy.ts timing-safe validation patterns
 *
 * Architecture: All real AI calls go through the Supabase edge function
 * `cms-ai-agent` which holds the API key server-side.
 * Pattern-matching instant responses fire for simple commands without
 * a round-trip, matching OpenBuild's hybrid approach.
 */

import { supabase } from "@/integrations/supabase/client";
import type { CmsRow } from "./cms-types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgentMessage {
  id:       string;
  role:     "user" | "agent";
  text:     string;
  ts:       number;
  patch?:   AgentPatch;
  applied?: boolean;
  source?:  "pattern" | "ai" | "system";
}

export interface AgentPatch {
  sectionKey: string;
  fieldPath:  string;
  oldValue?:  string;
  newValue:   string;
  /** Human-readable diff lines */
  removed?: string[];
  added?:   string[];
}

export type AgentAction =
  | { type: "show_field"; sectionKey: string; fieldKey: string }
  | { type: "none" };

export interface AgentResponse {
  message:  AgentMessage;
  action?:  AgentAction;
}

// ─── Pattern matching (OpenBuild approach — instant, no API call) ─────────────

export function mkMsg(
  role: "user" | "agent",
  text: string,
  extra: Partial<AgentMessage> = {}
): AgentMessage {
  return { id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`, role, text, ts: Date.now(), ...extra };
}

/**
 * Fast pattern-match for unambiguous single-field edits.
 * Returns null → caller should use AI route.
 * Lifted from OpenPage AgentPanel generateResponse().
 */
export function tryPatternMatch(
  input: string,
  rows: CmsRow[]
): AgentResponse | null {
  const lower = input.toLowerCase().trim();

  // ── "set hero headline to 'New Headline'" ────────────────────────────────
  const setMatch =
    lower.match(/(?:set|change|update)\s+(?:the\s+)?(\w+)\s+(?:block\s+)?(\w+)\s+to\s+['"](.+)['"]/i) ??
    lower.match(/(?:make|set)\s+(?:the\s+)?(\w+)\s+['"](.+)['"]/i);

  if (setMatch) {
    const sectionKey = setMatch[1]?.toLowerCase();
    const fieldKey   = setMatch[2]?.toLowerCase() ?? "headline";
    const newValue   = setMatch[3] ?? setMatch[2] ?? "";

    // Find matching row
    const row = rows.find(
      (r) =>
        r.section_key.toLowerCase().includes(sectionKey ?? "") &&
        typeof (r.content as Record<string, unknown>)[fieldKey] === "string"
    );

    if (row && newValue) {
      const oldValue = String((row.content as Record<string, unknown>)[fieldKey] ?? "");
      const patch: AgentPatch = {
        sectionKey:  row.section_key,
        fieldPath:   fieldKey,
        oldValue,
        newValue,
        removed:     oldValue ? [`"${oldValue}"`] : [],
        added:       [`"${newValue}"`],
      };
      return {
        message: mkMsg("agent", `I'll update the **${fieldKey}** in \`${row.section_key}\`.`, { patch, source: "pattern" }),
        action:  { type: "show_field", sectionKey: row.section_key, fieldKey },
      };
    }
  }

  // ── "show me the landing hero" ────────────────────────────────────────────
  const showMatch = lower.match(/(?:show|open|find|where is)\s+(?:the\s+)?(.+)/i);
  if (showMatch) {
    const q = showMatch[1]!.toLowerCase();
    const row = rows.find(
      (r) =>
        r.section_key.toLowerCase().includes(q) ||
        r.section_label.toLowerCase().includes(q)
    );
    if (row) {
      return {
        message: mkMsg("agent", `Found \`${row.section_key}\` — opening it for you.`, { source: "pattern" }),
        action:  { type: "show_field", sectionKey: row.section_key, fieldKey: "" },
      };
    }
  }

  return null;
}

// ─── Real AI call via Supabase edge function ──────────────────────────────────

interface AgentApiResponse {
  reply:        string;
  patch?:       AgentPatch;
  action?:      AgentAction;
  error?:       string;
}

export async function callAiAgent(
  input:    string,
  history:  { role: string; text: string }[],
  rows:     CmsRow[]
): Promise<AgentResponse> {
  // Build context summary for the AI
  const ctxSummary = rows
    .slice(0, 20)
    .map((r) => `${r.section_key}: ${JSON.stringify(r.content).slice(0, 120)}`)
    .join("\n");

  try {
    const { data, error } = await supabase.functions.invoke("cms-ai-agent", {
      body: {
        input,
        history:   history.slice(-8), // Last 8 turns for context window
        cms_context: ctxSummary,
      },
    });

    if (error) throw new Error(error.message);

    const resp = data as AgentApiResponse;

    if (resp.error) throw new Error(resp.error);

    const msg = mkMsg("agent", resp.reply, {
      patch:  resp.patch,
      source: "ai",
    });

    return { message: msg, action: resp.action };
  } catch (e) {
    const text =
      e instanceof Error
        ? `Sorry, I hit an error: ${e.message}`
        : "Something went wrong. Try again.";
    return { message: mkMsg("agent", text, { source: "system" }) };
  }
}

// ─── Main dispatch ────────────────────────────────────────────────────────────

export async function sendAgentMessage(
  input:   string,
  history: AgentMessage[],
  rows:    CmsRow[]
): Promise<AgentResponse> {
  // 1. Try instant pattern match
  const fast = tryPatternMatch(input, rows);
  if (fast) return fast;

  // 2. Real AI call
  const historyForApi = history
    .filter((m) => m.source !== "system")
    .map((m) => ({ role: m.role, text: m.text }));

  return callAiAgent(input, historyForApi, rows);
}

// ─── Pexels image search ──────────────────────────────────────────────────────
// Adapted from OpenPage's api/pexels.ts pattern — proxied through Supabase
// to keep the API key server-side.

export interface PexelsPhoto {
  id:           number;
  alt:          string;
  photographer: string;
  src: {
    small:   string;
    medium:  string;
    large:   string;
    portrait: string;
  };
}

export async function searchPexels(
  query:       string,
  perPage = 6,
  orientation?: "landscape" | "portrait" | "square"
): Promise<PexelsPhoto[]> {
  try {
    const { data, error } = await supabase.functions.invoke("pexels-search", {
      body: { query, per_page: perPage, orientation },
    });
    if (error || !data?.photos) return [];
    return data.photos as PexelsPhoto[];
  } catch {
    return [];
  }
}
