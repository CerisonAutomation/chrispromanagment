/**
 * PageGeneratorPanel — admin UI for the ZENITH ORACLE page generator.
 *
 * Flow:
 *   1. Operator fills slug + brief + audience + style.
 *   2. Calls generatePage() → AI returns { root, blocks[] } using only
 *      types registered in blockRegistry.
 *   3. Preview list shows each block + warnings (dropped unknown types).
 *   4. "Save as draft" upserts to `cms_content` as `page_<slug>_draft`
 *      with shape { blocks, root } — the same shape the existing
 *      LiveNavigateMode / draft endpoints already consume.
 */

import { useState } from "react";
import { Sparkles, Loader2, Save, RefreshCw, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generatePage } from "@/lib/aiPageGenerator";

const AUDIENCES = [
  { value: "guests", label: "Guests" },
  { value: "owners", label: "Owners" },
  { value: "mixed", label: "Mixed / brand" },
];

const STYLES = [
  { value: "elegant", label: "Elegant (default)" },
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
];

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function PageGeneratorPanel() {
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("mixed");
  const [style, setStyle] = useState("elegant");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null); // { root, blocks, warnings? }
  const [savedAs, setSavedAs] = useState(null);

  const onGenerate = async () => {
    const cleanSlug = slugify(slug);
    if (!cleanSlug) return toast.error("Slug is required (e.g. 'sliema-stays')");
    if (!description.trim()) return toast.error("Page brief is required");
    setSlug(cleanSlug);
    setGenerating(true);
    setResult(null);
    setSavedAs(null);
    try {
      const data = await generatePage({
        description: description.trim(),
        audience,
        style,
        pageSlug: cleanSlug,
      });
      setResult(data);
      const n = data.blocks?.length ?? 0;
      toast.success(`Generated ${n} block${n === 1 ? "" : "s"}`);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const onSaveDraft = async () => {
    if (!result?.blocks?.length) return;
    setSaving(true);
    try {
      const sectionKey = `page_${slug}_draft`;
      const { error } = await supabase.from("cms_content").upsert(
        {
          section_key: sectionKey,
          section_label: `${slug} (draft)`,
          content: { blocks: result.blocks, root: result.root || { props: {} } },
        },
        { onConflict: "section_key" }
      );
      if (error) throw error;
      setSavedAs(sectionKey);
      toast.success(`Saved draft: ${sectionKey}`);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f0ede8] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#0a0a0b]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">AI Page Generator</h1>
            <p className="text-sm text-[#71717A]">
              ZENITH ORACLE — generates a full draft using your registered blocks.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 border border-white/10 rounded-lg bg-[#0F0F10]">
          <div className="md:col-span-1">
            <label className="block text-xs uppercase tracking-widest text-[#71717A] mb-1">Page slug</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="sliema-luxury-stays"
              className="bg-[#0a0a0b] border-white/10"
            />
            <p className="text-[10px] text-[#71717A] mt-1">
              Saves to <code>page_{slug ? slugify(slug) : "&lt;slug&gt;"}_draft</code>.
            </p>
          </div>
          <div className="md:col-span-1 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#71717A] mb-1">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full h-9 px-3 bg-[#0a0a0b] border border-white/10 rounded text-sm"
              >
                {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#71717A] mb-1">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full h-9 px-3 bg-[#0a0a0b] border border-white/10 rounded text-sm"
              >
                {STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-[#71717A] mb-1">Page brief</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Landing page for owners in Sliema and St Julian's, highlighting full-service management, dynamic pricing, 24/7 guest care, and a free revenue assessment CTA."
              className="min-h-[120px] bg-[#0a0a0b] border-white/10 text-sm"
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <Button
              onClick={onGenerate}
              disabled={generating || !description.trim()}
              className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#0a0a0b] font-semibold"
            >
              {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><Sparkles className="w-4 h-4 mr-2" />Generate page</>}
            </Button>
          </div>
        </div>

        {/* Warnings */}
        {result?.warnings?.droppedUnknownTypes?.length ? (
          <div className="flex items-start gap-2 p-3 border border-[#D4AF37]/30 bg-[#D4AF37]/5 rounded text-xs text-[#D4AF37]">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              The AI tried to emit unknown block types and they were dropped:{" "}
              <code>{result.warnings.droppedUnknownTypes.join(", ")}</code>. Register them in
              <code className="ml-1">blockRegistry</code> if you want to keep them.
            </span>
          </div>
        ) : null}

        {/* Preview */}
        {result?.blocks?.length ? (
          <div className="border border-white/10 rounded-lg bg-[#0F0F10]">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <p className="text-sm font-medium">{result.root?.props?.title || "(no SEO title)"}</p>
                <p className="text-xs text-[#71717A] mt-0.5">{result.root?.props?.description || "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onGenerate}
                  disabled={generating}
                  className="text-[#A1A1AA] hover:text-[#f0ede8]"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${generating ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
                <Button
                  onClick={onSaveDraft}
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#0a0a0b]"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : savedAs ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {savedAs ? "Saved" : "Save as draft"}
                </Button>
              </div>
            </div>
            <ol className="divide-y divide-white/5">
              {result.blocks.map((b, i) => (
                <li key={b.id} className="flex items-start gap-3 p-3 text-sm">
                  <span className="text-[10px] text-[#71717A] w-6 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-[#D4AF37] text-xs">{b.type}</code>
                      <span className="text-[10px] text-[#71717A]">#{b.id}</span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] mt-1 truncate">
                      {previewLine(b.data)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-[#71717A] border border-dashed border-white/10 rounded-lg">
            Fill the brief and hit <span className="text-[#D4AF37]">Generate page</span>.
          </div>
        )}
      </div>
    </div>
  );
}

function previewLine(data) {
  if (!data || typeof data !== "object") return "—";
  const fields = ["title", "headline", "eyebrow", "subtitle", "label", "name", "heading"];
  for (const f of fields) {
    const v = data[f];
    if (typeof v === "string" && v.trim()) return v.length > 140 ? v.slice(0, 140) + "…" : v;
  }
  const keys = Object.keys(data).slice(0, 4).join(", ");
  return keys ? `{ ${keys}${Object.keys(data).length > 4 ? ", …" : ""} }` : "—";
}
