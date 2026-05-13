import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useCMS } from "@/context/CMSContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Layout, Eye, EyeOff, Save, LogOut, Plus, Trash2, GripVertical, Sparkles, RefreshCw,
  Home, Building, Star, ArrowUp, ArrowDown, Copy, Rocket, Undo2, Redo2, Monitor, Tablet, Smartphone,
  Award, ChartBar, Minus, Zap, Layers, Play,
  Check, X, Key, TrendingUp, Shield, Users, ImageIcon, Wand2, ChevronRight,
  MessageCircle, ClipboardList, Phone, Mail, MapPin, ArrowRight, MousePointer, Command, Code,
  RotateCcw, Loader2, ChevronDown, ExternalLink, Settings, Clock, BadgePercent, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SCHEMAS, CATEGORIES } from "@/lib/blocks";
import { BlockErrorBoundary } from "@/components/BlockErrorBoundary";
import { LiveNavigateMode } from "@/components/admin/LiveNavigateMode";
import { 
  LIVE_BLOCKS, LIVE_PAGE_TEMPLATES, BLOCK_CATEGORIES, InlineText,
  LiveHero, LiveOwnersSection, LiveAbout, LiveProperties, LiveStats, LiveFeatures,
  LiveTestimonials, LiveCTA, LiveOwnersHero, LivePricing, LiveWhyUs, LiveServices,
  LiveFAQ, LiveFooter, LiveHeader, LiveSpacer, LiveDivider, LiveLogos, LiveTeam,
  LiveSearch, LiveContact, LiveTextImage, LivePullQuote, LiveRichText, LiveBanner,
  LiveReviewsLive, LivePropertySlider, LiveNumbers, LiveMap, LiveImageGallery,
  LiveVideo, LiveTimeline, LiveNewsletter, LiveTwoCol, LiveIconRow, LiveComparison,
  LiveGuestyListings, LiveGuestyBook,
} from "@/components/admin/LiveBlocks";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

// Use exact frontend block renderers from LiveBlocks.jsx
const BLOCKS = LIVE_BLOCKS;

// AI ASSISTANT PANEL
// ============================================
const AIAssistant = memo(({ block, onApply, isGenerating }) => {
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);

  const runAI = async () => {
    if (!prompt.trim() || !block) return;
    onApply(prompt);
    setPrompt("");
  };

  return (
    <div className="border-b border-[#1e1e22]">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 text-sm font-medium text-[#f0ede8] hover:text-[#D4AF37] transition-colors">
        <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#D4AF37]" />AI Assistant</span>
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. Make the headline more urgent and action-oriented. Keep the luxurious tone."
            className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] text-xs min-h-[80px] resize-none focus:border-[#D4AF37]/50"
          />
          <div className="grid grid-cols-3 gap-2">
            {["Shorter", "More Luxury", "Action Words"].map(q => (
              <button key={q} onClick={() => setPrompt(p => p + (p ? ". " : "") + q)} className="px-2 py-1.5 text-[9px] bg-[#0e0e10] border border-[#1e1e22] rounded text-[#6a6a6e] hover:text-[#D4AF37] hover:border-[#D4AF37]/30">
                {q}
              </button>
            ))}
          </div>
          <Button onClick={runAI} disabled={isGenerating || !prompt.trim()} className="w-full bg-[#D4AF37] hover:bg-[#E5C158] text-[#0a0a0b] h-9 text-xs font-semibold">
            {isGenerating ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Generating...</> : <><Wand2 className="w-3.5 h-3.5 mr-2" />Generate Draft</>}
          </Button>
        </div>
      )}
    </div>
  );
});

// ============================================
// JSON EDITOR
// ============================================
const JSONEditor = memo(({ block, onUpdate }) => {
  const [draft, setDraft] = useState("");
  const [valid, setValid] = useState(true);

  useEffect(() => {
    if (block) setDraft(JSON.stringify(block.data, null, 2));
  }, [block?.id]);

  const handleChange = (val) => {
    setDraft(val);
    try { JSON.parse(val); setValid(true); } catch { setValid(false); }
  };

  const applyChanges = () => {
    if (!valid) return;
    try {
      const parsed = JSON.parse(draft);
      Object.keys(parsed).forEach(key => onUpdate(key, parsed[key]));
      toast.success("JSON changes applied");
    } catch { toast.error("Invalid JSON"); }
  };

  const dirty = block && draft !== JSON.stringify(block.data, null, 2);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-[#1e1e22]">
        <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium">Block JSON</span>
        <span className={`text-[10px] font-medium ${valid ? "text-green-500" : "text-red-400"}`}>{valid ? "Valid" : "Invalid"}</span>
      </div>
      <textarea
        value={draft}
        onChange={e => handleChange(e.target.value)}
        spellCheck={false}
        className={`flex-1 font-mono text-[10px] leading-relaxed bg-[#08080a] p-3 resize-none focus:outline-none ${valid ? "text-[#f0ede8]" : "text-red-300"}`}
      />
      <div className="p-3 border-t border-[#1e1e22] flex gap-2">
        <Button variant="outline" onClick={() => setDraft(JSON.stringify(block?.data, null, 2))} disabled={!dirty} className="flex-1 h-8 text-xs border-[#2a2a2e] text-[#6a6a6e]">
          <RotateCcw className="w-3 h-3 mr-1" />Reset
        </Button>
        <Button onClick={applyChanges} disabled={!valid || !dirty} className="flex-1 h-8 text-xs bg-[#D4AF37] text-[#0a0a0b]">
          <Check className="w-3 h-3 mr-1" />Apply
        </Button>
      </div>
    </div>
  );
});

