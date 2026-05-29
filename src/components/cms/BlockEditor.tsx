import { useState, useCallback, useEffect } from "react";
import { Save, Eye, EyeOff, ChevronDown, ChevronUp, Code2, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldEditor } from "./FieldEditor";
import { CmsCommandRepository } from "@/lib/cms-repository";
import type { CmsRow, ComponentDefinition } from "@/lib/cms-types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BlockEditorProps {
  row: CmsRow;
  definition: ComponentDefinition | undefined;
  onChange: (id: string, patch: Partial<CmsRow>) => void;
  aiEnabled: boolean;
}

const PAGE_COLORS: Record<string, string> = {
  landing:  "bg-blue-500/15 text-blue-400",
  booking:  "bg-emerald-500/15 text-emerald-400",
  owners:   "bg-purple-500/15 text-purple-400",
  listing:  "bg-amber-500/15 text-amber-400",
  global:   "bg-muted text-muted-foreground",
};

export function BlockEditor({ row, definition, onChange, aiEnabled }: BlockEditorProps) {
  const [expanded,  setExpanded]  = useState(false);
  const [rawMode,   setRawMode]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [rawText,   setRawText]   = useState(() => JSON.stringify(row.content, null, 2));
  const [rawError,  setRawError]  = useState<string | null>(null);

  // Sync rawText when external changes arrive (e.g. Save All or version restore)
  useEffect(() => {
    if (!rawMode) setRawText(JSON.stringify(row.content, null, 2));
  }, [row.content, rawMode]);

  const handleFieldChange = useCallback(
    (key: string, value: unknown) => {
      onChange(row.id, { content: { ...row.content, [key]: value } });
      setSaved(false);
    },
    [row.id, row.content, onChange]
  );

  const handleRawChange = (text: string) => {
    setRawText(text);
    setSaved(false);
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      onChange(row.id, { content: parsed });
      setRawError(null);
    } catch {
      setRawError("Invalid JSON");
    }
  };

  const save = async () => {
    if (rawError) { toast.error("Fix JSON errors before saving"); return; }
    setSaving(true);
    const result = await CmsCommandRepository.saveRow(row.id, {
      content:       row.content,
      is_visible:    row.is_visible,
      section_label: row.section_label,
    });
    setSaving(false);
    if (!result.ok) { toast.error(result.error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    toast.success(`Saved ${row.section_key}`);
  };

  const pageLabel  = definition?.page ?? "global";
  const badgeCls   = PAGE_COLORS[pageLabel] ?? PAGE_COLORS["global"]!;

  return (
    <div className={cn(
      "rounded-2xl border transition-all duration-200",
      row.is_visible ? "border-border/50 bg-card/40" : "border-border/30 bg-card/20 opacity-60",
      expanded && "border-gold/30 shadow-elegant"
    )}>
      {/* ── Header ── */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        className="flex cursor-pointer items-center gap-3 px-5 py-4 rounded-2xl"
        onClick={() => setExpanded((e) => !e)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded((v) => !v); } }}
      >
        <div className={cn("h-2 w-2 shrink-0 rounded-full", row.is_visible ? "bg-emerald-500" : "bg-muted-foreground/40")} aria-hidden />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-sm truncate">{row.section_label || row.section_key}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", badgeCls)}>
              {pageLabel}
            </span>
            {!definition && (
              <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] text-orange-400 uppercase tracking-wider">
                raw
              </span>
            )}
          </div>
          <code className="text-[10px] text-muted-foreground/50">{row.section_key}</code>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {saved && <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="Saved" />}

          <button
            type="button"
            onClick={() => onChange(row.id, { is_visible: !row.is_visible })}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={row.is_visible ? "Hide block" : "Show block"}
            title={row.is_visible ? "Hide" : "Show"}
          >
            {row.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          {definition && (
            <button
              type="button"
              onClick={() => setRawMode((m) => !m)}
              className={cn("rounded-md p-1.5 transition-colors", rawMode ? "text-gold" : "text-muted-foreground hover:text-foreground")}
              aria-label="Toggle raw JSON mode"
              title="Toggle raw JSON"
            >
              <Code2 className="h-4 w-4" />
            </button>
          )}

          <Button onClick={save} variant="gold" size="sm" className="h-7 px-3 text-xs" disabled={saving} aria-label={`Save ${row.section_key}`}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Save className="h-3 w-3 mr-1" aria-hidden />Save</>}
          </Button>

          {expanded
            ? <ChevronUp  className="h-4 w-4 text-muted-foreground" aria-hidden />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
          }
        </div>
      </div>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className="border-t border-border/30 px-5 pb-5 pt-4">
          {rawMode || !definition ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Raw JSON — edit with care</span>
                {rawError && <span className="text-xs text-destructive" role="alert">{rawError}</span>}
              </div>
              <textarea
                aria-label="Raw JSON content"
                className={cn(
                  "w-full rounded-xl border bg-muted/30 p-3 font-mono text-xs leading-relaxed resize-y min-h-[200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  rawError ? "border-destructive/60" : "border-input"
                )}
                value={rawText}
                onChange={(e) => handleRawChange(e.target.value)}
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {definition.fields.map((field) => (
                <FieldEditor
                  key={field.key}
                  def={field}
                  value={(row.content as Record<string, unknown>)[field.key]}
                  onChange={(v) => handleFieldChange(field.key, v)}
                  sectionKey={row.section_key}
                  aiEnabled={aiEnabled}
                />
              ))}
            </div>
          )}

          {/* Admin label + timestamp */}
          <div className="mt-4 border-t border-border/30 pt-4 space-y-1.5">
            <label htmlFor={`lbl-${row.id}`} className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Display label (admin only)
            </label>
            <input
              id={`lbl-${row.id}`}
              value={row.section_label}
              onChange={(e) => onChange(row.id, { section_label: e.target.value })}
              className="w-full rounded-lg border border-input bg-muted/20 px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p className="text-[10px] text-muted-foreground">
              Last saved: {new Date(row.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
