import { useState } from "react";
import { Plus, Trash2, Sparkles, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldDef } from "@/lib/cms-types";
import { CmsCommandRepository } from "@/lib/cms-repository";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FieldEditorProps {
  sectionKey: string;
  def: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  /** Whether the AI enhance button is shown */
  aiEnabled?: boolean;
}

// ─── AI enhance button ────────────────────────────────────────────────────────
function AIEnhanceButton({
  sectionKey, fieldKey, current, onResult,
}: { sectionKey: string; fieldKey: string; current: string; onResult: (v: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [open, setOpen] = useState(false);

  const run = async () => {
    if (!instruction.trim()) return;
    setLoading(true);
    const r = await CmsCommandRepository.aiEnhanceField(sectionKey, fieldKey, current, instruction);
    setLoading(false);
    if (!r.ok) { toast.error(r.error); return; }
    onResult(r.data);
    setOpen(false);
    setInstruction("");
    toast.success("AI suggestion applied");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-gold/70 hover:text-gold hover:bg-gold/10 transition-colors"
        title="AI enhance this field"
      >
        <Sparkles className="h-3 w-3" /> AI
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-72 rounded-xl border border-border/60 bg-card p-3 shadow-elegant">
          <p className="mb-2 text-xs text-muted-foreground">Instruction for AI</p>
          <Input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Make it more compelling…"
            className="mb-2 h-8 text-xs"
            onKeyDown={(e) => e.key === "Enter" && run()}
          />
          <div className="flex gap-2">
            <Button onClick={run} size="sm" variant="gold" className="h-7 text-xs flex-1" disabled={loading || !instruction.trim()}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
            </Button>
            <Button onClick={() => setOpen(false)} size="sm" variant="ghost" className="h-7 text-xs">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Single text / textarea / url / image_url ─────────────────────────────────
function ScalarField({ def, value, onChange, sectionKey, aiEnabled }: FieldEditorProps) {
  const strVal = typeof value === "string" ? value : "";
  const isTextarea = def.type === "textarea" || def.type === "richtext";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{def.label}</Label>
        {aiEnabled && ["text", "textarea", "richtext"].includes(def.type) && (
          <AIEnhanceButton sectionKey={sectionKey} fieldKey={def.key} current={strVal} onResult={(v) => onChange(v)} />
        )}
      </div>
      {isTextarea ? (
        <textarea
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.placeholder}
          rows={4}
          className="w-full rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[80px]"
        />
      ) : (
        <Input
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.placeholder}
          type={def.type === "number" ? "number" : def.type === "url" || def.type === "image_url" ? "url" : "text"}
          className="h-9 text-sm"
        />
      )}
      {def.type === "image_url" && strVal && (
        <div className="mt-1.5 overflow-hidden rounded-md border border-border/40">
          <img src={strVal} alt="" className="h-24 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      )}
      {def.hint && <p className="text-[10px] text-muted-foreground">{def.hint}</p>}
    </div>
  );
}

// ─── Boolean toggle ────────────────────────────────────────────────────────────
function BoolField({ def, value, onChange }: FieldEditorProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-input bg-muted/20 px-3 py-2.5">
      <Label className="text-sm">{def.label}</Label>
      <button
        type="button"
        role="switch"
        aria-checked={!!value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          value ? "bg-gold" : "bg-muted"
        )}
      >
        <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform", value ? "translate-x-4.5" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

// ─── Array of strings ─────────────────────────────────────────────────────────
function ArrayTextField({ def, value, onChange }: FieldEditorProps) {
  const items: string[] = Array.isArray(value) ? (value as string[]) : [];
  const update = (idx: number, v: string) => {
    const next = [...items]; next[idx] = v; onChange(next);
  };
  const add = () => onChange([...items, ""]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{def.label}</Label>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            <Input value={item} onChange={(e) => update(idx, e.target.value)} className="h-8 text-sm flex-1" placeholder={`Item ${idx + 1}`} />
            <button type="button" onClick={() => remove(idx)} className="rounded-md p-1 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button type="button" onClick={add} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Plus className="h-3 w-3" /> Add item
        </button>
      </div>
    </div>
  );
}

// ─── Array of objects ─────────────────────────────────────────────────────────
function ArrayObjectField({ def, value, onChange, sectionKey, aiEnabled }: FieldEditorProps) {
  const items: Record<string, unknown>[] = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const subFields = def.itemFields ?? [];

  const updateItem = (idx: number, fieldKey: string, v: unknown) => {
    const next = items.map((item, i) => i === idx ? { ...item, [fieldKey]: v } : item);
    onChange(next);
  };
  const add = () => {
    const blank: Record<string, unknown> = {};
    subFields.forEach((f) => { blank[f.key] = ""; });
    onChange([...items, blank]);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{def.label}</Label>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">#{idx + 1}</span>
              <button type="button" onClick={() => remove(idx)} className="rounded-md p-1 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2.5">
              {subFields.map((sf) => (
                <FieldEditor
                  key={sf.key}
                  def={sf}
                  value={item[sf.key]}
                  onChange={(v) => updateItem(idx, sf.key, v)}
                  sectionKey={sectionKey}
                  aiEnabled={aiEnabled}
                />
              ))}
            </div>
          </div>
        ))}
        <button type="button" onClick={add} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Plus className="h-3 w-3" /> Add {def.label.replace(/s$/, "").toLowerCase()}
        </button>
      </div>
    </div>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────
export function FieldEditor(props: FieldEditorProps) {
  const { def } = props;
  if (def.type === "boolean")      return <BoolField {...props} />;
  if (def.type === "array_text")   return <ArrayTextField {...props} />;
  if (def.type === "array_object") return <ArrayObjectField {...props} />;
  return <ScalarField {...props} />;
}
