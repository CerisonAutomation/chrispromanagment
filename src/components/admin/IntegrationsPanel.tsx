import { useState } from "react";
import { Save, ExternalLink, Check, AlertCircle } from "lucide-react";
import type { CmsSetting } from "@/hooks/use-cms";
import type { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

interface Props {
  settings: CmsSetting[];
  onSaveSetting: (key: string, value: Json) => Promise<void>;
}

export default function IntegrationsPanel({ settings, onSaveSetting }: Props) {
  const sheetsId = settings.find((s) => s.setting_key === "google_sheets_id");
  const zapierUrl = settings.find((s) => s.setting_key === "zapier_webhook_url");

  const [sheetsVal, setSheetsVal] = useState(typeof sheetsId?.setting_value === "string" ? sheetsId.setting_value : "");
  const [zapierVal, setZapierVal] = useState(typeof zapierUrl?.setting_value === "string" ? zapierUrl.setting_value : "");
  const [testingZapier, setTestingZapier] = useState(false);
  const { toast } = useToast();

  const testZapier = async () => {
    if (!zapierVal) return;
    setTestingZapier(true);
    try {
      await fetch(zapierVal, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: "cms_admin",
        }),
      });
      toast({ title: "Request sent", description: "Check your Zap history to confirm it was triggered." });
    } catch {
      toast({ title: "Error", description: "Failed to reach webhook", variant: "destructive" });
    } finally {
      setTestingZapier(false);
    }
  };

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">Integrations</h2>

      {/* Google Sheets */}
      <div className="glass-surface rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <span className="text-lg">📊</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Google Sheets Sync</h3>
            <p className="text-xs text-muted-foreground">Two-way content sync with a Google Sheet</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Google Sheet ID</label>
            <input
              type="text"
              value={sheetsVal}
              onChange={(e) => setSheetsVal(e.target.value)}
              placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSaveSetting("google_sheets_id", sheetsVal)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-gold-light transition-colors"
            >
              <Save size={14} /> Save
            </button>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Setup:</strong> Create a Google Sheet with columns matching your section keys. 
              Use the CMS webhook endpoint to sync changes automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Zapier */}
      <div className="glass-surface rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Zapier Automation</h3>
            <p className="text-xs text-muted-foreground">Trigger Zaps when content changes or leads come in</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Zapier Webhook URL</label>
            <input
              type="url"
              value={zapierVal}
              onChange={(e) => setZapierVal(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="w-full px-4 py-3 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSaveSetting("zapier_webhook_url", zapierVal)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-gold-light transition-colors"
            >
              <Save size={14} /> Save
            </button>
            <button
              onClick={testZapier}
              disabled={!zapierVal || testingZapier}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              {testingZapier ? "Testing..." : "Test Webhook"}
            </button>
          </div>
        </div>
      </div>

      {/* API Webhook Info */}
      <div className="glass-surface rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <span className="text-lg">🔗</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">CMS Webhook API</h3>
            <p className="text-xs text-muted-foreground">Update content programmatically via API</p>
          </div>
        </div>
        <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
          <p className="text-xs text-muted-foreground">
            <strong>Endpoint:</strong>{" "}
            <code className="px-1.5 py-0.5 bg-background rounded text-primary text-[0.7rem]">
              POST /functions/v1/cms-webhook
            </code>
          </p>
          <p className="text-xs text-muted-foreground">
            Send a JSON body with <code className="text-primary">action</code>, <code className="text-primary">section_key</code>, and <code className="text-primary">content</code> to update any section.
          </p>
        </div>
      </div>
    </div>
  );
}
