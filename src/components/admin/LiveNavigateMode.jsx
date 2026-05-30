// LiveNavigateMode — iframe-mirrored frontend with click-to-edit support.
// Communicates with EditModeBridge in the iframe via postMessage.

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, ExternalLink, Pause, Play, MousePointer2, X, Save, Sparkles, Loader2, Minimize2, Maximize2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Context-aware AI actions: route through the existing block-ai-action edge
// function by wrapping the focused text as a synthetic single-field block.
// Context passed: page URL + the surrounding DOM tag, so the model knows
// whether it's rewriting a heading, paragraph, button label, etc.
const AI_ACTIONS = [
  { id: "improve",  label: "Improve",  icon: Sparkles,   prompt: "Improve the copy in this {tag} text. Keep the brand voice premium, warm, concise, conversion-focused. Return only the rewritten text in the `text` field." },
  { id: "shorter",  label: "Shorter",  icon: Minimize2,  prompt: "Make this {tag} text noticeably shorter while preserving meaning and tone. Return only the rewritten text in the `text` field." },
  { id: "longer",   label: "Expand",   icon: Maximize2,  prompt: "Expand this {tag} text with one or two extra evocative sentences in the same brand voice. Return only the rewritten text in the `text` field." },
  { id: "rewrite",  label: "Rewrite",  icon: Wand2,      prompt: "Rewrite this {tag} text in a different angle, same intent, same length. Return only the rewritten text in the `text` field." },
];

