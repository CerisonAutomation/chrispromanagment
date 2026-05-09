import { useState, useRef, useEffect, useMemo } from "react";
import {
  Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Sparkles,
  Eye, EyeOff, Save, RotateCcw, Loader2, Wand2, ChevronDown, ChevronRight,
  Home as HomeIcon, Building2, KeyRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CmsContent } from "@/hooks/use-cms";
import type { Json } from "@/integrations/supabase/types";

interface Props {
  sections: CmsContent[];
  onSave: (key: string, content: Json, isVisible?: boolean) => Promise<void>;
  isSaving: boolean;
}

type Device = "desktop" | "tablet" | "mobile";

const PAGES = [
  { path: "/", label: "Home", icon: HomeIcon, sectionKeys: ["hero", "proofStrip", "process", "portfolio", "pricing", "testimonials", "about", "ctaBanner", "faq"] },
  { path: "/booking", label: "Booking", icon: KeyRound, sectionKeys: ["hero", "portfolio", "ctaBanner"] },
  { path: "/owners", label: "Owners", icon: Building2, sectionKeys: ["hero", "process", "pricing", "ctaBanner"] },
];

const DEVICE_DIMS: Record<Device, { w: string; h: string; icon: typeof Monitor }> = {
  desktop: { w: "100%", h: "100%", icon: Monitor },
  tablet: { w: "820px", h: "1180px", icon: Tablet },
  mobile: { w: "390px", h: "844px", icon: Smartphone },
};

