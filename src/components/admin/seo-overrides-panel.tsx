// SEO Overrides admin panel (P4). Read/write cms_page_seo.
import { useEffect, useState } from "react";
import { Search, Save, Trash2, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_ROUTES = [
  "/", "/properties", "/map", "/property-owners", "/for-owners",
];

export default function SeoOverridesPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cms_page_seo")
      .select("*")
      .order("page_slug");
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const pick = (row) => {
    setActive(row.page_slug);
    setDraft({ ...row });
  };

  const newOverride = () => {
    const slug = window.prompt("Page slug (e.g. /, /properties, /property/123)");
    if (!slug) return;
    const row = {
      page_slug: slug.trim(),
      meta_title: "",
      meta_description: "",
      canonical_url: "",
      og_image: "",
      robots: "index,follow",
    };
    setRows((r) => [row, ...r.filter((x) => x.page_slug !== row.page_slug)]);
    pick(row);
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    const { error } = await supabase.from("cms_page_seo").upsert(draft, { onConflict: "page_slug" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("SEO override saved");
    load();
  };

  const remove = async (slug) => {
    if (!window.confirm(`Remove SEO override for ${slug}?`)) return;
    const { error } = await supabase.from("cms_page_seo").delete().eq("page_slug", slug);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    if (active === slug) { setActive(null); setDraft(null); }
    load();
  };

  const known = new Set(rows.map((r) => r.page_slug));
  const suggested = DEFAULT_ROUTES.filter((s) => !known.has(s));

  return (
    <div className="border border-white/10 rounded-lg bg-[#0F0F10] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#F5F5F0]">
            <Search className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-base font-semibold">Per-page SEO Overrides</h2>
          </div>
          <p className="text-xs text-[#71717A] mt-1">
            Overrides take precedence over sitewide defaults. Used by SEOHead and the sitemap.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-white/10" onClick={newOverride}>
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
          <a
            href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap-xml`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center text-xs text-[#D4AF37] hover:underline"
          >
            sitemap.xml <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-1 max-h-[420px] overflow-auto pr-1">
          {loading && <p className="text-xs text-[#71717A]">Loading…</p>}
          {!loading && rows.length === 0 && (
            <p className="text-xs text-[#71717A]">No overrides yet. Click "New" or pick a suggested route below.</p>
          )}
          {rows.map((r) => (
            <button
              key={r.page_slug}
              onClick={() => pick(r)}
              className={`w-full text-left px-3 py-2 rounded text-sm border ${
                active === r.page_slug
                  ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F5F5F0]"
                  : "border-white/5 text-[#A1A1AA] hover:bg-white/5"
              }`}
            >
              <div className="font-mono text-xs">{r.page_slug}</div>
              {r.meta_title && <div className="text-[11px] truncate">{r.meta_title}</div>}
            </button>
          ))}
          {suggested.length > 0 && (
            <div className="pt-3 border-t border-white/5 mt-2">
              <p className="text-[10px] uppercase tracking-widest text-[#71717A] mb-1">Suggested</p>
              {suggested.map((s) => (
                <button
                  key={s}
                  onClick={() => pick({ page_slug: s, robots: "index,follow" })}
                  className="block w-full text-left text-xs text-[#A1A1AA] hover:text-[#D4AF37] px-3 py-1 font-mono"
                >
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-3">
          {!draft && (
            <p className="text-xs text-[#71717A]">Select a slug to edit its SEO override.</p>
          )}
          {draft && (
            <>
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm text-[#F5F5F0]">{draft.page_slug}</p>
                {draft.id && (
                  <Button size="sm" variant="ghost" className="text-[#A1A1AA]" onClick={() => remove(draft.page_slug)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                )}
              </div>

              <Field
                label="Meta title" max={60} value={draft.meta_title || ""}
                onChange={(v) => setDraft({ ...draft, meta_title: v })}
              />
              <Field
                label="Meta description" max={160} textarea value={draft.meta_description || ""}
                onChange={(v) => setDraft({ ...draft, meta_description: v })}
              />
              <Field
                label="Canonical URL" placeholder={`https://example.com${draft.page_slug}`}
                value={draft.canonical_url || ""}
                onChange={(v) => setDraft({ ...draft, canonical_url: v })}
              />
              <Field
                label="OG image URL" placeholder="https://…/og.jpg"
                value={draft.og_image || ""}
                onChange={(v) => setDraft({ ...draft, og_image: v })}
              />
              <div>
                <label className="block text-xs text-[#71717A] mb-1">Robots</label>
                <select
                  value={draft.robots || "index,follow"}
                  onChange={(e) => setDraft({ ...draft, robots: e.target.value })}
                  className="w-full bg-[#0a0a0b] border border-white/10 text-[#F5F5F0] rounded px-3 py-2 text-sm"
                >
                  <option value="index,follow">index, follow (default)</option>
                  <option value="noindex,follow">noindex, follow</option>
                  <option value="index,nofollow">index, nofollow</option>
                  <option value="noindex,nofollow">noindex, nofollow</option>
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={save} disabled={saving} className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]">
                  <Save className="w-4 h-4 mr-2" /> {saving ? "Saving…" : "Save override"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, max, textarea, placeholder }) {
  const Cmp = textarea ? Textarea : Input;
  const over = max && value.length > max;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-[#71717A]">{label}</label>
        {max && (
          <span className={`text-[10px] ${over ? "text-[#EF4444]" : "text-[#71717A]"}`}>
            {value.length}/{max}
          </span>
        )}
      </div>
      <Cmp
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]"
        rows={textarea ? 2 : undefined}
      />
    </div>
  );
}
