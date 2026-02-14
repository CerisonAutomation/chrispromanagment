import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import type { CmsSetting } from "@/hooks/use-cms";
import type { Json } from "@/integrations/supabase/types";

interface Props {
  settings: CmsSetting[];
  isLoading: boolean;
  onSave: (key: string, value: Json) => Promise<void>;
  isSaving: boolean;
}

export default function SettingsEditor({ settings, isLoading, onSave, isSaving }: Props) {
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const vals: Record<string, string> = {};
    settings.forEach((s) => {
      vals[s.setting_key] = typeof s.setting_value === "string" ? s.setting_value : JSON.stringify(s.setting_value);
    });
    setEditValues(vals);
  }, [settings]);

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  const groups = Array.from(new Set(settings.map((s) => s.setting_group)));

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">Site Settings</h2>
      {groups.map((group) => (
        <div key={group} className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 capitalize">{group}</h3>
          <div className="space-y-4">
            {settings.filter((s) => s.setting_group === group).map((s) => (
              <div key={s.setting_key} className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{s.setting_label || s.setting_key}</label>
                  <input
                    type="text"
                    value={editValues[s.setting_key] || ""}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, [s.setting_key]: e.target.value }))}
                    className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={() => {
                    const val = editValues[s.setting_key] || "";
                    try {
                      onSave(s.setting_key, JSON.parse(val));
                    } catch {
                      onSave(s.setting_key, val);
                    }
                  }}
                  disabled={isSaving}
                  className="px-4 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-gold-light disabled:opacity-40 transition-colors"
                >
                  <Save size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
