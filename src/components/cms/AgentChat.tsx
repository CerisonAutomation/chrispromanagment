/**
 * AgentChat — AI assistant panel for the CMS editor
 *
 * Synthesis of:
 *  - OpenPage AgentPanel.tsx: chat UI, typing indicator, patch diff display, hint chips
 *  - OpenBuild AIComponentGenerator.vue: style preset options, example quick-picks
 *  - OpenPage VersionHistory.tsx: timestamped entry display, close-on-escape
 *
 * Real AI calls go through `cms-ai-agent` Supabase edge function.
 * Pattern matches fire instantly (no round-trip) for simple commands.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Check, X, Sparkles, Bot, RotateCcw, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  type AgentMessage,
  type AgentAction,
  type AgentPatch,
  mkMsg,
  sendAgentMessage,
} from "@/lib/ai-agent";
import type { CmsRow } from "@/lib/cms-types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AgentChatProps {
  rows:      CmsRow[];
  onApplyPatch: (sectionKey: string, fieldPath: string, newValue: string) => void;
  onFocusBlock: (sectionKey: string) => void;
  onClose?:  () => void;
}

// ─── Hint chips (from OpenPage AgentPanel + OpenBuild examples) ───────────────

const HINTS = [
  "Change the hero headline",
  "Update the owners page body",
  "Show me the booking header",
  "Make the CTA more compelling",
  "Update the stats numbers",
];

// ─── Typing indicator (direct from OpenPage AgentPanel) ───────────────────────

function TypingIndicator() {
  return (
    <div className="self-start flex gap-1 px-3 py-2.5 rounded-xl rounded-bl-sm border border-gold/10 bg-gold/5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gold opacity-40"
          style={{
            animation:      "typeDot 1.4s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes typeDot {
          0%, 60%, 100% { opacity: 0.4; transform: translateY(0); }
          30%            { opacity: 1;   transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}

// ─── Patch diff display (adapted from OpenPage AgentPanel) ────────────────────

function PatchDiff({
  patch,
  applied,
  onApply,
  onReject,
}: {
  patch:    AgentPatch;
  applied:  boolean | undefined;
  onApply:  () => void;
  onReject: () => void;
}) {
  return (
    <div className="mt-2.5 rounded-lg border border-border/50 bg-muted/30 p-2.5 font-mono text-[10.5px] leading-relaxed">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-sans text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          JSON Patch · <code className="text-gold/70">{patch.sectionKey}.{patch.fieldPath}</code>
        </span>
        {applied === undefined && (
          <div className="flex gap-1">
            <button
              onClick={onApply}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              <Check size={9} /> Apply
            </button>
            <button
              onClick={onReject}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <X size={9} /> Reject
            </button>
          </div>
        )}
        {applied === true  && <span className="flex items-center gap-0.5 text-[9px] text-emerald-400"><Check size={9} /> Applied</span>}
        {applied === false && <span className="text-[9px] text-muted-foreground">Rejected</span>}
      </div>
      {patch.removed?.map((line, i) => (
        <div key={`r-${i}`} className="text-destructive/70 line-through opacity-70">- {line}</div>
      ))}
      {patch.added?.map((line, i) => (
        <div key={`a-${i}`} className="text-emerald-400">+ {line}</div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const INITIAL_MESSAGES: AgentMessage[] = [
  mkMsg("agent",
    "Hi! I can help you edit your site content. Try:\n• \"Change the hero headline to 'New Title'\"\n• \"Show me the booking header\"\n• \"Make the owners CTA more compelling\"",
    { source: "system" }
  ),
];

export function AgentChat({ rows, onApplyPatch, onFocusBlock, onClose }: AgentChatProps) {
  const [messages,    setMessages]    = useState<AgentMessage[]>(INITIAL_MESSAGES);
  const [input,       setInput]       = useState("");
  const [thinking,    setThinking]    = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const applyPatch = useCallback((msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg?.patch) return;
    onApplyPatch(msg.patch.sectionKey, msg.patch.fieldPath, msg.patch.newValue);
    setMessages((prev) =>
      prev.map((m) => m.id === msgId ? { ...m, applied: true } : m)
    );
    toast.success(`Applied: ${msg.patch.sectionKey}.${msg.patch.fieldPath}`);
  }, [messages, onApplyPatch]);

  const rejectPatch = useCallback((msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => m.id === msgId ? { ...m, applied: false, patch: undefined } : m)
    );
    toast("Patch rejected");
  }, []);

  const handleAction = useCallback((action: AgentAction | undefined) => {
    if (!action || action.type === "none") return;
    if (action.type === "show_field") {
      onFocusBlock(action.sectionKey);
    }
  }, [onFocusBlock]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg = mkMsg("user", text);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    // Slight delay so typing indicator is visible (OpenPage's 800ms pattern)
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));

    const response = await sendAgentMessage(text, messages, rows);
    setThinking(false);
    setMessages((prev) => [...prev, response.message]);
    handleAction(response.action);
  }, [input, thinking, messages, rows, handleAction]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
  };

  const clearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    toast("Chat cleared");
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gold/15 flex items-center justify-center">
            <Bot className="h-3.5 w-3.5 text-gold" />
          </div>
          <span className="text-sm font-semibold">AI Assistant</span>
          <span className="text-[10px] text-muted-foreground rounded-full bg-muted px-1.5 py-0.5">
            Gemini
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearHistory}
            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Clear chat"
            aria-label="Clear chat history"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close agent panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[95%] px-3 py-2.5 rounded-xl text-[12.5px] leading-relaxed whitespace-pre-wrap",
              msg.role === "user"
                ? "self-end bg-muted text-foreground rounded-br-sm"
                : "self-start bg-gold/5 text-foreground rounded-bl-sm border border-gold/10"
            )}
          >
            {msg.text}

            {/* Patch diff — from OpenPage AgentPanel */}
            {msg.patch && (
              <PatchDiff
                patch={msg.patch}
                applied={msg.applied}
                onApply={() => applyPatch(msg.id)}
                onReject={() => rejectPatch(msg.id)}
              />
            )}

            {/* Source badge */}
            {msg.source === "ai" && (
              <div className="mt-1.5 flex items-center gap-1 text-[9px] text-muted-foreground/60">
                <Sparkles className="h-2.5 w-2.5" /> AI generated
              </div>
            )}
          </div>
        ))}

        {thinking && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Hint chips (OpenPage pattern) ──────────────────────────────── */}
      <div className="px-3 pb-1.5 flex gap-1 flex-wrap shrink-0">
        {HINTS.map((hint) => (
          <button
            key={hint}
            onClick={() => setInput(hint)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-muted-foreground border border-border/60 bg-muted/30 hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all"
          >
            <ChevronRight className="h-2.5 w-2.5" />
            {hint}
          </button>
        ))}
      </div>

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div className="px-3 pb-3 pt-1.5 border-t border-border/40 shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the agent…"
            disabled={thinking}
            className="flex-1 rounded-lg border border-input bg-muted/30 px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:border-gold disabled:opacity-50 transition-colors"
            aria-label="Message to AI agent"
          />
          <button
            onClick={() => void send()}
            disabled={!input.trim() || thinking}
            className="w-9 h-9 rounded-lg bg-gold flex items-center justify-center text-primary-foreground shrink-0 hover:opacity-90 transition-opacity disabled:opacity-30"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