export const LiveNavigateMode = ({ initialUrl = "/" }) => {
  const iframeRef = useRef(null);
  const [url, setUrl] = useState(initialUrl);
  const [editorUrl, setEditorUrl] = useState(initialUrl);
  const [editing, setEditing] = useState(false);
  const [focused, setFocused] = useState(null); // { selector, text, tag, url }
  const [draft, setDraft] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [aiBusy, setAiBusy] = useState(null); // action id while running

  const runAi = useCallback(async (action) => {
    if (!focused || !draft?.trim()) return;
    setAiBusy(action.id);
    try {
      const tag = focused.tag || "text";
      const promptTemplate = action.prompt.replace("{tag}", tag);
      const { data, error } = await supabase.functions.invoke("block-ai-action", {
        body: {
          blockType: "inlineText",
          fields: { text: { type: "textarea", label: "Text" } },
          content: { text: draft },
          action: action.id,
          promptTemplate,
          context: {
            siteName: "Christiano Vincenti Property Management",
            extra: `This text lives inside a <${tag}> element on the page ${focused.url || url}. Match the surrounding tone.`,
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const next = typeof data?.content?.text === "string" ? data.content.text : "";
      if (!next) throw new Error("AI returned empty text");
      setDraft(next);
      try { iframeRef.current?.contentWindow?.postMessage({ type: "cvpm:edit-push", selector: focused.selector, text: next }, "*"); } catch {}
      toast.success(`AI ${action.label.toLowerCase()} applied`);
    } catch (e) {
      const msg = e?.message || String(e);
      if (msg.includes("Rate limited")) toast.error("AI rate-limited — try again in a moment");
      else if (msg.includes("credits")) toast.error("AI credits exhausted — top up in Settings → Workspace → Usage");
      else toast.error(`AI failed: ${msg}`);
    } finally {
      setAiBusy(null);
    }
  }, [focused, draft, url]);

  const buildSrc = useCallback((path) => {
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}adminEdit=1`;
  }, []);

  // Listen to messages from the iframe
  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data;
      if (!d || typeof d !== "object" || !d.type?.startsWith?.("cvpm:")) return;
      if (d.type === "cvpm:ready" || d.type === "cvpm:url") {
        if (d.url) setUrl(d.url);
        if (d.url) setEditorUrl(d.url);
      } else if (d.type === "cvpm:edit-focus") {
        setFocused({ selector: d.selector, text: d.text, tag: d.tag, url: d.url });
        setDraft(d.text || "");
      } else if (d.type === "cvpm:edit-change") {
        // live mirror — keep textarea in sync if user is typing in iframe
        if (focused && d.selector === focused.selector) setDraft(d.text);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [focused]);

  // Toggle edit mode in iframe
  useEffect(() => {
    const w = iframeRef.current?.contentWindow;
    if (!w) return;
    try { w.postMessage({ type: "cvpm:edit-mode", on: editing }, "*"); } catch {}
    if (!editing) { setFocused(null); setDraft(""); }
  }, [editing, iframeKey]);

  const goTo = (newPath) => {
    if (!newPath.startsWith("/")) newPath = "/" + newPath;
    setEditorUrl(newPath);
    setUrl(newPath);
    setIframeKey(k => k + 1);
  };

  const reload = () => setIframeKey(k => k + 1);

  const applyEdit = async () => {
    if (!focused) return;
    // Push the new text back into the iframe
    const w = iframeRef.current?.contentWindow;
    try {
      w?.postMessage({ type: "cvpm:edit-push", selector: focused.selector, text: draft }, "*");
    } catch {}
    // Persist as a CMS overlay record so it survives reloads
    try {
      const overlayKey = "live_overlays";
      const { data: existing } = await supabase
        .from("cms_content")
        .select("content")
        .eq("section_key", overlayKey)
        .maybeSingle();
      const overlays = existing?.content?.items || [];
      const next = [
        ...overlays.filter(o => !(o.url === focused.url && o.selector === focused.selector)),
        { url: focused.url, selector: focused.selector, text: draft, ts: Date.now() },
      ].slice(-500);
      const { error } = await supabase.from("cms_content").upsert(
        { section_key: overlayKey, section_label: "Live Edit Overlays", content: { items: next } },
        { onConflict: "section_key" }
      );
      if (error) throw error;
      toast.success("Saved live edit");
    } catch (e) {
      toast.error("Could not persist (RLS): " + (e?.message || ""));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b]">
      {/* URL bar */}
      <div className="h-10 bg-[#0e0e10] border-b border-[#1a1a1e] flex items-center gap-2 px-3 shrink-0">
        <button onClick={() => iframeRef.current?.contentWindow?.history?.back()} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] rounded hover:bg-[#1a1a1e]" title="Back"><ArrowLeft className="w-3.5 h-3.5" /></button>
        <button onClick={() => iframeRef.current?.contentWindow?.history?.forward()} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] rounded hover:bg-[#1a1a1e]" title="Forward"><ArrowRight className="w-3.5 h-3.5" /></button>
        <button onClick={reload} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] rounded hover:bg-[#1a1a1e]" title="Reload"><RefreshCw className="w-3.5 h-3.5" /></button>
        <form
          onSubmit={(e) => { e.preventDefault(); goTo(editorUrl); }}
          className="flex-1 flex items-center gap-2"
        >
          <Input
            value={editorUrl}
            onChange={(e) => setEditorUrl(e.target.value)}
            className="h-7 text-[11px] bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] font-mono"
            placeholder="/properties"
          />
        </form>
        <button
          onClick={() => setEditing(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold rounded transition-all ${
            editing
              ? "bg-[#D4AF37] text-[#0a0a0b]"
              : "bg-[#1a1a1e] text-[#A1A1AA] hover:text-[#f0ede8]"
          }`}
          title={editing ? "Pause editing — resume navigation" : "Pause to edit anything on screen"}
        >
          {editing ? <><Pause className="w-3 h-3" />Editing</> : <><MousePointer2 className="w-3 h-3" />Pause to Edit</>}
        </button>
        <button onClick={() => window.open(url, "_blank")} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] rounded hover:bg-[#1a1a1e]" title="Open in new tab"><ExternalLink className="w-3.5 h-3.5" /></button>
      </div>

      {/* Quick navigate */}
      <div className="px-3 py-1.5 border-b border-[#1a1a1e] flex items-center gap-1 overflow-x-auto bg-[#08080a]">
        {[
          { l: "Home", u: "/" },
          { l: "Properties", u: "/properties" },
          { l: "Owners", u: "/property-owners" },
          { l: "Map", u: "/map" },
          { l: "Confirmation", u: "/confirmation" },
        ].map(p => (
          <button key={p.u} onClick={() => goTo(p.u)} className={`px-2 py-1 text-[10px] rounded font-medium whitespace-nowrap ${url === p.u ? "bg-[#D4AF37]/15 text-[#D4AF37]" : "text-[#6a6a6e] hover:text-[#f0ede8] hover:bg-[#1a1a1e]"}`}>{p.l}</button>
        ))}
      </div>

      {/* Iframe + side editor */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 bg-black relative">
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={buildSrc(url)}
            title="Live preview"
            className="w-full h-full border-0"
          />
          {!editing && (
            <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 bg-[#0a0a0b]/85 border border-[#1e1e22] text-[10px] text-[#A1A1AA] px-3 py-1.5 rounded-full">
              Navigation mode — click <b className="text-[#D4AF37]">Pause to Edit</b> to modify text on screen
            </div>
          )}
        </div>

        {/* Inline editor side panel — only when editing */}
        {editing && (
          <aside className="w-80 border-l border-[#1a1a1e] bg-[#0a0a0b] flex flex-col shrink-0">
            <div className="p-3 border-b border-[#1a1a1e] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-[#f0ede8]">Inline Editor</p>
                <p className="text-[9px] text-[#5a5a5e]">{focused ? `Selected: <${focused.tag}>` : "Click any text in the page"}</p>
              </div>
              {focused && (
                <button onClick={() => setFocused(null)} className="p-1 text-[#5a5a5e] hover:text-[#f0ede8]"><X className="w-3.5 h-3.5" /></button>
              )}
            </div>

            {!focused ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#5a5a5e]">
                <MousePointer2 className="w-8 h-8 mb-3 opacity-30" />
                <p className="text-[11px]">Hover over the page — editable text shows a gold outline. Click to edit.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#4a4a4e] mb-1">Selector</p>
                  <p className="text-[9px] text-[#A1A1AA] font-mono break-all bg-[#08080a] p-2 rounded border border-[#1a1a1e]">{focused.selector}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#4a4a4e] mb-1">Text</p>
                  <Textarea
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      // Live push as the user types in the side editor
                      try { iframeRef.current?.contentWindow?.postMessage({ type: "cvpm:edit-push", selector: focused.selector, text: e.target.value }, "*"); } catch {}
                    }}
                    className="bg-[#08080a] border-[#1e1e22] text-[#f0ede8] text-xs min-h-[140px] resize-none focus:border-[#D4AF37]/50"
                  />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#4a4a4e] mb-1.5 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" /> AI Actions</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {AI_ACTIONS.map((a) => {
                      const Icon = a.icon;
                      const busy = aiBusy === a.id;
                      const disabled = !!aiBusy || !draft?.trim();
                      return (
                        <button
                          key={a.id}
                          onClick={() => runAi(a)}
                          disabled={disabled}
                          className="flex items-center justify-center gap-1.5 h-8 px-2 text-[10px] font-medium rounded border border-[#1e1e22] bg-[#08080a] text-[#A1A1AA] hover:text-[#D4AF37] hover:border-[#D4AF37]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title={`${a.label} the selected text with AI (context: <${focused.tag}> on ${focused.url || url})`}
                        >
                          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button onClick={applyEdit} className="w-full h-9 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0a0a0b] text-xs font-semibold">
                  <Save className="w-3.5 h-3.5 mr-1.5" />Save Live Edit
                </Button>
                <p className="text-[9px] text-[#5a5a5e] leading-relaxed">
                  Live edits are saved as overlays. They re-apply on every reload of this page in the editor.
                  Use the block editor for structural changes.
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default LiveNavigateMode;
