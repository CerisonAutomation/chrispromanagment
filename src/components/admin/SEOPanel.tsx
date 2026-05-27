import { useState, memo } from "react";
import { Award, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  blocks: Array<{ type: string; data?: Record<string, unknown> }>;
  page: string;
}

export const SEOPanel = memo(({ blocks, page }: Props) => {
  const [seo,     setSeo]     = useState({ title:"", description:"", keywords:"", ogImage:"" });
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

  const score = (() => {
    let s = 0;
    if (seo.title?.length >= 30 && seo.title?.length <= 60) {
s += 25;
} else if (seo.title) {
s += 10;
}
    if (seo.description?.length >= 120 && seo.description?.length <= 160) {
s += 25;
} else if (seo.description) {
s += 10;
}
    if (seo.keywords) {
s += 15;
}
    if (seo.ogImage) {
s += 10;
}
    if (blocks.some(b => b.data?.headline || b.data?.title || b.data?.badge)) {
s += 25;
}
    return Math.min(100, s);
  })();
  const scoreColor = score >= 80 ? "#52c27a" : score >= 50 ? "#D4B85C" : "#e05252";

  const checks = [
    { ok: seo.title?.length >= 30 && seo.title?.length <= 60, label:`Title ${seo.title?.length||0}/60`, detail: `${seo.title?.length||0} chars` },
    { ok: seo.description?.length >= 120 && seo.description?.length <= 160, label:`Description ${seo.description?.length||0}/160`, detail: `${seo.description?.length||0} chars` },
    { ok: !!seo.keywords, label:"Keywords set", detail: seo.keywords ? "Set" : "Missing" },
    { ok: !!seo.ogImage, label:"OG image set", detail: seo.ogImage ? "Set" : "Missing" },
    { ok: blocks.some(b => b.data?.headline || b.data?.title), label:"H1 heading in page", detail: "Detected from blocks" },
  ];

  const autoFill = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { prompt: `Generate SEO meta title, description, and keywords for the "${page}" page. Return JSON: { title, description, keywords }`, mode: "seo" },
      });
      if (error) {
throw error;
}
      const parsed = typeof data?.content === "string" ? JSON.parse(data.content.replace(/```json\n?|```/g, "").trim()) : data;
      if (parsed?.title) {
setSeo(s => ({ ...s, title: parsed.title }));
}
      if (parsed?.description) {
setSeo(s => ({ ...s, description: parsed.description }));
}
      if (parsed?.keywords) {
setSeo(s => ({ ...s, keywords: parsed.keywords }));
}
      toast.success("SEO auto-filled by AI");
    } catch {
      toast.error("AI SEO requires ai-generate edge function");
    }
    setLoading(false);
  };

  const saveSEO = async () => {
    try {
      const { error } = await supabase.from("cms_page_seo").upsert({
        page_slug: page,
        meta_title: seo.title || null,
        meta_description: seo.description || null,
        meta_keywords: seo.keywords || null,
        og_image: seo.ogImage || null,
      }, { onConflict: "page_slug" });
      if (error) {
throw error;
}
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      toast.success("SEO saved");
    } catch {
      toast.error("SEO save failed");
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3 p-3 bg-[#0e0e10] rounded border border-[#1a1a1e]">
        <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ borderColor: scoreColor, color: scoreColor }}>{score}</div>
        <div>
          <p className="text-[11px] font-semibold text-[#f0ede8]">SEO Score</p>
          <p className="text-[9px] text-[#5a5a5e]">{score >= 80 ? "Good" : score >= 50 ? "Average" : "Needs work"}</p>
        </div>
      </div>
      {[
        { key:"title",       label:`Title (${seo.title?.length||0}/60)`,          multi:false, ph:"Christiano Property Management | Malta Luxury Rentals" },
        { key:"description", label:`Description (${seo.description?.length||0}/160)`, multi:true,  ph:"Malta's premier luxury short-term rental..." },
        { key:"keywords",    label:"Keywords",                                              multi:false, ph:"malta property management, vacation rentals" },
        { key:"ogImage",     label:"OG Image URL",                                         multi:false, ph:"https://..." },
      ].map(f => (
        <div key={f.key}>
          <p className="text-[10px] uppercase tracking-wider text-[#5a5a5e] mb-1.5 font-medium">{f.label}</p>
          {f.multi
            ? <textarea rows={3} value={seo[f.key]||""} onChange={e => setSeo(s=>({...s,[f.key]:e.target.value}))} placeholder={f.ph} className="w-full bg-[#0e0e10] border border-[#1e1e22] rounded text-[11px] text-[#f0ede8] p-2 resize-none focus:outline-none focus:border-[#C9A84C]/40 leading-relaxed" />
            : <input  type="text" value={seo[f.key]||""} onChange={e => setSeo(s=>({...s,[f.key]:e.target.value}))} placeholder={f.ph} className="w-full bg-[#0e0e10] border border-[#1e1e22] rounded text-[11px] text-[#f0ede8] px-2 h-9 focus:outline-none focus:border-[#C9A84C]/40" />
          }
        </div>
      ))}
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
        <button onClick={saveSEO} className={`flex-1 py-2 text-[9px] rounded font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 ${saved ? "bg-green-500/20 text-green-400" : "bg-[#C9A84C] text-[#0a0a0b] hover:bg-[#D4B85C]"}`}>
          {saved ? <><Check className="w-3 h-3" />Saved</> : <><Award className="w-3 h-3" />Save SEO</>}
        </button>
      </div>
    </div>
  );
});
