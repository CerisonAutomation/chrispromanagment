import { useState, memo } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MISSING_BLOCK_SUGGESTIONS = [
  { type:"stats",        label:"Stats Bar",      reason:"Trust signals boost conversions" },
  { type:"testimonials", label:"Testimonials",   reason:"Social proof is #1 conversion driver" },
  { type:"pricing",      label:"Pricing Table",  reason:"Clear pricing reduces friction" },
  { type:"faq",          label:"FAQ",            reason:"FAQs reduce support burden" },
  { type:"cta",          label:"Call to Action", reason:"Every page needs a clear conversion goal" },
  { type:"reviews_live", label:"Live Reviews",   reason:"Real-time Guesty reviews build trust" },
  { type:"numbers",      label:"Big Numbers",    reason:"Impact statistics establish authority" },
  { type:"comparison",   label:"Comparison",     reason:"Feature tables help owners decide" },
];

interface Props {
  blocks: Array<{ type: string }>;
  onAdd: (type: string) => void;
  onAI: (prompt: string) => void;
  selected: boolean;
}

export const SuggestPanel = memo(({ blocks, onAdd, onAI, selected }: Props) => {
  const [critique, setCritique] = useState<Array<{ type: string; title: string; detail: string }> | null>(null);
  const [loading,  setLoading] = useState(false);
  const existing = new Set(blocks.map(b => b.type));

  const runCritique = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: {
          prompt: `Critique this page structure.\nBlocks: ${blocks.map(b=>b.type).join(", ")}\nTotal: ${blocks.length}\nReturn JSON array: [{"type":"good|warn|improve","title":"...","detail":"..."}]`,
          section: "page", mode: "critique"
        },
      });
      if (error) {
throw error;
}
      const raw = (data?.content || "").replace(/```json\n?|```/g, "").trim();
      try {
        setCritique(JSON.parse(raw));
      } catch {
        setCritique([{ type: "warn", title: "Parse error", detail: "AI returned unstructured feedback." }]);
      }
    } catch {
      setCritique([{ type: "warn", title: "AI unavailable", detail: "Deploy ai-generate edge function." }]);
    }
    setLoading(false);
  };

  const color: Record<string, string> = { good:"#52c27a", warn:"#D4B85C", improve:"#7c6af5" };

  const missing = MISSING_BLOCK_SUGGESTIONS.filter(s => !existing.has(s.type));

  return (
    <div className="p-3 flex flex-col gap-4">
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
                <div className="w-1.5 h-full rounded-full shrink-0 mt-0.5" style={{ background: color[c.type] || "#888", minHeight: 30 }} />
                <div>
                  <p className="text-[10px] font-medium text-[#f0ede8]">{c.title}</p>
                  <p className="text-[9px] text-[#6a6a6e] mt-0.5 leading-relaxed">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {missing.length > 0 && (
        <div>
          <p className="text-[9px] uppercase tracking-wider text-[#5a5a5e] mb-2 font-medium">Recommended Additions</p>
          <div className="space-y-1.5">
            {missing.slice(0, 6).map(s => (
              <div key={s.type} className="flex items-center gap-2 p-2.5 bg-[#0e0e10] rounded border border-[#1a1a1e] hover:border-[#C9A84C]/20 group">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-[#f0ede8]">{s.label}</p>
                  <p className="text-[9px] text-[#5a5a5e] truncate">{s.reason}</p>
                </div>
                <button onClick={() => {
 onAdd(s.type); toast.success(`${s.label} added`); 
}} className="px-2.5 py-1 text-[8px] bg-[#C9A84C]/10 text-[#C9A84C] rounded font-medium uppercase tracking-wider hover:bg-[#C9A84C]/20 shrink-0">
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 bg-[#0e0e10] rounded border border-[#1a1a1e]">
        <p className="text-[9px] uppercase tracking-wider text-[#5a5a5e] mb-2 font-medium">Page Health</p>
        {[
          { label:"Has Header",      ok: existing.has("header") },
          { label:"Has Hero",        ok: existing.has("hero") || existing.has("owners_hero") },
          { label:"Has CTA",         ok: existing.has("cta") },
          { label:"Has Footer",      ok: existing.has("footer") },
          { label:"Has Social Proof",ok: existing.has("testimonials") || existing.has("reviews_live") },
          { label:"Has Live Data",   ok: existing.has("properties") || existing.has("guesty_listings") },
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
