// @ts-nocheck
// LiveNavigateMode — iframe-mirrored frontend with click-to-edit support.
// Communicates with EditModeBridge in the iframe via postMessage.

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, ExternalLink, Pause, Play, MousePointer2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const LiveNavigateMode = ({ initialUrl = "/" }) => {
  const iframeRef = useRef(null);
  const [url, setUrl] = useState(initialUrl);
  const [editorUrl, setEditorUrl] = useState(initialUrl);
  const [editing, setEditing] = useState(false);
  const [focused, setFocused] = useState(null); // { selector, text, tag, url }
  const [draft, setDraft] = useState("");
  const [iframeKey, setIframeKey] = useState(0);

  const buildSrc = useCallback((path) => {
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}adminEdit=1`;
  }, []);

  // Listen to messages from the iframe
  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data;
      if (!d || typeof d !== "object" || !d.type?.startsWith?.("cvpm:")) {
return;
}
      if (d.type === "cvpm:ready" || d.type === "cvpm:url") {
        if (d.url) {
setUrl(d.url);
}
        if (d.url) {
setEditorUrl(d.url);
}
      } else if (d.type === "cvpm:edit-focus") {
        setFocused({ selector: d.selector, text: d.text, tag: d.tag, url: d.url });
        setDraft(d.text || "");
      } else if (d.type === "cvpm:edit-change") {
        // live mirror — keep textarea in sync if user is typing in iframe
        if (focused && d.selector === focused.selector) {
setDraft(d.text);
}
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [focused]);

  // Toggle edit mode in iframe
  useEffect(() => {
    const w = iframeRef.current?.contentWindow;
    if (!w) {
return;
}
    try {
 w.postMessage({ type: "cvpm:edit-mode", on: editing }, "*"); 
} catch { /* empty */ }
    if (!editing) {
 setFocused(null); setDraft(""); 
}
  }, [editing, iframeKey]);

  const goTo = (newPath) => {
    if (!newPath.startsWith("/")) {
newPath = `/${  newPath}`;
}
    setEditorUrl(newPath);
    setUrl(newPath);
    setIframeKey(k => k + 1);
  };

  const reload = () => setIframeKey(k => k + 1);

  const applyEdit = async () => {
    if (!focused) {
return;
}
    // Push the new text back into the iframe
    const w = iframeRef.current?.contentWindow;
    try {
      w?.postMessage({ type: "cvpm:edit-push", selector: focused.selector, text: draft }, "*");
    } catch { /* empty */ }
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
      if (error) {
throw error;
}
      toast.success("Saved live edit");
    } catch (e) {
      toast.error(`Could not persist (RLS): ${  e?.message || ""}`);
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
          onSubmit={(e) => {
 e.preventDefault(); goTo(editorUrl); 
}}
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
              ? "bg-[#C9A84C] text-[#0a0a0b]"
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
          <button key={p.u} onClick={() => goTo(p.u)} className={`px-2 py-1 text-[10px] rounded font-medium whitespace-nowrap ${url === p.u ? "bg-[#C9A84C]/15 text-[#C9A84C]" : "text-[#6a6a6e] hover:text-[#f0ede8] hover:bg-[#1a1a1e]"}`}>{p.l}</button>
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
              Navigation mode — click <b className="text-[#C9A84C]">Pause to Edit</b> to modify text on screen
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
                       try {
 iframeRef.current?.contentWindow?.postMessage({ type: "cvpm:edit-push", selector: focused.selector, text: e.target.value }, "*"); 
} catch { /* empty */ }
                    }}
                    className="bg-[#08080a] border-[#1e1e22] text-[#f0ede8] text-xs min-h-[140px] resize-none focus:border-[#C9A84C]/50"
                  />
                </div>
                <Button onClick={applyEdit} className="w-full h-9 bg-[#C9A84C] hover:bg-[#D4B85C] text-[#0a0a0b] text-xs font-semibold">
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