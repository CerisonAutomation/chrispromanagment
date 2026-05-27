import { useState, useCallback, memo } from "react";
import { Sparkles, Clock, Layers, Loader2, Check, Layout } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AI_QUICK_PROMPTS = [
  { label:"Rewrite — luxury tone",   prompt:"Rewrite all text fields in a more luxurious, premium tone. Sophisticated and aspirational. Malta property context." },
  { label:"Rewrite — concise",       prompt:"Make all text fields shorter and punchier. Cut filler words. Preserve meaning but tighten." },
  { label:"Hero copy",               prompt:"Generate a compelling hero section: badge, headline with accent, subheadline, CTA." },
  { label:"Add social proof",        prompt:"Enhance copy to include trust signals, social proof, and authority markers." },
  { label:"SEO-optimise",            prompt:"Rewrite all text fields to be SEO-optimised for Malta property management." },
  { label:"Add urgency",             prompt:"Add tasteful urgency and scarcity signals. No fake pressure." },
  { label:"Guest perspective",       prompt:"Rewrite copy from a guest's perspective — aspirational, experiential." },
  { label:"Owner perspective",       prompt:"Rewrite copy from a property owner's perspective — focus on ROI, trust." },
];

const PAGE_BUILD_TEMPLATES = {
  home: "Generate a complete home page for Christiano Property Management, a luxury short-term rental management company in Malta. Include: hero, stats, properties grid, features, testimonials, pricing, CTA.",
  owners: "Generate a For Owners page. Include: owners hero, why us, services, pricing, FAQ, CTA.",
  properties: "Generate a Properties page with: hero, search widget, live Guesty listings grid.",
  about: "Generate an About Us page. Include: hero, about split, numbers, team, logos, CTA.",
  contact: "Generate a Contact page with: form, address/phone/email, map.",
};

interface Props {
  block: { type: string; data?: Record<string, unknown> } | null;
  blocks: Array<{ type: string; data?: Record<string, unknown> }>;
  onApplyBlock: (key: string, value: unknown) => void;
  onReplaceBlocks: (blocks: Array<{ id?: string; type: string; data?: Record<string, unknown>; visible?: boolean }>) => void;
  page: string;
}