export default function MirrorCanvas({ sections, onSave, isSaving }: Props) {
  const [activePath, setActivePath] = useState("/");
  const [device, setDevice] = useState<Device>("desktop");
  const [activeKey, setActiveKey] = useState<string>("hero");
  const [draft, setDraft] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const page = useMemo(() => PAGES.find((p) => p.path === activePath)!, [activePath]);
  const visibleSections = useMemo(
    () => sections.filter((s) => page.sectionKeys.includes(s.section_key)),
    [sections, page]
  );
  const active = sections.find((s) => s.section_key === activeKey);

  useEffect(() => {
    if (active) setDraft(JSON.stringify(active.content, null, 2));
  }, [active?.id, active?.updated_at]);

  // Auto-pick first section on the page
  useEffect(() => {
    if (visibleSections[0] && !page.sectionKeys.includes(activeKey)) {
      setActiveKey(visibleSections[0].section_key);
    }
  }, [activePath]);

  let parsed: unknown = null;
  let valid = true;
  try { parsed = JSON.parse(draft); } catch { valid = false; }
  const dirty = active && draft !== JSON.stringify(active.content, null, 2);

  const reload = () => iframeRef.current?.contentWindow?.location.reload();

  const scrollIframeTo = (key: string) => {
    setActiveKey(key);
    iframeRef.current?.contentWindow?.postMessage({ type: "cms:scroll-to", sectionKey: key }, "*");
  };

  const toggleVisible = async (s: CmsContent) => {
    await onSave(s.section_key, s.content as Json, !s.is_visible);
  };

  const saveDraft = async () => {
    if (!active || !valid) return;
    await onSave(active.section_key, parsed as Json);
    toast({ title: "Saved", description: `${active.section_label} updated. Live preview refreshing.` });
  };

  const resetDraft = () => active && setDraft(JSON.stringify(active.content, null, 2));

  const runAi = async () => {
    if (!active || !aiPrompt.trim()) return;
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("cms-ai-generate", {
        body: {
          sectionKey: active.section_key,
          sectionLabel: active.section_label,
          currentContent: parsed ?? active.content,
          prompt: aiPrompt,
          mode: "refine",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDraft(JSON.stringify(data.content, null, 2));
      toast({ title: "AI draft ready", description: "Review and click Save to publish." });
      setAiPrompt("");
    } catch (e) {
      toast({ title: "AI failed", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" });
    } finally {
      setAiBusy(false);
    }
  };

  const dim = DEVICE_DIMS[device];

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] -m-6 lg:-m-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-card/60 backdrop-blur">
        <div className="flex items-center gap-1">
          {PAGES.map((p) => (
            <button
              key={p.path}
              onClick={() => setActivePath(p.path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
                activePath === p.path ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <p.icon size={13} /> {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {(Object.keys(DEVICE_DIMS) as Device[]).map((d) => {
            const Icon = DEVICE_DIMS[d].icon;
            return (
              <button
                key={d}
                onClick={() => setDevice(d)}
                title={d}
                className={`p-1.5 rounded-md transition-colors ${
                  device === d ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon size={14} />
              </button>
            );
          })}
          <button onClick={reload} className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary" title="Reload">
            <RefreshCw size={14} />
          </button>
          <a href={activePath} target="_blank" rel="noreferrer" className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary" title="Open in new tab">
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 grid grid-cols-12 min-h-0">
        {/* Left: blocks */}
        <aside className="col-span-3 xl:col-span-2 border-r border-border overflow-y-auto bg-card/30">
          <div className="p-3">
            <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Blocks · {page.label}</p>
            <div className="space-y-1">
              {visibleSections.map((s) => (
                <div
                  key={s.section_key}
                  className={`group rounded-md border transition-colors ${
                    activeKey === s.section_key ? "border-primary/50 bg-primary/5" : "border-transparent hover:border-border hover:bg-secondary/40"
                  }`}
                >
                  <button
                    onClick={() => scrollIframeTo(s.section_key)}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-left"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.is_visible ? "bg-emerald-500" : "bg-border"}`} />
                      <span className="text-xs font-medium truncate text-foreground">{s.section_label}</span>
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleVisible(s); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-primary"
                      title={s.is_visible ? "Hide" : "Show"}
                    >
                      {s.is_visible ? <Eye size={11} /> : <EyeOff size={11} />}
                    </button>
                  </button>
                </div>
              ))}
              {!visibleSections.length && (
                <p className="text-xs text-muted-foreground px-2 py-4">No CMS blocks tied to this page yet.</p>
              )}
            </div>
          </div>
        </aside>

        {/* Center: live mirror */}
        <div className="col-span-5 xl:col-span-6 bg-secondary/30 overflow-auto p-4 flex items-start justify-center">
          <motion.div
            key={device}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{ width: dim.w, maxWidth: "100%", height: device === "desktop" ? "100%" : dim.h }}
            className="bg-background rounded-lg overflow-hidden shadow-2xl border border-border"
          >
            <iframe
              ref={iframeRef}
              src={activePath}
              title="Live mirror"
              className="w-full h-full"
              style={{ minHeight: device === "desktop" ? "100%" : undefined }}
            />
          </motion.div>
        </div>

        {/* Right: editor */}
        <aside className="col-span-4 xl:col-span-4 border-l border-border overflow-y-auto bg-card/30 flex flex-col">
          {!active ? (
            <div className="p-6 text-sm text-muted-foreground">Select a block to edit.</div>
          ) : (
            <>
              <div className="p-4 border-b border-border">
                <h3 className="font-serif text-lg text-foreground">{active.section_label}</h3>
                <p className="text-[0.65rem] text-muted-foreground mt-0.5">key: <code className="text-primary">{active.section_key}</code></p>
              </div>

              <div className="p-3 border-b border-border">
                <button
                  onClick={() => setShowAi((v) => !v)}
                  className="w-full flex items-center justify-between text-xs font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-1.5"><Sparkles size={13} className="text-primary" /> AI Assistant</span>
                  {showAi ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
                <AnimatePresence>
                  {showAi && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-2">
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="e.g. Make the hero copy shorter and more urgent. Keep tone luxurious."
                          rows={3}
                          className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-2 focus:outline-none focus:border-primary/50 resize-none"
                        />
                        <button
                          onClick={runAi}
                          disabled={aiBusy || !aiPrompt.trim()}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-opacity"
                        >
                          {aiBusy ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                          {aiBusy ? "Generating…" : "Generate draft"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 p-3 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wider">Block JSON</span>
                  <span className={`text-[0.6rem] ${valid ? "text-emerald-500" : "text-destructive"}`}>{valid ? "valid" : "invalid"}</span>
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  spellCheck={false}
                  className={`flex-1 font-mono text-[11px] leading-relaxed bg-background border rounded-md p-3 resize-none focus:outline-none ${
                    valid ? "border-border focus:border-primary/50" : "border-destructive/60"
                  }`}
                />
              </div>

              <div className="p-3 border-t border-border flex items-center gap-2">
                <button
                  onClick={resetDraft}
                  disabled={!dirty}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary disabled:opacity-40"
                >
                  <RotateCcw size={12} /> Reset
                </button>
                <button
                  onClick={saveDraft}
                  disabled={!valid || !dirty || isSaving}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-opacity"
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {isSaving ? "Saving…" : dirty ? "Save & publish" : "Saved"}
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