// ============================================
// PROPS EDITOR — works with any block data
// ============================================
const PropsEditor = memo(({ block, onUpdate, onAI, isGenerating }) => {
  const schema = SCHEMAS[block?.type];
  
  if (!block) return (
    <div className="flex flex-col items-center justify-center h-full text-[#5a5a5e] text-xs p-6">
      <MousePointer className="w-10 h-10 mb-4 opacity-30" />
      <p className="text-center">Click a block on the canvas to edit its content</p>
    </div>
  );

  // ── Field renderer for schema-defined fields ──
  const renderField = (key, f, val) => {
    const common = "h-9 text-xs bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] focus:border-[#D4AF37]/50";
    if (f.type === "array") {
      const items = val || [];
      return (
        <div key={key} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium">{f.label}</span>
            <button onClick={() => onUpdate(key, [...items, {}])} className="p-1 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="p-2 bg-[#08080a] border border-[#1e1e22] rounded">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] text-[#4a4a4e] font-medium">#{i + 1}</span>
                  <button onClick={() => onUpdate(key, items.filter((_, idx) => idx !== i))} className="p-0.5 text-red-400/60 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
                {(f.itemFields || Object.keys(item)).map(sf => (
                  <div key={sf} className="mb-1">
                    <p className="text-[9px] text-[#4a4a4e] mb-0.5">{sf}</p>
                    <Input value={item[sf] || ""} onChange={e => { const n = [...items]; n[i] = { ...n[i], [sf]: e.target.value }; onUpdate(key, n); }} placeholder={sf} className={`${common} h-7 text-[10px]`} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div key={key} className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium">{f.label}</span>
          {f.ai && <button onClick={() => onAI(key, f.label)} disabled={isGenerating} className="p-1 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors"><Sparkles className="w-3 h-3" /></button>}
        </div>
        {f.type === "textarea" ? <Textarea value={val || ""} onChange={e => onUpdate(key, e.target.value)} className={`${common} min-h-[70px] resize-none`} />
        : f.type === "select" ? <select value={val || f.options?.[0]} onChange={e => onUpdate(key, e.target.value)} className={`${common} w-full rounded-md px-3`}>{(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}</select>
        : f.type === "number" ? <Input type="number" value={val || 0} onChange={e => onUpdate(key, parseInt(e.target.value) || 0)} className={common} />
        : f.type === "boolean" ? <input type="checkbox" checked={!!val} onChange={e => onUpdate(key, e.target.checked)} className="w-5 h-5 accent-[#D4AF37]" />
        : <Input value={val || ""} onChange={e => onUpdate(key, e.target.value)} className={common} />}
      </div>
    );
  };

  // ── Render with schema if available ──
  if (schema) {
    const Icon = schema.icon || Layout;
    return (
      <div>
        <div className="flex items-center gap-3 p-4 border-b border-[#1e1e22]">
          <div className="w-9 h-9 rounded bg-[#D4AF37]/15 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-[#D4AF37]" /></div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-[#f0ede8] block truncate">{schema.label}</span>
            <span className="text-[9px] text-[#4a4a4e]">{block.type}</span>
          </div>
          <button onClick={() => onAI("_all", "all")} disabled={isGenerating} className="px-2.5 py-1.5 text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] rounded hover:bg-[#D4AF37]/20 font-medium flex items-center gap-1 shrink-0">
            <Wand2 className="w-3 h-3" />{isGenerating ? "..." : "AI All"}
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
          {Object.entries(schema.fields).map(([k, f]) => renderField(k, f, block.data[k]))}
        </div>
      </div>
    );
  }

  // ── Smart editor for live blocks without SCHEMAS ──
  const blockData = block.data || {};
  const blockTypeLabel = block.type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const renderSmartField = (key, val) => {
    const common = "h-9 text-xs bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] focus:border-[#D4AF37]/50";
    if (Array.isArray(val)) {
      return (
        <div key={key} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium">{key}</span>
            <button onClick={() => onUpdate(key, [...val, {}])} className="p-1 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {val.map((item, i) => (
              <div key={i} className="p-2 bg-[#08080a] border border-[#1e1e22] rounded">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] text-[#4a4a4e]">#{i + 1}</span>
                  <button onClick={() => onUpdate(key, val.filter((_, idx) => idx !== i))} className="p-0.5 text-red-400/60 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
                {typeof item === "object" ? Object.entries(item).map(([sf, sv]) => (
                  <div key={sf} className="mb-1">
                    <p className="text-[9px] text-[#4a4a4e] mb-0.5">{sf}</p>
                    <Input value={sv || ""} onChange={e => { const n = [...val]; n[i] = { ...n[i], [sf]: e.target.value }; onUpdate(key, n); }} className={`${common} h-7 text-[10px]`} />
                  </div>
                )) : (
                  <Input value={item || ""} onChange={e => { const n = [...val]; n[i] = e.target.value; onUpdate(key, n); }} className={`${common} h-7 text-[10px]`} />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (typeof val === "boolean") {
      return (
        <div key={key} className="flex items-center gap-3 mb-3">
          <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium flex-1">{key}</span>
          <input type="checkbox" checked={!!val} onChange={e => onUpdate(key, e.target.checked)} className="w-4 h-4 accent-[#D4AF37]" />
        </div>
      );
    }
    if (typeof val === "number") {
      return (
        <div key={key} className="mb-3">
          <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium block mb-1">{key}</span>
          <Input type="number" value={val} onChange={e => onUpdate(key, parseInt(e.target.value) || 0)} className={common} />
        </div>
      );
    }
    const isLong = String(val).length > 80;
    return (
      <div key={key} className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium">{key}</span>
          <button onClick={() => onAI(key, key)} disabled={isGenerating} className="p-1 text-[#D4AF37]/40 hover:text-[#D4AF37] transition-colors" title="AI generate">
            <Sparkles className="w-3 h-3" />
          </button>
        </div>
        {isLong
          ? <Textarea value={val || ""} onChange={e => onUpdate(key, e.target.value)} className={`${common} min-h-[60px] resize-none h-auto`} />
          : <Input value={val || ""} onChange={e => onUpdate(key, e.target.value)} className={common} />
        }
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3 p-4 border-b border-[#1e1e22]">
        <div className="w-9 h-9 rounded bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
          <Layout className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-[#f0ede8] block truncate">{blockTypeLabel}</span>
          <span className="text-[9px] text-[#4a4a4e]">{block.type}</span>
        </div>
        <button onClick={() => onAI("_all", "all")} disabled={isGenerating} className="px-2.5 py-1.5 text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] rounded hover:bg-[#D4AF37]/20 font-medium flex items-center gap-1 shrink-0">
          <Wand2 className="w-3 h-3" />{isGenerating ? "..." : "AI All"}
        </button>
      </div>
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
        <p className="text-[9px] text-[#4a4a4e] mb-4 uppercase tracking-wider">Block fields (click text on canvas to edit inline)</p>
        {Object.entries(blockData).map(([k, v]) => renderSmartField(k, v))}
        {Object.keys(blockData).length === 0 && (
          <p className="text-[#5a5a5e] text-xs text-center py-4">No editable fields. Edit content by clicking directly on the canvas.</p>
        )}
      </div>
    </div>
  );
});

// ============================================
// ENTERPRISE AI PANEL
// Full-power AI: generate, rewrite, SEO, page build
// Uses /api/ai/generate backend (ai_service.py → emergent LLM / GPT-4o)
// ============================================
const AI_QUICK_PROMPTS = [
  { label:"Rewrite — luxury tone",   prompt:"Rewrite all text fields in a more luxurious, premium tone. Sophisticated and aspirational. Malta property context." },
  { label:"Rewrite — concise",       prompt:"Make all text fields shorter and punchier. Cut filler words. Preserve meaning but tighten." },
  { label:"Hero copy",               prompt:"Generate a compelling hero section: badge, headline with accent, subheadline, two CTAs. Luxury Malta property management brand." },
  { label:"Add social proof",        prompt:"Enhance copy to include trust signals, social proof, and authority markers appropriate for luxury Malta property management." },
  { label:"SEO-optimise",            prompt:"Rewrite all text fields to be SEO-optimised for 'Malta property management' and 'luxury vacation rentals Malta'." },
  { label:"Add urgency",             prompt:"Add tasteful urgency and scarcity signals to the copy. No fake pressure. Premium brand tone." },
  { label:"Guest perspective",       prompt:"Rewrite copy from a guest's perspective — aspirational, experiential, evocative of Malta luxury travel." },
  { label:"Owner perspective",       prompt:"Rewrite copy from a property owner's perspective — focus on ROI, transparency, trust, and passive income." },
];

const PAGE_BUILD_TEMPLATES = {
  home: "Generate a complete home page for Christiano Property Management, a luxury short-term rental management company in Malta. Include: hero, stats, properties grid (live from Guesty), features, testimonials, pricing, CTA.",
  owners: "Generate a For Owners page for Christiano Property Management Malta. Include: owners hero, why us section, services list, pricing plans, FAQ, CTA.",
  properties: "Generate a Properties page for Christiano Property Management Malta. Include: hero, search widget, live Guesty listings grid.",
  about: "Generate an About Us page for Christiano Property Management Malta. Include: hero, about split section, numbers/stats, team, logos trust bar, CTA.",
  contact: "Generate a Contact page for Christiano Property Management Malta. Include: contact form with address/phone/email, map.",
};

const EnterpriseAIPanel = memo(({ block, blocks, onApplyBlock, onReplaceBlocks, page, api, adminKey }) => {
  const [mode,      setMode]      = useState("field");  // "field" | "page" | "critique"
  const [prompt,    setPrompt]    = useState("");
  const [result,    setResult]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [history,   setHistory]   = useState([]); // {prompt, result, mode, ts}
  const [showHist,  setShowHist]  = useState(false);

  const run = async (overridePrompt) => {
    const p = overridePrompt || prompt;
    if (!p.trim()) return;
    setLoading(true); setStreaming(true); setResult("");

    try {
      const body = {
        prompt: mode === "field"
          ? (block ? `Block type: ${block.type}. Current data: ${JSON.stringify(block.data).slice(0,600)}.\n\nTask: ${p}\n\nReturn improved JSON object with same keys, or just the text for a single field.` : p)
          : mode === "page"
          ? `${p}\n\nReturn a JSON array of blocks: [{type, data}]. Use these block types: hero, stats, features, owners, pricing, faq, cta, testimonials, properties, guesty_listings, about, why_us, services, comparison, footer. Match Christiano Property Management brand voice.`
          : `Critique this page structure for a luxury Malta property management site.\nBlocks: ${blocks.map(b=>b.type).join(", ")}.\nTotal: ${blocks.length} blocks.\nProvide 5-7 specific, actionable improvements. Be direct.`,
        section: block?.type || page,
        mode,
      };

      const res = await fetch(`${api}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const text = data.content || data.text || "";

      // Simulate streaming display
      let displayed = "";
      for (let i = 0; i < text.length; i += 6) {
        displayed = text.slice(0, i + 6);
        setResult(displayed);
        await new Promise(r => setTimeout(r, 8));
      }
      setResult(text);
      setHistory(h => [{ prompt: p, result: text, mode, ts: Date.now() }, ...h.slice(0, 9)]);
    } catch (e) {
      setResult(`Error: ${e.message}. Check backend /api/ai/generate is running and EMERGENT_LLM_KEY is set.`);
    }
    setLoading(false); setStreaming(false);
  };

  const applyResult = () => {
    if (!result) return;
    if (mode === "page") {
      try {
        const raw = result.replace(/```json\n?|```/g, "").trim();
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const uid = () => `b${Date.now()}${Math.random().toString(36).slice(2,6)}`;
          onReplaceBlocks(parsed.map(b => ({ id: uid(), type: b.type, data: b.data || {}, visible: true })));
          toast.success(`Page built: ${parsed.length} blocks`);
        }
      } catch { toast.error("Could not parse page blocks JSON"); }
    } else if (mode === "field" && block) {
      try {
        const raw = result.replace(/```json\n?|```/g, "").trim();
        if (raw.startsWith("{")) {
          const parsed = JSON.parse(raw);
          Object.keys(parsed).forEach(k => onApplyBlock(k, parsed[k]));
          toast.success("Applied to block");
        } else {
          // Single field — apply to first text field
          const schema = block.data;
          const firstTextField = Object.keys(schema).find(k => typeof schema[k] === "string" && k !== "backgroundImage");
          if (firstTextField) { onApplyBlock(firstTextField, raw); toast.success(`Applied to "${firstTextField}"`); }
        }
      } catch {
        navigator.clipboard?.writeText(result);
        toast.success("Copied to clipboard");
      }
    } else {
      navigator.clipboard?.writeText(result);
      toast.success("Copied to clipboard");
    }
  };

  const wordCount = result.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-[#1a1a1e]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded bg-[#7c6af5]/15 border border-[#7c6af5]/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#a89ff8]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#f0ede8]">Enterprise AI</p>
            <p className="text-[9px] text-[#4a4a4e]">GPT-4o via Emergent LLM</p>
          </div>
          <button onClick={() => setShowHist(h => !h)} className="ml-auto p-1.5 text-[#4a4a4e] hover:text-[#D4AF37]" title="History">
            <Clock className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex gap-1 p-0.5 bg-[#0e0e10] rounded">
          {[["field","Field"],["page","Page"],["critique","Audit"]].map(([m,l]) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-1 text-[9px] font-medium rounded transition-all ${mode===m ? "bg-[#1a1a1e] text-[#D4AF37]" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* History panel */}
      {showHist && history.length > 0 && (
        <div className="border-b border-[#1a1a1e] max-h-48 overflow-y-auto bg-[#060608]">
          <p className="text-[9px] text-[#4a4a4e] px-3 py-2 uppercase tracking-wider">Recent generations</p>
          {history.map((h, i) => (
            <button key={i} onClick={() => { setPrompt(h.prompt); setResult(h.result); setMode(h.mode); setShowHist(false); }} className="w-full text-left px-3 py-2 hover:bg-[#1a1a1e] border-b border-[#1a1a1e] last:border-0">
              <p className="text-[10px] text-[#f0ede8] truncate">{h.prompt.slice(0,55)}</p>
              <p className="text-[9px] text-[#4a4a4e] mt-0.5">{h.mode} · {new Date(h.ts).toLocaleTimeString()}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Context indicator */}
        {mode === "field" && (
          <div className={`text-[9px] px-2 py-1.5 rounded flex items-center gap-2 ${block ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-[#1a1a1e] text-[#5a5a5e]"}`}>
            <Layout className="w-3 h-3 shrink-0" />
            {block ? `Target: ${block.type.replace(/_/g," ")}` : "Select a block on canvas to target it"}
          </div>
        )}
        {mode === "page" && (
          <div className="text-[9px] px-2 py-1.5 rounded bg-[#7c6af5]/10 text-[#a89ff8] flex items-center gap-2">
            <Layers className="w-3 h-3 shrink-0" />
            Generates complete page — replaces current blocks
          </div>
        )}

        {/* Quick prompts */}
        <div>
          <p className="text-[9px] text-[#4a4a4e] uppercase tracking-wider mb-2">
            {mode === "page" ? "Page templates" : mode === "critique" ? "Run audit" : "Quick prompts"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {mode === "page"
              ? Object.entries(PAGE_BUILD_TEMPLATES).map(([k, v]) => (
                  <button key={k} onClick={() => { setPrompt(v); run(v); }} className="px-2 py-1 text-[9px] border border-[#1e1e22] rounded text-[#6a6a6e] hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all capitalize">{k}</button>
                ))
              : mode === "critique"
              ? <button onClick={() => run("Critique this page structure.")} className="px-3 py-1.5 text-[9px] border border-[#7c6af5]/30 rounded text-[#a89ff8] bg-[#7c6af5]/10 hover:bg-[#7c6af5]/20 transition-all">Run page audit now</button>
              : AI_QUICK_PROMPTS.map((qp, i) => (
                  <button key={i} onClick={() => { setPrompt(qp.prompt); }} className={`px-2 py-1 text-[9px] border rounded transition-all ${prompt === qp.prompt ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]" : "border-[#1e1e22] text-[#6a6a6e] hover:border-[#D4AF37]/30 hover:text-[#f0ede8]"}`}>{qp.label}</button>
                ))
            }
          </div>
        </div>

        {/* Prompt textarea */}
        <div>
          <p className="text-[9px] text-[#4a4a4e] uppercase tracking-wider mb-1.5">Prompt</p>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run(); }}
            placeholder={mode === "page" ? "Describe the page you want to build..." : mode === "critique" ? "Add specific concerns to audit..." : "Describe what to generate or how to improve..."}
            rows={4}
            className="w-full bg-[#0e0e10] border border-[#1e1e22] rounded text-[11px] text-[#f0ede8] p-2 resize-none focus:outline-none focus:border-[#D4AF37]/40 leading-relaxed"
          />
          <p className="text-[8px] text-[#3a3a3e] mt-0.5">⌘↵ to generate</p>
        </div>

        {/* Generate button */}
        <button
          onClick={() => run()}
          disabled={loading || !prompt.trim()}
          className={`w-full py-2.5 rounded flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wider transition-all ${loading ? "bg-[#7c6af5]/20 text-[#a89ff8] cursor-wait" : "bg-[#D4AF37] text-[#0a0a0b] hover:bg-[#E5C158]"}`}
        >
          {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating…</> : <><Sparkles className="w-3.5 h-3.5" />Generate</>}
        </button>

        {/* Result */}
        {(result || streaming) && (
          <div className="bg-[#060608] border border-[#1a1a1e] rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1e]">
              <div className="flex items-center gap-2">
                {streaming
                  ? <><Loader2 className="w-3 h-3 animate-spin text-[#a89ff8]" /><span className="text-[9px] text-[#a89ff8]">Generating…</span></>
                  : <><Check className="w-3 h-3 text-green-500" /><span className="text-[9px] text-green-500">Ready</span></>
                }
              </div>
              <span className="text-[9px] text-[#4a4a4e]">{wordCount} words</span>
            </div>
            <div className="p-3 max-h-52 overflow-y-auto">
              <pre className="text-[10px] text-[#c0bdb5] whitespace-pre-wrap font-mono leading-relaxed break-all">{result}</pre>
            </div>
            <div className="flex gap-2 p-2 border-t border-[#1a1a1e]">
              <button onClick={applyResult} disabled={streaming} className="flex-1 py-1.5 text-[9px] bg-[#D4AF37]/15 text-[#D4AF37] rounded hover:bg-[#D4AF37]/25 font-medium disabled:opacity-40">
                Apply
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(result); toast.success("Copied"); }} className="flex-1 py-1.5 text-[9px] bg-[#1a1a1e] text-[#6a6a6e] rounded hover:text-[#f0ede8]">
                Copy
              </button>
              <button onClick={() => { setResult(""); setPrompt(""); }} className="px-2 py-1.5 text-[9px] text-[#3a3a3e] hover:text-[#6a6a6e]">Clear</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ============================================
// SEO PANEL — live score + AI auto-fill
// ============================================
const SEOPanel = memo(({ blocks, page, api, adminKey }) => {
  const [seo,     setSeo]     = useState({ title:"", description:"", keywords:"", ogImage:"" });
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

  // SEO score
  const score = (() => {
    let s = 0;
    if (seo.title?.length >= 30 && seo.title?.length <= 60) s += 25; else if (seo.title) s += 10;
    if (seo.description?.length >= 120 && seo.description?.length <= 160) s += 25; else if (seo.description) s += 10;
    if (seo.keywords) s += 15;
    if (seo.ogImage) s += 10;
    if (blocks.some(b => b.data?.headline || b.data?.title || b.data?.badge)) s += 25;
    return Math.min(100, s);
  })();
  const scoreColor = score >= 80 ? "#52c27a" : score >= 50 ? "#E5C158" : "#e05252";

  const checks = [
    { ok: seo.title?.length >= 30 && seo.title?.length <= 60, label:"Title 30-60 chars", detail: `${seo.title?.length||0} chars` },
    { ok: seo.description?.length >= 120 && seo.description?.length <= 160, label:"Description 120-160 chars", detail: `${seo.description?.length||0} chars` },
    { ok: !!seo.keywords, label:"Keywords set", detail: seo.keywords ? "Set" : "Missing" },
    { ok: !!seo.ogImage, label:"OG image set", detail: seo.ogImage ? "Set" : "Missing" },
    { ok: blocks.some(b => b.data?.headline || b.data?.title), label:"H1 heading in page", detail: "Detected from blocks" },
  ];

  const autoFill = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/ai/generate-seo`, {
        method: "POST",
        headers: { "Content-Type":"application/json", "X-Admin-Key": adminKey },
        body: JSON.stringify({ page }),
      });
      const data = await res.json();
      if (data.title)       setSeo(s => ({ ...s, title:       data.title }));
      if (data.description) setSeo(s => ({ ...s, description: data.description }));
      if (data.keywords)    setSeo(s => ({ ...s, keywords:    data.keywords }));
      toast.success("SEO auto-filled by AI");
    } catch (e) { toast.error("SEO AI failed: " + e.message); }
    setLoading(false);
  };

  const saveSEO = async () => {
    try {
      await fetch(`${api}/cms/admin/seo`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", "X-Admin-Key": adminKey },
        body: JSON.stringify({ page, ...seo }),
      });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      toast.success("SEO saved");
    } catch { toast.error("SEO save failed"); }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Score ring */}
      <div className="flex items-center gap-3 p-3 bg-[#0e0e10] rounded border border-[#1a1a1e]">
        <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 font-bold text-base" style={{ borderColor: scoreColor, color: scoreColor }}>{score}</div>
        <div>
          <p className="text-[11px] font-semibold text-[#f0ede8]">SEO Score</p>
          <p className="text-[9px] text-[#5a5a5e]">{score >= 80 ? "Good — keep refining" : score >= 50 ? "Average — improve description & keywords" : "Needs work — fill all fields"}</p>
        </div>
      </div>

      {/* Fields */}
      {[
        { key:"title",       label:`Title (${seo.title?.length||0}/60)`,                  multi:false, ph:"Christiano Property Management | Malta Luxury Rentals" },
        { key:"description", label:`Description (${seo.description?.length||0}/160)`,     multi:true,  ph:"Malta's premier luxury short-term rental management company..." },
        { key:"keywords",    label:"Keywords",                                              multi:false, ph:"malta property management, vacation rentals malta, airbnb management" },
        { key:"ogImage",     label:"OG Image URL",                                         multi:false, ph:"https://..." },
      ].map(f => (
        <div key={f.key}>
          <p className="text-[10px] uppercase tracking-wider text-[#5a5a5e] mb-1.5 font-medium">{f.label}</p>
          {f.multi
            ? <textarea rows={3} value={seo[f.key]||""} onChange={e => setSeo(s=>({...s,[f.key]:e.target.value}))} placeholder={f.ph} className="w-full bg-[#0e0e10] border border-[#1e1e22] rounded text-[11px] text-[#f0ede8] p-2 resize-none focus:outline-none focus:border-[#D4AF37]/40 leading-relaxed" />
            : <input  type="text" value={seo[f.key]||""} onChange={e => setSeo(s=>({...s,[f.key]:e.target.value}))} placeholder={f.ph} className="w-full bg-[#0e0e10] border border-[#1e1e22] rounded text-[11px] text-[#f0ede8] px-2 h-9 focus:outline-none focus:border-[#D4AF37]/40" />
          }
        </div>
      ))}

      {/* Checks */}
      <div className="space-y-2">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <span style={{ color: c.ok ? "#52c27a" : "#e05252" }}>{c.ok ? "✓" : "✗"}</span>
            <span className="flex-1 text-[#8a8a8e]">{c.label}</span>
            <span className="text-[#4a4a4e]">{c.detail}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={autoFill} disabled={loading} className="flex-1 py-2 text-[9px] bg-[#7c6af5]/15 text-[#a89ff8] rounded font-semibold uppercase tracking-wider hover:bg-[#7c6af5]/25 disabled:opacity-50 flex items-center justify-center gap-1.5">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI Fill
        </button>
        <button onClick={saveSEO} className={`flex-1 py-2 text-[9px] rounded font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 ${saved ? "bg-green-500/20 text-green-400" : "bg-[#D4AF37] text-[#0a0a0b] hover:bg-[#E5C158]"}`}>
          {saved ? <><Check className="w-3 h-3" />Saved</> : <><Save className="w-3 h-3" />Save SEO</>}
        </button>
      </div>
    </div>
  );
});

// ============================================
// SUGGEST PANEL — AI page critique + missing blocks
// ============================================
const MISSING_BLOCK_SUGGESTIONS = [
  { type:"stats",        label:"Stats Bar",      reason:"Trust signals boost conversions by 25%" },
  { type:"testimonials", label:"Testimonials",   reason:"Social proof is the #1 conversion driver" },
  { type:"pricing",      label:"Pricing Table",  reason:"Clear pricing reduces decision friction" },
  { type:"faq",          label:"FAQ",            reason:"FAQs reduce support burden by 30%" },
  { type:"cta",          label:"Call to Action", reason:"Every page needs a clear conversion goal" },
  { type:"reviews_live", label:"Live Reviews",   reason:"Real-time Guesty reviews build trust" },
  { type:"numbers",      label:"Big Numbers",    reason:"Impact statistics establish authority" },
  { type:"comparison",   label:"Comparison",     reason:"Feature tables help owners decide faster" },
];

const SuggestPanel = memo(({ blocks, onAdd, onAI, selected }) => {
  const [critique, setCritique] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const existing = new Set(blocks.map(b => b.type));

  const runCritique = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/generate`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          prompt: `Critique this Malta luxury property management page structure.\nBlocks present: ${blocks.map(b=>b.type).join(", ")}\nTotal: ${blocks.length} blocks\n\nProvide exactly 5 critiques as a JSON array: [{"type":"good|warn|improve","title":"short title","detail":"1 sentence action"}]. Return JSON only.`,
          section:"page", mode:"critique"
        }),
      });
      const data = await res.json();
      const raw = (data.content||"").replace(/```json\n?|```/g,"").trim();
      try { setCritique(JSON.parse(raw)); } catch { setCritique([{type:"warn",title:"Parse error",detail:"AI returned unstructured feedback — check backend logs."}]); }
    } catch (e) { setCritique([{type:"warn",title:"AI unavailable",detail:"Could not reach backend: " + e.message}]); }
    setLoading(false);
  };

  const color = { good:"#52c27a", warn:"#E5C158", improve:"#7c6af5" };

  const missing = MISSING_BLOCK_SUGGESTIONS.filter(s => !existing.has(s.type));

  return (
    <div className="p-3 flex flex-col gap-4">
      {/* AI Critique */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] uppercase tracking-wider text-[#5a5a5e] font-medium">AI Page Audit</p>
          <span className="text-[9px] text-[#4a4a4e]">{blocks.length} blocks</span>
        </div>
        <button onClick={runCritique} disabled={loading} className="w-full py-2 text-[9px] bg-[#7c6af5]/10 text-[#a89ff8] border border-[#7c6af5]/20 rounded font-medium uppercase tracking-wider hover:bg-[#7c6af5]/20 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {loading ? "Analysing…" : "Audit Page Structure"}
        </button>
        {critique && (
          <div className="mt-3 space-y-2">
            {critique.map((c, i) => (
              <div key={i} className="flex gap-2 p-2.5 bg-[#0e0e10] rounded border border-[#1a1a1e]">
                <div className="w-1.5 h-full rounded-full shrink-0 mt-0.5" style={{ background: color[c.type] || "#888", minHeight:30 }} />
                <div>
                  <p className="text-[10px] font-semibold text-[#f0ede8]">{c.title}</p>
                  <p className="text-[9px] text-[#6a6a6e] mt-0.5 leading-relaxed">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick fixes for selected block */}
      {selected && (
        <div>
          <p className="text-[9px] uppercase tracking-wider text-[#5a5a5e] mb-2 font-medium">Quick AI for selected block</p>
          {[
            "Make it more compelling",
            "Add a specific Malta reference",
            "Shorten and punch it up",
            "Add social proof signals",
          ].map((p, i) => (
            <button key={i} onClick={() => onAI(p)} className="w-full text-left px-3 py-2 text-[10px] text-[#8a8a8e] hover:text-[#f0ede8] hover:bg-[#1a1a1e] rounded mb-1 transition-colors">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Missing blocks */}
      {missing.length > 0 && (
        <div>
          <p className="text-[9px] uppercase tracking-wider text-[#5a5a5e] mb-2 font-medium">Recommended Additions</p>
          <div className="space-y-1.5">
            {missing.slice(0, 6).map(s => (
              <div key={s.type} className="flex items-center gap-2 p-2.5 bg-[#0e0e10] rounded border border-[#1a1a1e] hover:border-[#D4AF37]/20 group">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-[#f0ede8]">{s.label}</p>
                  <p className="text-[9px] text-[#5a5a5e] truncate">{s.reason}</p>
                </div>
                <button onClick={() => { onAdd(s.type); toast.success(`${s.label} added`); }} className="px-2.5 py-1 text-[8px] bg-[#D4AF37]/10 text-[#D4AF37] rounded font-semibold uppercase tracking-wider hover:bg-[#D4AF37]/20 shrink-0">
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page health */}
      <div className="p-3 bg-[#0e0e10] rounded border border-[#1a1a1e]">
        <p className="text-[9px] uppercase tracking-wider text-[#5a5a5e] mb-2 font-medium">Page Health</p>
        {[
          { label:"Has Header",      ok: existing.has("header") },
          { label:"Has Hero",        ok: existing.has("hero") || existing.has("owners_hero") },
          { label:"Has CTA",         ok: existing.has("cta") },
          { label:"Has Footer",      ok: existing.has("footer") },
          { label:"Has Social Proof",ok: existing.has("testimonials") || existing.has("reviews_live") },
          { label:"Has Live Data",   ok: existing.has("properties") || existing.has("guesty_listings") || existing.has("guesty_book") },
        ].map((c, i) => (
          <div key={i} className="flex items-center gap-2 mb-1.5">
            <span style={{ color: c.ok ? "#52c27a" : "#e05252" }} className="text-[11px]">{c.ok ? "✓" : "✗"}</span>
            <span className="text-[10px] text-[#8a8a8e]">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// ============================================
// MAIN ADMIN COMPONENT
// ============================================
// BLOCK CATEGORY SECTION (Add Panel)
// ============================================
const BlockCategorySection = memo(({ cat, onAdd }) => {
  const [open, setOpen] = useState(cat.id === "page" || cat.id === "content");
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-1.5 text-[8px] uppercase tracking-wider text-[#4a4a4e] font-semibold hover:text-[#D4AF37] transition-colors"
      >
        <span>{cat.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-1 mb-1">
          {cat.blocks.map(({ type, label, desc }) => (
            <button
              key={type}
              onClick={() => onAdd(type)}
              title={desc}
              className="flex flex-col items-start gap-1 p-2 bg-[#0e0e10] border border-[#1a1a1e] rounded hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 group text-left"
            >
              <Layout className="w-3.5 h-3.5 text-[#5a5a5e] group-hover:text-[#D4AF37]" />
              <span className="text-[8px] text-[#6a6a6e] group-hover:text-[#f0ede8] font-medium truncate w-full">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// ============================================
// ADMIN DASHBOARD - 10 GAMECHANGERS
// ============================================
const AdminDashboard = memo(({ adminKey }) => {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  const headers = { "X-Admin-Key": adminKey };

  const fetchData = async (key, url) => {
    setLoading(l => ({ ...l, [key]: true }));
    setError(e => ({ ...e, [key]: null }));
    try {
      const res = await fetch(`${API}${url}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(d => ({ ...d, [key]: json }));
    } catch (err) {
      setError(e => ({ ...e, [key]: err.message }));
    } finally {
      setLoading(l => ({ ...l, [key]: false }));
    }
  };

  useEffect(() => {
    fetchData("stats", "/admin/stats");
    fetchData("bookings", "/admin/bookings?limit=20");
    fetchData("inbox", "/admin/inbox");
    fetchData("reviews", "/admin/reviews?limit=10");
    fetchData("properties", "/admin/properties");
    fetchData("revenue", "/admin/analytics/revenue");
    fetchData("coupons", "/admin/coupons");
    fetchData("health", "/admin/system/health");
  }, [adminKey]);

  const TABS = [
    { id: "overview", icon: ChartBar, label: "Overview" },
    { id: "bookings", icon: ClipboardList, label: "Bookings" },
    { id: "revenue", icon: TrendingUp, label: "Revenue" },
    { id: "properties", icon: Building, label: "Properties" },
    { id: "reviews", icon: Star, label: "Reviews" },
    { id: "inbox", icon: MessageCircle, label: "Inbox" },
    { id: "coupons", icon: Zap, label: "Coupons" },
    { id: "seo", icon: Code, label: "SEO" },
    { id: "media", icon: ImageIcon, label: "Media" },
    { id: "health", icon: Shield, label: "Health" },
  ];

  const stats = data.stats || {};
  const bookings = data.bookings?.bookings || [];
  const reviews = data.reviews?.data || [];
  const properties = data.properties?.properties || [];
  const inbox = data.inbox?.messages || [];
  const revenue = data.revenue || {};
  const coupons = data.coupons?.coupons || [];
  const health = data.health || {};

  const statCards = [
    { label: "Active Listings", value: stats.active_listings || 0, color: "text-[#D4AF37]", icon: Building },
    { label: "Total Bookings", value: stats.confirmed_bookings || 0, color: "text-green-400", icon: Check },
    { label: "Revenue", value: `€${(stats.total_revenue || 0).toLocaleString()}`, color: "text-blue-400", icon: TrendingUp },
    { label: "New This Week", value: stats.recent_bookings_7d || 0, color: "text-purple-400", icon: ArrowUp },
    { label: "Pending", value: stats.pending_bookings || 0, color: "text-orange-400", icon: Clock },
    { label: "Contacts", value: (stats.contacts || 0) + (stats.owner_inquiries || 0), color: "text-pink-400", icon: MessageCircle },
  ];

  const formatDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }); } catch { return d; } };

  const STATUS_COLOR = {
    confirmed: "text-green-400 bg-green-400/10",
    inquiry_submitted: "text-blue-400 bg-blue-400/10",
    pending: "text-orange-400 bg-orange-400/10",
    payment_received_booking_failed: "text-red-400 bg-red-400/10",
    default: "text-[#A1A1AA] bg-white/5"
  };

  const getStatusColor = (s) => STATUS_COLOR[s] || STATUS_COLOR.default;

  // Coupon creation state
  const [newCoupon, setNewCoupon] = useState({ code: "", description: "", discount_type: "percentage", discount_value: 10, active: true });
  const [couponSaving, setCouponSaving] = useState(false);

  const createCoupon = async () => {
    if (!newCoupon.code) return;
    setCouponSaving(true);
    try {
      const res = await fetch(`${API}/admin/coupons`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon)
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Coupon created!");
      setNewCoupon({ code: "", description: "", discount_type: "percentage", discount_value: 10, active: true });
      fetchData("coupons", "/admin/coupons");
    } catch (e) { toast.error(`Failed: ${e.message.slice(0, 80)}`); }
    setCouponSaving(false);
  };

  const toggleCoupon = async (id) => {
    await fetch(`${API}/admin/coupons/${id}/toggle`, { method: "PATCH", headers });
    fetchData("coupons", "/admin/coupons");
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete coupon?")) return;
    await fetch(`${API}/admin/coupons/${id}`, { method: "DELETE", headers });
    fetchData("coupons", "/admin/coupons");
    toast.success("Coupon deleted");
  };

  // SEO state
  const [seoPage, setSeoPage] = useState("home");
  const [seoData, setSeoData] = useState({ title: "", description: "", keywords: "" });
  const [seoSaving, setSeoSaving] = useState(false);

  const saveSEO = async () => {
    setSeoSaving(true);
    try {
      await fetch(`${API}/admin/seo/${seoPage}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ page: seoPage, ...seoData })
      });
      toast.success("SEO saved!");
    } catch { toast.error("Save failed"); }
    setSeoSaving(false);
  };

  // Media state  
  const [mediaListing, setMediaListing] = useState(properties[0]?._id || "");
  const [mediaData, setMediaData] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  const fetchMedia = async (lid) => {
    if (!lid) return;
    setMediaLoading(true);
    try {
      const res = await fetch(`${API}/admin/media/${lid}`, { headers });
      const json = await res.json();
      setMediaData(json);
    } catch { setMediaData(null); }
    setMediaLoading(false);
  };

  useEffect(() => {
    if (tab === "media" && properties.length > 0 && !mediaListing) {
      setMediaListing(properties[0]._id);
    }
  }, [tab, properties]);

  useEffect(() => {
    if (mediaListing) fetchMedia(mediaListing);
  }, [mediaListing]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Dashboard Tabs */}
      <div className="h-10 bg-[#0e0e10] border-b border-[#1a1a1e] flex items-center px-4 gap-1 overflow-x-auto shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded whitespace-nowrap transition-all ${tab === t.id ? "bg-[#D4AF37]/15 text-[#D4AF37]" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
            {t.id === "inbox" && (data.inbox?.unread > 0) && (
              <span className="bg-[#D4AF37] text-[#0a0a0b] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {data.inbox.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0b]">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <h2 className="text-lg font-semibold text-[#f0ede8] mb-6">Dashboard Overview</h2>
            {loading.stats ? (
              <div className="flex items-center gap-2 text-[#5a5a5e] text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
                  {statCards.map((s, i) => (
                    <div key={i} className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <s.icon className={`w-4 h-4 ${s.color}`} />
                        <span className="text-[10px] text-[#5a5a5e] uppercase tracking-wider">{s.label}</span>
                      </div>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Bookings */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-[#f0ede8] mb-4 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-[#D4AF37]" />Recent Bookings</h3>
                    <div className="space-y-2">
                      {bookings.slice(0, 5).map((b, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-[#1a1a1e] last:border-0">
                          <div>
                            <p className="text-sm text-[#f0ede8]">{b.guest?.firstName} {b.guest?.lastName}</p>
                            <p className="text-[10px] text-[#5a5a5e]">{formatDate(b.check_in)} → {formatDate(b.check_out)}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-[9px] font-medium px-2 py-0.5 rounded ${getStatusColor(b.status)}`}>{b.status?.replace('_', ' ')}</span>
                            <p className="text-xs text-[#D4AF37] mt-1">€{(b.amount || 0).toFixed(0)}</p>
                          </div>
                        </div>
                      ))}
                      {bookings.length === 0 && <p className="text-sm text-[#5a5a5e]">No bookings yet</p>}
                    </div>
                  </div>

                  <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-[#f0ede8] mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-[#D4AF37]" />Latest Reviews</h3>
                    <div className="space-y-3">
                      {reviews.slice(0, 4).map((r, i) => {
                        const raw = r.rawReview || {};
                        const score = raw.overall_rating || raw.scoring?.review_score;
                        const text = raw.public_review || raw.content?.positive || "No review text";
                        return (
                          <div key={i} className="py-2 border-b border-[#1a1a1e] last:border-0">
                            <div className="flex items-center gap-2 mb-1">
                              {score && <span className="text-xs font-bold text-[#D4AF37]">★ {score}</span>}
                              <span className="text-[10px] text-[#5a5a5e]">{r.channelId}</span>
                            </div>
                            <p className="text-xs text-[#A1A1AA] line-clamp-2">{text}</p>
                          </div>
                        );
                      })}
                      {reviews.length === 0 && <p className="text-sm text-[#5a5a5e]">No reviews loaded</p>}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── BOOKINGS HUB ── */}
        {tab === "bookings" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f0ede8]">Bookings Hub</h2>
              <button onClick={() => fetchData("bookings", "/admin/bookings?limit=50")} className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#E5C158]"><RefreshCw className="w-3.5 h-3.5" />Refresh</button>
            </div>
            {loading.bookings ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#0e0e10] border-b border-[#1a1a1e]">
                      <tr>
                        {["Guest", "Check In", "Check Out", "Amount", "Status", "Created"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[#5a5a5e] uppercase tracking-wider text-[9px] font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b, i) => (
                        <tr key={i} className="border-b border-[#1a1a1e] hover:bg-[#1a1a1e]/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-[#f0ede8] font-medium">{b.guest?.firstName} {b.guest?.lastName}</p>
                            <p className="text-[#5a5a5e] text-[10px]">{b.guest?.email}</p>
                          </td>
                          <td className="px-4 py-3 text-[#A1A1AA]">{formatDate(b.check_in)}</td>
                          <td className="px-4 py-3 text-[#A1A1AA]">{formatDate(b.check_out)}</td>
                          <td className="px-4 py-3 text-[#D4AF37] font-semibold">€{(b.amount || 0).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] font-medium px-2 py-1 rounded ${getStatusColor(b.status)}`}>{b.status?.replace(/_/g, ' ') || '—'}</span>
                          </td>
                          <td className="px-4 py-3 text-[#5a5a5e]">{formatDate(b.created_at)}</td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr><td colSpan="6" className="px-4 py-8 text-center text-[#5a5a5e]">No bookings found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REVENUE ANALYTICS ── */}
        {tab === "revenue" && (
          <div>
            <h2 className="text-lg font-semibold text-[#f0ede8] mb-6">Revenue Analytics</h2>
            {loading.revenue ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="space-y-6">
                {/* Monthly Revenue */}
                <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-[#f0ede8] mb-4">Monthly Revenue</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-[#1a1a1e]">
                        {["Month", "Revenue", "Bookings", "Avg Value"].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[#5a5a5e] uppercase text-[9px]">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {(revenue.monthly || []).map((m, i) => (
                          <tr key={i} className="border-b border-[#1a1a1e]/50 hover:bg-[#1a1a1e]/30">
                            <td className="px-3 py-2.5 text-[#f0ede8]">{m.month}</td>
                            <td className="px-3 py-2.5 text-[#D4AF37] font-semibold">€{m.revenue?.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-[#A1A1AA]">{m.count}</td>
                            <td className="px-3 py-2.5 text-[#A1A1AA]">€{m.avg?.toFixed(0)}</td>
                          </tr>
                        ))}
                        {!(revenue.monthly?.length) && <tr><td colSpan="4" className="px-3 py-6 text-center text-[#5a5a5e]">No revenue data yet</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* By Status + Top Properties */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-[#f0ede8] mb-4">By Status</h3>
                    <div className="space-y-2">
                      {(revenue.by_status || []).map((s, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-[#1a1a1e]/50 last:border-0">
                          <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(s.status)}`}>{s.status?.replace(/_/g, ' ')}</span>
                          <div className="text-right">
                            <p className="text-xs text-[#D4AF37]">€{(s.revenue || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-[#5a5a5e]">{s.count} bookings</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-[#f0ede8] mb-4">Top Properties</h3>
                    <div className="space-y-2">
                      {(revenue.top_properties || []).map((p, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-[#1a1a1e]/50 last:border-0">
                          <span className="text-xs text-[#A1A1AA] truncate max-w-[160px]">{p.listing_id}</span>
                          <div className="text-right">
                            <p className="text-xs text-[#D4AF37]">€{(p.revenue || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-[#5a5a5e]">{p.bookings} bookings</p>
                          </div>
                        </div>
                      ))}
                      {!(revenue.top_properties?.length) && <p className="text-sm text-[#5a5a5e]">No data yet</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROPERTY MANAGER ── */}
        {tab === "properties" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f0ede8]">Property Manager</h2>
              <button onClick={() => fetchData("properties", "/admin/properties")} className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#E5C158]"><RefreshCw className="w-3.5 h-3.5" />Refresh</button>
            </div>
            {loading.properties ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {properties.map((p, i) => (
                  <div key={i} className="bg-[#111318] border border-[#1a1a1e] rounded-lg overflow-hidden hover:border-[#D4AF37]/30 transition-all">
                    {p.picture?.thumbnail && (
                      <img src={p.picture.thumbnail} alt={p.title} className="w-full h-36 object-cover" />
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-[#f0ede8] line-clamp-2">{p.title}</h4>
                        {p.reviews?.avg && <span className="text-[#D4AF37] text-xs shrink-0">★ {(p.reviews.avg / 2).toFixed(1)}</span>}
                      </div>
                      <p className="text-xs text-[#5a5a5e] mb-3">{p.address?.city}, {p.address?.country}</p>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-center mb-3">
                        <div className="bg-[#0a0a0b] rounded p-2">
                          <p className="text-[#D4AF37] font-semibold">{p.accommodates}</p>
                          <p className="text-[#5a5a5e]">Guests</p>
                        </div>
                        <div className="bg-[#0a0a0b] rounded p-2">
                          <p className="text-[#D4AF37] font-semibold">{p.bedrooms}</p>
                          <p className="text-[#5a5a5e]">Beds</p>
                        </div>
                        <div className="bg-[#0a0a0b] rounded p-2">
                          <p className="text-green-400 font-semibold">{p.local_bookings}</p>
                          <p className="text-[#5a5a5e]">Bookings</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#D4AF37]">€{p.prices?.basePrice}/night</span>
                        <span className="text-green-400">€{p.local_revenue?.toFixed(0)} revenue</span>
                      </div>
                      <a href={`/property/${p._id}`} target="_blank" rel="noreferrer" className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#D4AF37]/10 text-[#D4AF37] text-xs rounded hover:bg-[#D4AF37]/20 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />View Listing
                      </a>
                    </div>
                  </div>
                ))}
                {properties.length === 0 && <p className="text-[#5a5a5e]">No properties loaded</p>}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === "reviews" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f0ede8]">Reviews Feed</h2>
              <button onClick={() => fetchData("reviews", "/admin/reviews?limit=20")} className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#E5C158]"><RefreshCw className="w-3.5 h-3.5" />Refresh</button>
            </div>
            {loading.reviews ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r, i) => {
                  const raw = r.rawReview || {};
                  const score = raw.overall_rating || raw.scoring?.review_score;
                  const text = raw.public_review || raw.content?.positive || "No review text";
                  const reviewer = raw.reviewer?.name || raw.from?.first_name || "Guest";
                  return (
                    <div key={i} className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{reviewer[0]?.toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-semibold text-[#f0ede8]">{reviewer}</p>
                            <p className="text-[10px] text-[#5a5a5e]">{r.channelId}</p>
                          </div>
                        </div>
                        {score && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-[#D4AF37] fill-current" />
                            <span className="text-[#D4AF37] font-bold">{score}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#A1A1AA] leading-relaxed">{text}</p>
                      {raw.content?.negative && (
                        <p className="text-xs text-red-400/70 mt-2">Negative: {raw.content.negative}</p>
                      )}
                    </div>
                  );
                })}
                {reviews.length === 0 && (
                  <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-8 text-center">
                    <Star className="w-12 h-12 text-[#2a2a2e] mx-auto mb-3" />
                    <p className="text-[#5a5a5e]">Reviews will appear here when available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── GUEST INBOX ── */}
        {tab === "inbox" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f0ede8]">Guest Inbox
                {data.inbox?.unread > 0 && <span className="ml-2 bg-[#D4AF37] text-[#0a0a0b] text-xs font-bold px-2 py-0.5 rounded-full">{data.inbox.unread} unread</span>}
              </h2>
              <button onClick={() => fetchData("inbox", "/admin/inbox")} className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#E5C158]"><RefreshCw className="w-3.5 h-3.5" />Refresh</button>
            </div>
            {loading.inbox ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="space-y-3">
                {inbox.map((msg, i) => (
                  <div key={i} className={`bg-[#111318] border rounded-lg p-4 transition-all ${msg.read ? "border-[#1a1a1e]" : "border-[#D4AF37]/30"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-medium px-2 py-0.5 rounded ${msg.type === "contact" ? "bg-blue-400/10 text-blue-400" : "bg-purple-400/10 text-purple-400"}`}>
                            {msg.type === "contact" ? "Contact" : "Owner Inquiry"}
                          </span>
                          {!msg.read && <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />}
                          <span className="text-[10px] text-[#5a5a5e]">{formatDate(msg.created_at)}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#f0ede8]">{msg.name || msg.first_name || "Anonymous"}</p>
                        {msg.email && <p className="text-xs text-[#5a5a5e]">{msg.email}</p>}
                        {msg.message && <p className="text-sm text-[#A1A1AA] mt-2 line-clamp-3">{msg.message}</p>}
                        {msg.property_address && <p className="text-xs text-[#5a5a5e] mt-1">📍 {msg.property_address}</p>}
                      </div>
                    </div>
                  </div>
                ))}
                {inbox.length === 0 && (
                  <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-[#2a2a2e] mx-auto mb-3" />
                    <p className="text-[#5a5a5e]">No messages yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── COUPON MANAGER ── */}
        {tab === "coupons" && (
          <div>
            <h2 className="text-lg font-semibold text-[#f0ede8] mb-6">Coupon Manager</h2>

            {/* Create new coupon */}
            <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5 mb-6">
              <h3 className="text-sm font-semibold text-[#f0ede8] mb-4">Create New Coupon</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">Code *</label>
                  <Input value={newCoupon.code} onChange={e => setNewCoupon(c => ({ ...c, code: e.target.value.toUpperCase() }))}
                    placeholder="SUMMER20" className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] h-9 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">Description</label>
                  <Input value={newCoupon.description} onChange={e => setNewCoupon(c => ({ ...c, description: e.target.value }))}
                    placeholder="Summer discount" className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] h-9 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">Type</label>
                  <select value={newCoupon.discount_type} onChange={e => setNewCoupon(c => ({ ...c, discount_type: e.target.value }))}
                    className="w-full bg-[#0a0a0b] border border-[#1e1e22] text-[#f0ede8] h-9 text-xs px-3 rounded-md">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (€)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">
                    Discount ({newCoupon.discount_type === "percentage" ? "%" : "€"})
                  </label>
                  <Input type="number" value={newCoupon.discount_value} onChange={e => setNewCoupon(c => ({ ...c, discount_value: parseFloat(e.target.value) || 0 }))}
                    className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] h-9 text-xs" />
                </div>
              </div>
              <Button onClick={createCoupon} disabled={!newCoupon.code || couponSaving}
                className="bg-[#D4AF37] text-[#0a0a0b] hover:bg-[#E5C158] text-xs h-9">
                {couponSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                Create Coupon
              </Button>
              <p className="text-[10px] text-[#5a5a5e] mt-2">Note: Also create the coupon in Guesty Revenue Management for it to apply to bookings.</p>
            </div>

            {/* Coupons list */}
            <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[#0e0e10] border-b border-[#1a1a1e]">
                  <tr>{["Code", "Type", "Value", "Description", "Uses", "Active", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[#5a5a5e] uppercase text-[9px]">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {coupons.map((c, i) => (
                    <tr key={i} className="border-b border-[#1a1a1e] hover:bg-[#1a1a1e]/30">
                      <td className="px-4 py-3 font-mono text-[#D4AF37] font-bold">{c.code}</td>
                      <td className="px-4 py-3 text-[#A1A1AA]">{c.discount_type}</td>
                      <td className="px-4 py-3 text-[#f0ede8]">{c.discount_type === "percentage" ? `${c.discount_value}%` : `€${c.discount_value}`}</td>
                      <td className="px-4 py-3 text-[#5a5a5e]">{c.description || "—"}</td>
                      <td className="px-4 py-3 text-[#A1A1AA]">{c.uses || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] px-2 py-0.5 rounded ${c.active ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
                          {c.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => toggleCoupon(c.id)} className="text-[#D4AF37] hover:text-[#E5C158] text-[10px] underline">Toggle</button>
                          <button onClick={() => deleteCoupon(c.id)} className="text-red-400 hover:text-red-300 text-[10px] underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-[#5a5a5e]">No coupons yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SEO MANAGER ── */}
        {tab === "seo" && (
          <div>
            <h2 className="text-lg font-semibold text-[#f0ede8] mb-6">SEO Manager</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                <h3 className="text-sm font-semibold text-[#f0ede8] mb-4">Edit Page SEO</h3>
                <div className="mb-4">
                  <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">Page</label>
                  <select value={seoPage} onChange={e => setSeoPage(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-[#1e1e22] text-[#f0ede8] h-9 text-xs px-3 rounded-md">
                    {["home", "properties", "property-owners", "about", "contact"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  {[{ label: "Title", key: "title", placeholder: "Page title (50-60 chars)" },
                    { label: "Description", key: "description", placeholder: "Meta description (150-160 chars)" },
                    { label: "Keywords", key: "keywords", placeholder: "keyword1, keyword2, ..." }].map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">{f.label}</label>
                      <Input value={seoData[f.key] || ""} onChange={e => setSeoData(d => ({ ...d, [f.key]: e.target.value }))}
                        placeholder={f.placeholder} className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] h-9 text-xs" />
                    </div>
                  ))}
                </div>
                <Button onClick={saveSEO} disabled={seoSaving} className="w-full mt-4 bg-[#D4AF37] text-[#0a0a0b] hover:bg-[#E5C158] text-xs h-9">
                  {seoSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                  Save SEO
                </Button>
              </div>
              <div className="lg:col-span-2 bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                <h3 className="text-sm font-semibold text-[#f0ede8] mb-4">SEO Preview</h3>
                <div className="bg-white rounded p-4">
                  <p className="text-blue-600 text-lg font-medium line-clamp-1">{seoData.title || "Page Title — Christiano Property Management"}</p>
                  <p className="text-green-700 text-sm">{window.location.origin}/{seoPage}</p>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{seoData.description || "Your page description will appear here in search results..."}</p>
                </div>
                <div className="mt-4 p-3 bg-[#0a0a0b] rounded">
                  <p className="text-[10px] text-[#5a5a5e] mb-2 uppercase tracking-wider">SEO Tips</p>
                  {[
                    { tip: "Title: 50-60 characters ideal", ok: seoData.title?.length >= 30 && seoData.title?.length <= 60 },
                    { tip: "Description: 150-160 characters", ok: seoData.description?.length >= 120 && seoData.description?.length <= 160 },
                    { tip: "Include Malta, luxury, rental keywords", ok: seoData.keywords?.toLowerCase().includes("malta") }
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs mb-1">
                      <span className={t.ok ? "text-green-400" : "text-[#5a5a5e]"}>{t.ok ? "✓" : "○"}</span>
                      <span className={t.ok ? "text-green-400" : "text-[#A1A1AA]"}>{t.tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MEDIA HUB ── */}
        {tab === "media" && (
          <div>
            <h2 className="text-lg font-semibold text-[#f0ede8] mb-6">Media Hub</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <label className="text-[10px] text-[#5a5a5e] uppercase tracking-wider mb-1 block">Select Property</label>
                <select value={mediaListing} onChange={e => setMediaListing(e.target.value)}
                  className="w-full max-w-sm bg-[#111318] border border-[#1a1a1e] text-[#f0ede8] h-9 text-xs px-3 rounded-md">
                  {properties.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
              {mediaData && <p className="text-xs text-[#5a5a5e]">{mediaData.total} photos</p>}
            </div>
            {mediaLoading ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : mediaData ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {mediaData.pictures?.map((pic, i) => (
                  <div key={i} className="group relative bg-[#111318] rounded overflow-hidden border border-[#1a1a1e] hover:border-[#D4AF37]/30 transition-all">
                    <img src={pic.thumbnail || pic.original} alt={`Photo ${i + 1}`} className="w-full aspect-video object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a href={pic.original} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded hover:bg-white/20">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </a>
                    </div>
                    {pic.caption && (
                      <div className="p-2">
                        <p className="text-[10px] text-[#5a5a5e] line-clamp-1">{pic.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 text-[#2a2a2e] mx-auto mb-3" />
                <p className="text-[#5a5a5e]">Select a property to view media</p>
              </div>
            )}
          </div>
        )}

        {/* ── SYSTEM HEALTH ── */}
        {tab === "health" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f0ede8]">System Health</h2>
              <div className="flex gap-2">
                <button onClick={() => fetchData("health", "/admin/system/health")} className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#E5C158]">
                  <RefreshCw className="w-3.5 h-3.5" />Refresh
                </button>
                <button onClick={async () => {
                  await fetch(`${API}/admin/clear-cache`, { method: "POST", headers });
                  fetchData("health", "/admin/system/health");
                  toast.success("Cache cleared!");
                }} className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300">
                  <Trash2 className="w-3.5 h-3.5" />Clear Cache
                </button>
                <button onClick={async () => {
                  const res = await fetch(`${API}/admin/refresh-token`, { method: "POST", headers });
                  const d = await res.json();
                  toast.success(`Token refreshed: ${d.token_prefix}`);
                  fetchData("health", "/admin/system/health");
                }} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
                  <RotateCcw className="w-3.5 h-3.5" />Refresh Token
                </button>
              </div>
            </div>
            {loading.health ? (
              <div className="flex items-center gap-2 text-[#5a5a5e]"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Guesty API", icon: Rocket, data: health.guesty ? [
                    { label: "Status", value: health.guesty.status, ok: health.guesty.status === "connected" },
                    { label: "Latency", value: health.guesty.latency_ms ? `${health.guesty.latency_ms}ms` : "—" }
                  ] : [] },
                  { title: "Token Cache", icon: Key, data: health.token ? [
                    { label: "Status", value: health.token.status, ok: health.token.status === "valid" },
                    { label: "Expires in", value: health.token.expires_in_mins ? `${health.token.expires_in_mins} mins` : "—" }
                  ] : [] },
                  { title: "Response Cache", icon: Zap, data: health.cache ? [
                    { label: "Total entries", value: health.cache.total },
                    { label: "Valid entries", value: health.cache.valid }
                  ] : [] },
                  { title: "Database", icon: Settings, data: health.database ? Object.entries(health.database).map(([k, v]) => ({ label: k, value: v })) : [] }
                ].map((section, i) => (
                  <div key={i} className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <section.icon className="w-4 h-4 text-[#D4AF37]" />
                      <h3 className="text-sm font-semibold text-[#f0ede8]">{section.title}</h3>
                    </div>
                    <div className="space-y-2">
                      {section.data.map((item, j) => (
                        <div key={j} className="flex justify-between items-center py-1.5 border-b border-[#1a1a1e]/50 last:border-0">
                          <span className="text-xs text-[#5a5a5e]">{item.label}</span>
                          <span className={`text-xs font-medium ${item.ok === true ? "text-green-400" : item.ok === false ? "text-red-400" : "text-[#A1A1AA]"}`}>
                            {String(item.value)}
                          </span>
                        </div>
                      ))}
                      {section.data.length === 0 && <p className="text-xs text-[#5a5a5e]">Data unavailable</p>}
                    </div>
                  </div>
                ))}
                <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Code className="w-4 h-4 text-[#D4AF37]" />
                    <h3 className="text-sm font-semibold text-[#f0ede8]">SDK Info</h3>
                  </div>
                  <p className="text-xs text-[#A1A1AA]">Contract version: <span className="text-[#D4AF37]">{health.sdk_version}</span></p>
                  <p className="text-[10px] text-[#5a5a5e] mt-2">BEAPI hard deprecation: 31 March 2026</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// ============================================
// MAIN ADMIN PAGE
// ============================================
export default function AdminPage() {
  const navigate = useNavigate();
  const { cms, isAdmin, verifyAdmin, logout, updateSection } = useCMS();
  
  const [adminKey, setAdminKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState("studio"); // 'studio' | 'dashboard'
  const [page, setPage] = useState("home");
  const [leftTab, setLeftTab] = useState("blocks");
  const [rightTab, setRightTab] = useState("props");
  const [view, setView] = useState("desktop");
  const [zoom, setZoom] = useState(75);
  const [selected, setSelected] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [undo, setUndo] = useState([]);
  const [redo, setRedo] = useState([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [pauseEdit, setPauseEdit] = useState(false); // pause-to-preview: hides edit overlays

  // Load blocks: try saved page from backend, fall back to template + CMS merge
  useEffect(() => {
    const adminKey = localStorage.getItem("cvpm_admin_key");
    if (!adminKey) return; // wait for auth

    const loadPage = async () => {
      try {
        // Try to load saved page doc
        const res = await fetch(`${API}/cms/admin/drafts`, {
          headers: { "X-Admin-Key": adminKey }
        });
        if (res.ok) {
          const data = await res.json();
          const saved = data[`page_${page}`];
          if (saved?.blocks?.length) {
            setBlocks(saved.blocks.map(b => ({ ...b, visible: b.visible !== false })));
            setSelected(null);
            return;
          }
        }
      } catch {}
      // Fallback: template + CMS data merge
      const uid = () => `b${Date.now()}${Math.random().toString(36).slice(2,6)}`;
      const pageTemplateBlocks = LIVE_PAGE_TEMPLATES[page] || LIVE_PAGE_TEMPLATES.home;
      const merged = pageTemplateBlocks.map((block) => {
        const id = uid();
        const baseData = { ...block.data };
        // Merge live CMS content where available
        if (block.type === "hero" && cms.hero) {
          if (cms.hero.headline)         baseData.headline         = cms.hero.headline;
          if (cms.hero.headlineAccent)   baseData.headlineAccent   = cms.hero.headlineAccent;
          if (cms.hero.subheadline)      baseData.subheadline      = cms.hero.subheadline;
          if (cms.hero.backgroundImage)  baseData.backgroundImage  = cms.hero.backgroundImage;
          if (cms.hero.cta1Text)         baseData.cta1Text         = cms.hero.cta1Text;
          if (cms.hero.cta2Text)         baseData.cta2Text         = cms.hero.cta2Text;
        }
        if (block.type === "about" && cms.about) {
          if (cms.about.label)       baseData.label       = cms.about.subtitle || cms.about.label;
          if (cms.about.title)       baseData.title       = cms.about.title;
          if (cms.about.paragraphs)  baseData.paragraphs  = cms.about.paragraphs.map(t => ({ text: t }));
          if (cms.about.image)       baseData.image       = cms.about.image;
        }
        if (block.type === "testimonials" && cms.testimonials?.length) {
          baseData.items = cms.testimonials;
        }
        if (block.type === "pricing" && cms.pricing?.plans) {
          baseData.plans = cms.pricing.plans.map(p => ({
            tier: p.name, amount: p.rate, unit: "of revenue",
            desc: p.description, popular: p.popular || false,
            cta: "Get Started", features: p.includes || p.features || [],
          }));
        }
        if (block.type === "header") {
          if (cms.brand?.logoGold) baseData.logoUrl   = cms.brand.logoGold;
          if (cms.brand?.name)     baseData.brandName = cms.brand.name;
        }
        if (block.type === "footer") {
          if (cms.brand?.name) baseData.brand = cms.brand.name;
        }
        if (block.type === "features" && cms.features?.length) {
          baseData.items = cms.features.map(f => ({ icon: f.icon, title: f.title, body: f.description }));
        }
        return { id, type: block.type, data: baseData, visible: true };
      });
      setBlocks(merged);
      setSelected(null);
    };

    loadPage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cms, page]);

  useEffect(() => {
    const k = localStorage.getItem("cvpm_admin_key");
    if (k) verifyAdmin(k).then(v => { setIsLoading(false); if (!v) localStorage.removeItem("cvpm_admin_key"); });
    else setIsLoading(false);
  }, [verifyAdmin]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); doUndo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); doRedo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); saveAll(); }
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [blocks, undo, redo]);

  const snapshot = useCallback(() => { setUndo(u => [...u.slice(-29), JSON.stringify(blocks)]); setRedo([]); }, [blocks]);
  const doUndo = () => { if (!undo.length) return; setRedo(r => [...r, JSON.stringify(blocks)]); setBlocks(JSON.parse(undo.at(-1))); setUndo(u => u.slice(0, -1)); toast.info("Undo"); };
  const doRedo = () => { if (!redo.length) return; setUndo(u => [...u, JSON.stringify(blocks)]); setBlocks(JSON.parse(redo.at(-1))); setRedo(r => r.slice(0, -1)); toast.info("Redo"); };

  const updateBlock = useCallback((id, field, value) => { snapshot(); setBlocks(b => b.map(x => x.id === id ? { ...x, data: { ...x.data, [field]: value } } : x)); }, [snapshot]);
  const addBlock = (type) => { 
    snapshot(); 
    const b = { 
      id: `${type}_${Date.now()}`, 
      type, 
      data: SCHEMAS[type]?.defaults || {}, 
      visible: true 
    }; 
    setBlocks(bs => [...bs, b]); 
    setSelected(b.id); 
    toast.success(`Added ${SCHEMAS[type]?.label || type}`); 
  };
  const deleteBlock = (id) => { snapshot(); setBlocks(b => b.filter(x => x.id !== id)); if (selected === id) setSelected(null); };
  const duplicateBlock = (id) => { snapshot(); const b = blocks.find(x => x.id === id); if (!b) return; const idx = blocks.findIndex(x => x.id === id); const n = { ...b, id: `${b.type}_${Date.now()}`, data: { ...b.data } }; setBlocks(bs => [...bs.slice(0, idx + 1), n, ...bs.slice(idx + 1)]); };
  const moveBlock = (idx, dir) => { if ((dir === -1 && idx === 0) || (dir === 1 && idx === blocks.length - 1)) return; snapshot(); const items = [...blocks]; [items[idx], items[idx + dir]] = [items[idx + dir], items[idx]]; setBlocks(items); };
  const onDragEnd = (result) => { if (!result.destination) return; snapshot(); const items = [...blocks]; const [moved] = items.splice(result.source.index, 1); items.splice(result.destination.index, 0, moved); setBlocks(items); };
  const toggleVisibility = (id) => { snapshot(); setBlocks(b => b.map(x => x.id === id ? { ...x, visible: !x.visible } : x)); };

  const generateAI = async (field, label) => {
    if (!selected) return;
    setGenerating(true);
    try {
      const block = blocks.find(b => b.id === selected);
      const blockSchema = SCHEMAS[block.type];
      const blockLabel = blockSchema?.label || block.type;
      
      if (field === "_all") {
        // Generate all text fields from the block's data
        const fieldsToGenerate = blockSchema?.fields
          ? Object.entries(blockSchema.fields).filter(([, f]) => f.ai)
          : Object.entries(block.data).filter(([, v]) => typeof v === "string" && v.length < 300).map(([k]) => [k, {label: k, ai: true}]);
          
        for (const [k, f] of fieldsToGenerate) {
          const res = await fetch(`${API}/ai/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: `Generate ${f.label || k} for a ${blockLabel} section. Luxury Malta property style. Keep it concise and professional.`, section: block.type, field: k })
          });
          const data = await res.json();
          if (data.content) updateBlock(selected, k, data.content.replace(/^["']|["']$/g, ''));
        }
        toast.success("AI generated all fields!");
      } else {
        const res = await fetch(`${API}/ai/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: `Generate ${label} for luxury Malta property ${blockLabel} section. Concise and elegant.`, section: block.type, field })
        });
        const data = await res.json();
        if (data.content) { updateBlock(selected, field, data.content.replace(/^["']|["']$/g, '')); toast.success(`Generated ${label}`); }
      }
    } catch { toast.error("AI generation failed"); }
    setGenerating(false);
  };

  const generateFromPrompt = async (prompt) => {
    if (!selected) return;
    setGenerating(true);
    try {
      const block = blocks.find(b => b.id === selected);
      const res = await fetch(`${API}/ai/generate`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          prompt: `Refine the content for a ${block.type.replace(/_/g," ")} section. Instructions: ${prompt}. Current content: ${JSON.stringify(block.data)}. Return improved content as a JSON object with the same keys.`,
          section: block.type, 
          mode: "refine" 
        }) 
      });
      const data = await res.json();
      if (data.content) {
        try {
          const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
          Object.keys(parsed).forEach(k => updateBlock(selected, k, parsed[k]));
          toast.success("AI draft applied! Review and publish.");
        } catch {
          toast.error("Could not parse AI response");
        }
      }
    } catch (e) { toast.error("AI generation failed"); }
    setGenerating(false);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const adminKey = localStorage.getItem("cvpm_admin_key");

      // Save entire page as a structured document (preserves multiple same-type blocks)
      const pageDoc = {
        page,
        blocks: blocks.map(b => ({ id: b.id, type: b.type, data: b.data, visible: b.visible !== false })),
        savedAt: new Date().toISOString(),
      };

      // Save page doc as a single draft entry keyed by page slug
      await fetch(`${API}/cms/admin/draft/page_${page}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
        body: JSON.stringify({ data: pageDoc }),
      });

      // Also keep legacy per-section saves for CMS context compatibility
      const hero = blocks.find(b => b.type === "hero");
      const testimonials = blocks.find(b => b.type === "testimonials");
      const pricing = blocks.find(b => b.type === "pricing");
      const about = blocks.find(b => b.type === "about");
      const faq = blocks.find(b => b.type === "faq");
      if (hero) await updateSection("hero", hero.data).catch(() => {});
      if (testimonials?.data?.items) await updateSection("testimonials", testimonials.data.items).catch(() => {});
      if (pricing?.data?.plans) await updateSection("pricing", pricing.data).catch(() => {});
      if (about?.data) await updateSection("about", about.data).catch(() => {});
      if (faq?.data?.items) await updateSection("faq", faq.data).catch(() => {});

      // Publish all changes
      const publishRes = await fetch(`${API}/cms/admin/publish`, {
        method: "POST",
        headers: { "X-Admin-Key": adminKey },
      });
      const publishData = await publishRes.json();

      if (publishRes.ok) {
        toast.success(
          <div>
            <p className="font-semibold">Published v{publishData.version}</p>
            <p className="text-xs opacity-70 mt-1">{blocks.length} blocks saved · {new Date().toLocaleTimeString()}</p>
          </div>
        );
      } else {
        toast.error(publishData.detail || "Publish failed");
      }
    } catch (e) {
      console.error("Publish error:", e);
      toast.error(`Save failed: ${e.message}`);
    }
    setSaving(false);
  };

  const selectedBlock = blocks.find(b => b.id === selected);

  // Pages config: CMS pages use block editor, live pages use iframe preview
  const ALL_PAGES = [
    { id: "home",            label: "Home",           type: "cms",     url: "/" },
    { id: "owners",          label: "Owners",         type: "cms",     url: "/property-owners" },
    { id: "about",           label: "About",          type: "cms",     url: "/" },
    { id: "contact",         label: "Contact",        type: "cms",     url: "/" },
    { id: "properties",      label: "Properties",     type: "preview", url: "/properties" },
    { id: "property_detail", label: "Property",       type: "preview", url: "/property/693abb6d80cd6e002d2e8763" },
    { id: "checkout",        label: "Checkout",       type: "preview", url: "/properties" },
    { id: "confirmation",    label: "Confirmation",   type: "preview", url: "/confirmation" },
    { id: "map",             label: "Map",            type: "preview", url: "/map" },
  ];

  const currentPageConfig = ALL_PAGES.find(p => p.id === page) || ALL_PAGES[0];
  const isCMSPage = currentPageConfig.type === "cms";
  const previewUrl = `http://localhost:3000${currentPageConfig.url}`;

  if (isLoading) return <div className="fixed inset-0 bg-[#0a0a0b] flex items-center justify-center z-[9999]"><div className="animate-spin w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full" /></div>;

  if (!isAdmin) return (
    <div className="fixed inset-0 bg-[#0a0a0b] flex items-center justify-center z-[9999]">
      <form onSubmit={e => { e.preventDefault(); verifyAdmin(adminKey).then(v => { if (v) { localStorage.setItem("cvpm_admin_key", adminKey); toast.success("Welcome!"); } else toast.error("Invalid key"); }); }} className="max-w-sm w-full px-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#a08550] flex items-center justify-center shadow-lg"><Sparkles className="w-8 h-8 text-[#0a0a0b]" /></div>
          <h1 className="text-2xl font-bold text-[#f0ede8] mb-2">Studio Pro</h1>
          <p className="text-sm text-[#5a5a5e]">Visual CMS Editor</p>
        </div>
        <Input type="password" placeholder="Enter admin key" value={adminKey} onChange={e => setAdminKey(e.target.value)} className="bg-[#111318] border-[#1e1e22] text-[#f0ede8] h-12 mb-4 text-center" />
        <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#E5C158] text-[#0a0a0b] h-12 font-semibold">Access Editor</Button>
        <p className="text-center text-[10px] text-[#3a3a3e] mt-6">Default: cvpm-admin-2026</p>
      </form>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] flex flex-col z-[9999] overflow-hidden" data-testid="admin-editor">
      {/* Header */}
      <header className="h-12 bg-[#0a0a0b] border-b border-[#1a1a1e] flex items-center px-4 gap-2 shrink-0">
        <div className="flex items-center gap-2 pr-3 border-r border-[#1a1a1e]">
          <div className="w-7 h-7 bg-gradient-to-br from-[#D4AF37] to-[#a08550] flex items-center justify-center font-bold text-sm rounded text-[#0a0a0b]">C</div>
          <span className="text-[#f0ede8] text-sm font-semibold hidden sm:block">Studio <em className="text-[#D4AF37] not-italic font-normal">Pro</em></span>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-1 border border-[#1a1a1e] rounded p-0.5 mr-2">
          <button onClick={() => setMode("studio")} className={`px-2.5 py-1 text-[9px] font-medium rounded transition-all ${mode === "studio" ? "bg-[#D4AF37] text-[#0a0a0b]" : "text-[#6a6a6e] hover:text-[#f0ede8]"}`}>
            <Layout className="w-3 h-3 inline mr-1" />Studio
          </button>
          <button onClick={() => setMode("live")} className={`px-2.5 py-1 text-[9px] font-medium rounded transition-all ${mode === "live" ? "bg-[#D4AF37] text-[#0a0a0b]" : "text-[#6a6a6e] hover:text-[#f0ede8]"}`}>
            <Eye className="w-3 h-3 inline mr-1" />Live
          </button>
          <button onClick={() => setMode("dashboard")} className={`px-2.5 py-1 text-[9px] font-medium rounded transition-all ${mode === "dashboard" ? "bg-[#D4AF37] text-[#0a0a0b]" : "text-[#6a6a6e] hover:text-[#f0ede8]"}`}>
            <ChartBar className="w-3 h-3 inline mr-1" />Dashboard
          </button>
        </div>
        
        {mode === "studio" && (
          <div className="flex items-center gap-1 overflow-x-auto max-w-[500px]" style={{ scrollbarWidth: "none" }}>
            {ALL_PAGES.map(p => (
              <button
                key={p.id}
                onClick={() => setPage(p.id)}
                title={p.type === "preview" ? `Live preview: ${p.url}` : `CMS editor: ${p.id}`}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded transition-all whitespace-nowrap ${
                  page === p.id
                    ? p.type === "cms"
                      ? "bg-[#D4AF37]/15 text-[#D4AF37]"
                      : "bg-blue-400/15 text-blue-400"
                    : "text-[#6a6a6e] hover:text-[#f0ede8]"
                }`}
              >
                {p.type === "preview" && <Eye className="w-2.5 h-2.5 opacity-60" />}
                {p.label}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex-1" />
        
        {mode === "studio" && (
          <div className="flex items-center gap-1 border-r border-[#1a1a1e] pr-2 mr-2">
            {[{ m: "desktop", i: Monitor }, { m: "tablet", i: Tablet }, { m: "mobile", i: Smartphone }].map(({ m, i: I }) => (
              <button key={m} onClick={() => setView(m)} className={`p-1.5 rounded ${view === m ? "bg-[#D4AF37]/15 text-[#D4AF37]" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}><I className="w-3.5 h-3.5" /></button>
            ))}
          </div>
        )}
        
        {mode === "studio" && (
          <>
            <button onClick={doUndo} disabled={!undo.length} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] disabled:opacity-30 rounded hover:bg-[#1a1a1e]" title="Undo"><Undo2 className="w-3.5 h-3.5" /></button>
            <button onClick={doRedo} disabled={!redo.length} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] disabled:opacity-30 rounded hover:bg-[#1a1a1e]" title="Redo"><Redo2 className="w-3.5 h-3.5" /></button>
          </>
        )}
        
        <div className="w-px h-5 bg-[#1a1a1e] mx-1" />
        
        <button onClick={() => window.open("/", "_blank")} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] rounded hover:bg-[#1a1a1e]" title="Preview"><ExternalLink className="w-3.5 h-3.5" /></button>
        <button onClick={() => setShowKeys(true)} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] rounded hover:bg-[#1a1a1e]" title="API Keys"><Key className="w-3.5 h-3.5" /></button>
        
        {mode === "studio" && (
          <button onClick={saveAll} disabled={saving} className="ml-2 px-3 py-1.5 text-[10px] bg-[#D4AF37] text-[#0a0a0b] font-semibold rounded hover:bg-[#E5C158] flex items-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Publish
          </button>
        )}
        
        <button onClick={() => { logout(); navigate("/"); }} className="p-1.5 text-[#6a6a6e] hover:text-red-400 rounded hover:bg-red-400/10 ml-1" title="Logout"><LogOut className="w-3.5 h-3.5" /></button>
      </header>

      {/* Dashboard Mode */}
      {mode === "dashboard" && (
        <div className="flex-1 overflow-hidden">
          <AdminDashboard adminKey={localStorage.getItem("cvpm_admin_key") || ""} />
        </div>
      )}

      {/* Live Navigate Mode */}
      {mode === "live" && (
        <div className="flex-1 overflow-hidden">
          <LiveNavigateMode initialUrl="/" />
        </div>
      )}

      {/* Studio Mode */}
      {mode === "studio" && (
        <div className="flex flex-1 overflow-hidden">

        {/* Left Panel: Blocks (CMS only) or Page Navigator */}
        <aside className="w-56 bg-[#0a0a0b] border-r border-[#1a1a1e] flex flex-col shrink-0">
          {isCMSPage ? (
            <>
              <div className="flex border-b border-[#1a1a1e]">
                {[{ id: "blocks", icon: Plus, label: "Add" }, { id: "layers", icon: Layers, label: "Layers" }].map(t => (
                  <button key={t.id} onClick={() => setLeftTab(t.id)} className={`flex-1 py-2.5 text-[9px] font-medium flex flex-col items-center gap-1 ${leftTab === t.id ? "text-[#D4AF37] bg-[#D4AF37]/5" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}>
                    <t.icon className="w-4 h-4" />{t.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {leftTab === "blocks" && (
                  <div className="space-y-3">
                    {BLOCK_CATEGORIES.map(cat => (
                      <BlockCategorySection key={cat.id} cat={cat} onAdd={addBlock} />
                    ))}
                  </div>
                )}
                {leftTab === "layers" && (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[8px] uppercase tracking-wider text-[#4a4a4e] font-semibold">Blocks · {blocks.length}</p>
                      <button onClick={() => { const t = LIVE_PAGE_TEMPLATES[page]||[]; setBlocks(t.map((b,i)=>({id:`${b.type}_${page}_${i}`,type:b.type,data:{...b.data},visible:true}))); setSelected(null); toast.info("Page reset"); }} className="text-[8px] text-[#4a4a4e] hover:text-[#D4AF37]">Reset</button>
                    </div>
                    {blocks.map((block, idx) => {
                      const schema = SCHEMAS[block.type];
                      const blockLabel = schema?.label || block.type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                      const isVisible = block.visible !== false;
                      return (
                        <div key={block.id} onClick={() => { setSelected(block.id); setRightTab("props"); }} className={`flex items-center gap-2 p-2 rounded cursor-pointer group transition-all ${selected === block.id ? "bg-[#D4AF37]/15 text-[#D4AF37]" : "hover:bg-[#1a1a1e] text-[#6a6a6e]"}`}>
                          <GripVertical className="w-3 h-3 opacity-40 cursor-grab" />
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isVisible ? "bg-green-500" : "bg-[#3a3a3e]"}`} />
                          <Layout className="w-3.5 h-3.5 shrink-0" />
                          <span className="flex-1 text-[10px] font-medium truncate">{blockLabel}</span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={e => { e.stopPropagation(); toggleVisibility(block.id); }} className="p-0.5 hover:text-[#f0ede8]">{isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}</button>
                            <button onClick={e => { e.stopPropagation(); moveBlock(idx, -1); }} disabled={idx === 0} className="p-0.5 hover:text-[#f0ede8] disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                            <button onClick={e => { e.stopPropagation(); deleteBlock(block.id); }} className="p-0.5 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      );
                    })}
                    {blocks.length === 0 && <p className="text-[9px] text-[#4a4a4e] text-center py-4">No blocks. Add from the "Add" tab.</p>}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Preview page info panel */
            <div className="flex-1 p-4 space-y-4">
              <div className="border border-blue-400/20 bg-blue-400/5 rounded p-3">
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-1">Live Preview</p>
                <p className="text-[9px] text-[#5a5a5e]">This page renders the actual live frontend. It cannot be edited via block editor.</p>
              </div>
              <div>
                <p className="text-[9px] text-[#4a4a4e] uppercase tracking-wider mb-2 font-semibold">Page URL</p>
                <p className="text-[9px] text-[#A1A1AA] font-mono break-all">{currentPageConfig.url}</p>
              </div>
              <div>
                <p className="text-[9px] text-[#4a4a4e] uppercase tracking-wider mb-2 font-semibold">Quick Links</p>
                <div className="space-y-1.5">
                  {currentPageConfig.id === "property_detail" && [
                    { label: "Palazzo Ducoss 8", url: "/property/693abb6d80cd6e002d2e8763" },
                    { label: "Villa with Pool", url: "/property/69ceb988571e1b00149f3c8b" },
                  ].map((link, i) => (
                    <button key={i} onClick={() => { window.open(`http://localhost:3000${link.url}`, "_blank"); }} className="w-full text-left text-[9px] text-[#D4AF37] hover:text-[#E5C158] truncate">→ {link.label}</button>
                  ))}
                  <button onClick={() => window.open(`http://localhost:3000${currentPageConfig.url}`, "_blank")} className="flex items-center gap-1 text-[9px] text-[#D4AF37] hover:text-[#E5C158]">
                    <ExternalLink className="w-3 h-3" /> Open in new tab
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Center: Canvas */}
        <main className="flex-1 flex flex-col bg-[#141416] overflow-hidden">
          {/* Canvas toolbar */}
          <div className="h-9 bg-[#0e0e10] border-b border-[#1a1a1e] flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              {isCMSPage ? (
                <span className="text-[9px] text-[#4a4a4e] font-medium">{blocks.length} blocks · {page}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-[9px] text-blue-400 font-medium">Live Preview — {currentPageConfig.label}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Live preview toggle for CMS pages */}
              {isCMSPage && (
                <button
                  onClick={() => window.open(`http://localhost:3000${currentPageConfig.url}`, "_blank")}
                  className="flex items-center gap-1 text-[9px] text-[#5a5a5e] hover:text-[#D4AF37] border border-[#1e1e22] rounded px-2 py-0.5 transition-colors"
                  title="Open live preview in new tab"
                >
                  <Eye className="w-3 h-3" />Live
                </button>
              )}
              {/* Pause-to-preview: freeze InlineText editing for clean preview */}
              {isCMSPage && (
                <button
                  onClick={() => setPauseEdit(p => !p)}
                  className={`flex items-center gap-1 text-[9px] border rounded px-2 py-0.5 transition-colors ${pauseEdit ? "bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37]" : "border-[#1e1e22] text-[#5a5a5e] hover:text-[#f0ede8]"}`}
                  title={pauseEdit ? "Click to resume editing" : "Pause editing to preview cleanly"}
                >
                  {pauseEdit ? <><Play className="w-3 h-3" />Edit</> : <><EyeOff className="w-3 h-3" />Preview</>}
                </button>
              )}
              {isCMSPage && (
                <>
                  <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 text-[#5a5a5e] hover:text-[#f0ede8]"><Minus className="w-3 h-3" /></button>
                  <span className="text-[9px] text-[#5a5a5e] w-8 text-center">{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(100, z + 10))} className="p-1 text-[#5a5a5e] hover:text-[#f0ede8]"><Plus className="w-3 h-3" /></button>
                </>
              )}
              {!isCMSPage && (
                <button onClick={() => { const iframe = document.getElementById("preview-iframe"); if (iframe) iframe.src = iframe.src; }} className="flex items-center gap-1 text-[9px] text-[#5a5a5e] hover:text-[#f0ede8]">
                  <RefreshCw className="w-3 h-3" />Refresh
                </button>
              )}
            </div>
          </div>

          {/* Canvas content */}
          <div className="flex-1 overflow-hidden">
            {isCMSPage ? (
              /* Block editor canvas */
              <div className="h-full overflow-y-auto overflow-x-hidden p-4 bg-[#0a0a0b]/50">
                <div
                  className="mx-auto shadow-2xl transition-all rounded overflow-hidden border border-[#1a1a1e]"
                  style={{
                    width: view === "desktop" ? "100%" : view === "tablet" ? "820px" : "390px",
                    maxWidth: "100%",
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top center",
                  }}
                >
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="blocks">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {blocks.filter(b => b.visible !== false).map((block, idx) => {
                            const Comp = BLOCKS[block.type];
                            if (!Comp) return (
                              <div key={block.id} className="p-4 bg-[#1a1a1e] border-l-2 border-[#D4AF37]/30 m-1">
                                <p className="text-[10px] text-[#4a4a4e]">Unknown block: {block.type}</p>
                              </div>
                            );
                            return (
                              <Draggable key={block.id} draggableId={block.id} index={idx}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    onClick={() => { if (!pauseEdit) { setSelected(block.id); setRightTab("props"); } }}
                                    className={`relative group ${!pauseEdit && selected === block.id ? "ring-2 ring-[#D4AF37] ring-inset" : !pauseEdit ? "hover:ring-1 hover:ring-[#D4AF37]/30 hover:ring-inset" : ""} ${snapshot.isDragging ? "opacity-90 shadow-2xl" : ""}`}
                                  >
                                    {/* Block toolbar overlay — hidden in pause/preview mode */}
                                    <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-1.5 bg-[#D4AF37] text-[#0a0a0b] text-[9px] font-semibold uppercase tracking-wide ${!pauseEdit && selected === block.id ? "opacity-100" : !pauseEdit ? "opacity-0 group-hover:opacity-100" : "hidden"} transition-opacity`}>
                                      <span {...provided.dragHandleProps} className="flex items-center gap-1.5 cursor-grab">
                                        <GripVertical className="w-3 h-3" />
                                        {SCHEMAS[block.type]?.label || block.type.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
                                      </span>
                                      <div className="flex gap-1">
                                        <button onClick={e => { e.stopPropagation(); duplicateBlock(block.id); }} className="p-0.5 hover:bg-black/10 rounded" title="Duplicate"><Copy className="w-3 h-3" /></button>
                                        <button onClick={e => { e.stopPropagation(); moveBlock(idx, -1); }} disabled={idx===0} className="p-0.5 hover:bg-black/10 rounded disabled:opacity-30" title="Move up"><ArrowUp className="w-3 h-3" /></button>
                                        <button onClick={e => { e.stopPropagation(); moveBlock(idx, 1); }} disabled={idx===blocks.filter(b=>b.visible!==false).length-1} className="p-0.5 hover:bg-black/10 rounded disabled:opacity-30" title="Move down"><ArrowDown className="w-3 h-3" /></button>
                                        <button onClick={e => { e.stopPropagation(); deleteBlock(block.id); }} className="p-0.5 hover:bg-red-500/20 rounded text-red-700" title="Delete"><Trash2 className="w-3 h-3" /></button>
                                      </div>
                                    </div>
                                    <BlockErrorBoundary blockType={block.type} blockId={block.id}>
                                      <Comp d={block.data} onEdit={pauseEdit ? undefined : ((field, value) => updateBlock(block.id, field, value))} />
                                    </BlockErrorBoundary>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                          {blocks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 text-[#4a4a4e]">
                              <Plus className="w-12 h-12 mb-4 opacity-20" />
                              <p className="text-sm">Add blocks from the left panel</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            ) : (
              /* Iframe live preview */
              <div className="h-full w-full relative bg-black">
                {/* URL bar */}
                <div className="h-8 bg-[#0e0e10] border-b border-[#1a1a1e] flex items-center gap-2 px-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 bg-[#1a1a1e] rounded text-[9px] text-[#5a5a5e] px-3 py-1 font-mono">
                    localhost:3000{currentPageConfig.url}
                  </div>
                  <button onClick={() => window.open(`http://localhost:3000${currentPageConfig.url}`, "_blank")} className="text-[#5a5a5e] hover:text-[#D4AF37]">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <iframe
                  id="preview-iframe"
                  src={previewUrl}
                  className="w-full border-none"
                  style={{ height: "calc(100% - 32px)" }}
                  title={`Preview: ${currentPageConfig.label}`}
                />
              </div>
            )}
          </div>
        </main>

        {/* Right: Enterprise inspector panel (CMS only) */}
        {isCMSPage && (
          <aside className="w-80 bg-[#0a0a0b] border-l border-[#1a1a1e] flex flex-col shrink-0">
            <div className="flex border-b border-[#1a1a1e] overflow-x-auto" style={{scrollbarWidth:"none"}}>
              {[
                { id:"ai",      label:"AI" },
                { id:"props",   label:"Props" },
                { id:"seo",     label:"SEO" },
                { id:"suggest", label:"Suggest" },
                { id:"json",    label:"JSON" },
              ].map(t => (
                <button key={t.id} onClick={() => setRightTab(t.id)} className={`flex-1 py-2.5 text-[9px] font-medium uppercase tracking-wide shrink-0 ${rightTab === t.id ? "text-[#D4AF37] bg-[#D4AF37]/5 border-b-2 border-[#D4AF37]" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}>{t.label}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {rightTab === "ai"      && <EnterpriseAIPanel block={selectedBlock} blocks={blocks} onApplyBlock={(f,v) => selectedBlock && updateBlock(selected, f, v)} onReplaceBlocks={(bs) => { snapshot(); setBlocks(bs); }} page={page} api={API} adminKey={localStorage.getItem("cvpm_admin_key")||""} />}
              {rightTab === "props"   && <PropsEditor block={selectedBlock} onUpdate={(f, v) => updateBlock(selected, f, v)} onAI={generateAI} isGenerating={generating} />}
              {rightTab === "seo"     && <SEOPanel blocks={blocks} page={page} api={API} adminKey={localStorage.getItem("cvpm_admin_key")||""} />}
              {rightTab === "suggest" && <SuggestPanel blocks={blocks} onAdd={addBlock} onAI={generateFromPrompt} selected={selectedBlock} />}
              {rightTab === "json"    && <JSONEditor block={selectedBlock} onUpdate={(f, v) => updateBlock(selected, f, v)} />}
            </div>
          </aside>
        )}

        </div>
      )}

      {/* Keyboard hints (studio only) */}
      {mode === "studio" && (
        <div className="absolute bottom-3 left-3 text-[8px] text-[#3a3a3e] flex items-center gap-3">
          <span><Command className="w-3 h-3 inline" />Z Undo</span>
          <span><Command className="w-3 h-3 inline" />⇧Z Redo</span>
          <span><Command className="w-3 h-3 inline" />S Save</span>
        </div>
      )}

      {/* API Keys Modal */}
      {showKeys && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999]" onClick={() => setShowKeys(false)}>
          <div className="bg-[#0a0a0b] border border-[#1a1a1e] p-6 w-full max-w-md rounded-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#f0ede8]">API Configuration</h3>
              <button onClick={() => setShowKeys(false)} className="p-1.5 text-[#5a5a5e] hover:text-[#f0ede8]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><p className="text-[11px] text-[#5a5a5e] mb-1">AI (Emergent LLM)</p><span className="text-[10px] text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Active</span></div>
              <div><p className="text-[11px] text-[#5a5a5e] mb-1">Guesty API</p><span className="text-[10px] text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Connected</span></div>
              <div><p className="text-[11px] text-[#5a5a5e] mb-1">Stripe</p><span className="text-[10px] text-green-500 flex items-center gap-1"><Check className="w-3 h-3" />Configured</span></div>
            </div>
            <Button onClick={() => setShowKeys(false)} className="w-full mt-6 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0a0a0b]">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