export const EnterpriseAIPanel = memo(({ block, blocks, onApplyBlock, onReplaceBlocks, page }: Props) => {
  const [mode,      setMode]      = useState<"field" | "page" | "critique">("field");
  const [prompt,    setPrompt]    = useState("");
  const [result,    setResult]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [history,   setHistory]   = useState<Array<{ prompt: string; result: string; mode: string; ts: number }>>([]);
  const [showHist,  setShowHist]  = useState(false);

  const run = useCallback(async (overridePrompt?: string) => {
    const p = overridePrompt || prompt;
    if (!p.trim()) {
return;
}
    setLoading(true); setStreaming(true); setResult("");
    try {
      const body = {
        prompt: mode === "field"
          ? `Block type: ${block?.type}. Current data: ${JSON.stringify(block?.data).slice(0,600)}.\nTask: ${p}\nReturn improved JSON.`
          : mode === "page"
          ? `${p}\nReturn JSON array of blocks: [{type, data}]. Use: hero, stats, features, owners, pricing, faq, cta, testimonials.`
          : `Critique this page: ${blocks.map(b=>b.type).join(", ")}. Provide 5-7 improvements.`,
        section: block?.type || page,
        mode,
      };
      const { data, error } = await supabase.functions.invoke("ai-generate", { body });
      if (error) {
throw error;
}
      const text = data?.content || data?.text || "";
      let displayed = "";
      for (let i = 0; i < text.length; i += 6) {
        displayed = text.slice(0, i + 6);
        setResult(displayed);
        await new Promise(r => setTimeout(r, 8));
      }
      setResult(text);
      setHistory(h => [{ prompt: p, result: text, mode, ts: Date.now() }, ...h.slice(0, 9)]);
    } catch {
      setResult("AI generation requires the ai-generate Supabase Edge Function deployed with an Anthropic API key.");
    }
    setLoading(false); setStreaming(false);
  }, [block, blocks, mode, page, prompt]);

  const applyResult = () => {
    if (!result) {
return;
}
    if (mode === "page") {
      try {
        const raw = result.replace(/```json\n?|```/g, "").trim();
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const uid = () => `b${Date.now()}${Math.random().toString(36).slice(2,6)}`;
          onReplaceBlocks(parsed.map(b => ({ id: uid(), type: b.type, data: b.data || {}, visible: true })));
          toast.success(`Page built: ${parsed.length} blocks`);
        }
      } catch {
 toast.error("Could not parse page blocks JSON"); 
}
    } else if (mode === "field" && block) {
      try {
        const raw = result.replace(/```json\n?|```/g, "").trim();
        if (raw.startsWith("{")) {
          const parsed = JSON.parse(raw);
          Object.keys(parsed).forEach(k => onApplyBlock(k, parsed[k]));
          toast.success("Applied to block");
        } else {
          const schema = block.data;
          const firstTextField = Object.keys(schema).find(k => typeof schema[k] === "string" && k !== "backgroundImage");
          if (firstTextField) {
 onApplyBlock(firstTextField, raw); toast.success(`Applied to "${firstTextField}"`); 
}
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
      <div className="p-3 border-b border-[#1a1a1e]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded bg-[#7c6af5]/15 border border-[#7c6af5]/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#a89ff8]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#f0ede8]">Enterprise AI</p>
            <p className="text-[9px] text-[#4a4a4e]">GPT-4o via Emergent LLM</p>
          </div>
          <button onClick={() => setShowHist(h => !h)} className="ml-auto p-1.5 text-[#4a4a4e] hover:text-[#C9A84C]" title="History">
            <Clock className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-1 p-0.5 bg-[#0e0e10] rounded">
          {[["field","Field"],["page","Page"],["critique","Audit"]].map(([m,l]) => (
            <button key={m} onClick={() => setMode(m as "field" | "page" | "critique")} className={`flex-1 py-1 text-[9px] font-medium rounded transition-all ${mode===m ? "bg-[#1a1a1e] text-[#C9A84C]" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}>{l}</button>
          ))}
        </div>
      </div>
      {showHist && history.length > 0 && (
        <div className="border-b border-[#1a1a1e] max-h-48 overflow-y-auto bg-[#060608]">
          <p className="text-[9px] text-[#4a4a4e] px-3 py-2 uppercase tracking-wider">Recent generations</p>
          {history.map((h, i) => (
            <button key={i} onClick={() => {
 setPrompt(h.prompt); setResult(h.result); setMode(h.mode as "field" | "page" | "critique"); setShowHist(false); 
}} className="w-full text-left px-3 py-2 hover:bg-[#1a1a1e] border-b border-[#1a1a1e] last:border-0">
              <p className="text-[10px] text-[#f0ede8] truncate">{h.prompt.slice(0,55)}</p>
              <p className="text-[9px] text-[#4a4a4e] mt-0.5">{h.mode} · {new Date(h.ts).toLocaleTimeString()}</p>
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {mode === "field" && (
          <div className={`text-[9px] px-2 py-1.5 rounded flex items-center gap-2 ${block ? "bg-[#C9A84C]/10 text-[#C9A84C]" : "bg-[#1a1a1e] text-[#5a5a5e]"}`}>
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
        <div>
          <p className="text-[9px] text-[#4a4a4e] uppercase tracking-wider mb-2">
            {mode === "page" ? "Page templates" : mode === "critique" ? "Run audit" : "Quick prompts"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {mode === "page"
              ? Object.entries(PAGE_BUILD_TEMPLATES).map(([k, v]) => (
                  <button key={k} onClick={() => {
 setPrompt(v); run(v); 
}} className="px-2 py-1 text-[9px] border border-[#1e1e22] rounded text-[#6a6a6e] hover:border-[#C9A84C]/40 hover:text-[#C9A84C] transition-all capitalize">{k}</button>
                ))
              : mode === "critique"
              ? <button onClick={() => run("Critique this page structure.")} className="px-3 py-1.5 text-[9px] border border-[#7c6af5]/30 rounded text-[#a89ff8] bg-[#7c6af5]/10 hover:bg-[#7c6af5]/20 transition-all">Run page audit now</button>
              : AI_QUICK_PROMPTS.map((qp, i) => (
                  <button key={i} onClick={() => {
 setPrompt(qp.prompt); 
}} className={`px-2 py-1 text-[9px] border rounded transition-all ${prompt === qp.prompt ? "border-[#C9A84C]/50 bg-[#C9A84C]/10 text-[#C9A84C]" : "border-[#1e1e22] text-[#6a6a6e] hover:border-[#C9A84C]/30 hover:text-[#f0ede8]"}`}>{qp.label}</button>
                ))
            }
          </div>
        </div>
        <div>
          <p className="text-[9px] text-[#4a4a4e] uppercase tracking-wider mb-1.5">Prompt</p>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
 if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
run();
} 
}}
            placeholder={mode === "page" ? "Describe the page..." : mode === "critique" ? "Add concerns..." : "Describe what to generate..."}
            rows={4}
            className="w-full bg-[#0e0e10] border border-[#1e1e22] rounded text-[11px] text-[#f0ede8] p-2 resize-none focus:outline-none focus:border-[#C9A84C]/40 leading-relaxed"
          />
          <p className="text-[8px] text-[#3a3a3e] mt-0.5">⌘↵ to generate</p>
        </div>
        <button onClick={() => run()} disabled={loading || !prompt.trim()} className={`w-full py-2.5 rounded flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wider transition-all ${loading ? "bg-[#7c6af5]/20 text-[#a89ff8] cursor-wait" : "bg-[#C9A84C] text-[#0a0a0b] hover:bg-[#D4B85C]"}`}>
          {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating...</> : <><Sparkles className="w-3.5 h-3.5" />Generate</>}
        </button>
        {(result || streaming) && (
          <div className="bg-[#060608] border border-[#1a1a1e] rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1e]">
              <div className="flex items-center gap-2">
                {streaming
                  ? <><Loader2 className="w-3 h-3 animate-spin text-[#a89ff8]" /><span className="text-[9px] text-[#a89ff8]">Generating...</span></>
                  : <><Check className="w-3 h-3 text-green-500" /><span className="text-[9px] text-green-500">Ready</span></>
                }
              </div>
              <span className="text-[9px] text-[#4a4a4e]">{wordCount} words</span>
            </div>
            <div className="p-3 max-h-52 overflow-y-auto">
              <pre className="text-[10px] text-[#c0bdb5] whitespace-pre-wrap font-mono leading-relaxed break-all">{result}</pre>
            </div>
            <div className="flex gap-2 p-2 border-t border-[#1a1a1e]">
              <button onClick={applyResult} disabled={streaming} className="flex-1 py-1.5 text-[9px] bg-[#C9A84C]/15 text-[#C9A84C] rounded hover:bg-[#C9A84C]/25 font-medium disabled:opacity-40">Apply</button>
              <button onClick={() => {
 navigator.clipboard?.writeText(result); toast.success("Copied"); 
}} className="flex-1 py-1.5 text-[9px] bg-[#1a1a1e] text-[#6a6a6e] rounded hover:text-[#f0ede8]">Copy</button>
              <button onClick={() => {
 setResult(""); setPrompt(""); 
}} className="px-2 py-1.5 text-[9px] text-[#3a3a3e] hover:text-[#6a6a6e]">Clear</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
