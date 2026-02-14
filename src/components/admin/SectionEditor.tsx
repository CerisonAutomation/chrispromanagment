import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, Copy, Check, RotateCcw } from "lucide-react";
import type { CmsContent } from "@/hooks/use-cms";
import type { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

interface Props {
  sections: CmsContent[];
  activeSection: string;
  isLoading: boolean;
  onSave: (key: string, content: Json, isVisible?: boolean) => Promise<void>;
  isSaving: boolean;
}

export default function SectionEditor({ sections, activeSection, isLoading, onSave, isSaving }: Props) {
  const section = sections.find((s) => s.section_key === activeSection);
  const [jsonStr, setJsonStr] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [originalJson, setOriginalJson] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (section) {
      const str = JSON.stringify(section.content, null, 2);
      setJsonStr(str);
      setOriginalJson(str);
      setIsValid(true);
      setShowRaw(false);
    }
  }, [section]);

  const handleChange = (val: string) => {
    setJsonStr(val);
    try {
      JSON.parse(val);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  };

  const hasChanges = jsonStr !== originalJson;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setJsonStr(originalJson);
    setIsValid(true);
    toast({ title: "Reset", description: "Changes reverted" });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!section) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">Select a section from the sidebar to start editing.</p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">{section.section_label}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">Key: <code className="text-primary">{section.section_key}</code></span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">Updated {new Date(section.updated_at).toLocaleDateString()}</span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${section.is_visible ? "bg-green-500/10 text-green-500" : "bg-border text-muted-foreground"}`}>
              {section.is_visible ? "Visible" : "Hidden"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave(section.section_key, section.content as Json, !section.is_visible)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title={section.is_visible ? "Hide section" : "Show section"}
          >
            {section.is_visible ? <EyeOff size={14} /> : <Eye size={14} />}
            {section.is_visible ? "Hide" : "Show"}
          </button>
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
          <button
            onClick={() => {
              if (!isValid) return;
              onSave(section.section_key, JSON.parse(jsonStr));
            }}
            disabled={!isValid || isSaving || !hasChanges}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-gold-light disabled:opacity-40 transition-colors"
          >
            <Save size={14} /> {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="mb-4 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          You have unsaved changes
        </div>
      )}

      {/* Smart field editor */}
      {renderFieldEditors(section, jsonStr, setJsonStr, handleChange)}

      {/* Toggle raw JSON */}
      <div className="mt-8 border-t border-border pt-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showRaw ? "▼ Hide" : "▶ Show"} Raw JSON (advanced)
          </button>
          {showRaw && (
            <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        {showRaw && (
          <textarea
            value={jsonStr}
            onChange={(e) => handleChange(e.target.value)}
            rows={Math.min(20, Math.max(8, jsonStr.split("\n").length + 2))}
            className={`w-full px-4 py-3 text-xs font-mono bg-secondary border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
              isValid ? "border-border focus:border-primary" : "border-destructive"
            }`}
          />
        )}
        {showRaw && !isValid && <p className="text-xs text-destructive mt-1">Invalid JSON — fix errors before saving</p>}
      </div>
    </div>
  );
}

function renderFieldEditors(
  section: CmsContent,
  jsonStr: string,
  _setJsonStr: (s: string) => void,
  handleChange: (s: string) => void
) {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;

  const updateField = (key: string, value: unknown) => {
    const updated = { ...parsed, [key]: value };
    handleChange(JSON.stringify(updated, null, 2));
  };

  const fields = Object.entries(parsed);
  if (fields.length === 0) {
    return (
      <div className="glass-surface rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground">This section has no content fields yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Use the raw JSON editor below to add content.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {fields.map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, " $1").replace(/_/g, " ");

        if (typeof value === "string") {
          const isLong = value.length > 80;
          return (
            <div key={key} className="glass-surface rounded-lg p-4">
              <label className="text-xs font-medium text-muted-foreground mb-2 block capitalize">{label}</label>
              {isLong ? (
                <textarea
                  value={value}
                  onChange={(e) => updateField(key, e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary resize-y"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                />
              )}
            </div>
          );
        }

        if (typeof value === "boolean") {
          return (
            <div key={key} className="glass-surface rounded-lg p-4 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground capitalize">{label}</label>
              <button
                onClick={() => updateField(key, !value)}
                className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-border"}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-foreground transition-transform ${value ? "left-6" : "left-1"}`} />
              </button>
            </div>
          );
        }

        if (typeof value === "number") {
          return (
            <div key={key} className="glass-surface rounded-lg p-4">
              <label className="text-xs font-medium text-muted-foreground mb-2 block capitalize">{label}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => updateField(key, Number(e.target.value))}
                className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          );
        }

        if (Array.isArray(value)) {
          return (
            <div key={key} className="glass-surface rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-muted-foreground capitalize">{label}</label>
                <span className="text-xs text-primary">{value.length} items</span>
              </div>
              <div className="space-y-2">
                {(value as unknown[]).map((item, i) => (
                  <div key={i} className="p-3 bg-secondary/50 rounded-lg space-y-2">
                    <span className="text-[0.65rem] text-muted-foreground uppercase">Item {i + 1}</span>
                    {typeof item === "object" && item !== null ? (
                      Object.entries(item as Record<string, unknown>).map(([subKey, subVal]) => (
                        <div key={subKey} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-24 shrink-0 capitalize">{subKey}:</span>
                          <input
                            type="text"
                            value={String(subVal)}
                            onChange={(e) => {
                              const newArr = [...value] as Record<string, unknown>[];
                              newArr[i] = { ...(item as Record<string, unknown>), [subKey]: e.target.value };
                              updateField(key, newArr);
                            }}
                            className="flex-1 px-3 py-1.5 text-sm bg-secondary border border-border rounded text-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                      ))
                    ) : (
                      <input
                        type="text"
                        value={String(item)}
                        onChange={(e) => {
                          const newArr = [...value];
                          newArr[i] = e.target.value;
                          updateField(key, newArr);
                        }}
                        className="w-full px-3 py-1.5 text-sm bg-secondary border border-border rounded text-foreground focus:outline-none focus:border-primary"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
