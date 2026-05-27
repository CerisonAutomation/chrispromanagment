// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { History, Save, RotateCcw, Rocket, CheckCircle2, Loader2, Trash2 } from "lucide-react";

async function invokeVersion(action, body = {}) {
  const { data, error } = await supabase.functions.invoke("cms-version", {
    body: { action, ...body },
  });
  if (error) {
throw new Error(error.message || "Edge call failed");
}
  if (data?.error) {
throw new Error(data.error);
}
  return data;
}

function statusBadge(s) {
  const map = {
    published: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    baseline:  "bg-amber-500/15 text-amber-300 border-amber-500/30",
    draft:     "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
    autosave:  "bg-sky-500/15 text-sky-300 border-sky-500/30",
  };
  return `inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wide border ${map[s] || map.draft}`;
}

export default function VersionHistoryPanel() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(null);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { versions } = await invokeVersion("list");
      setVersions(versions || []);
    } catch (e) {
      toast.error(`Failed to load versions: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
 refresh(); 
}, [refresh]);

  const snapshot = async (status = "draft") => {
    setBusy("snapshot");
    try {
      await invokeVersion("snapshot", {
        label: label || (status === "baseline" ? "Frontend baseline" : "Snapshot"),
        note: note || null,
        status,
      });
      toast.success(status === "baseline" ? "Baseline saved" : "Snapshot saved");
      setLabel(""); setNote("");
      await refresh();
    } catch (e) {
 toast.error(e.message); 
} finally {
 setBusy(null); 
}
  };

  const publish = async (id) => {
    setBusy(id);
    try {
 await invokeVersion("publish", { id }); toast.success("Published"); await refresh(); 
} catch (e) {
 toast.error(e.message); 
} finally {
 setBusy(null); 
}
  };

  const revert = async (id, label) => {
    if (!confirm(`Revert the live site to "${label}"?\n\nA backup of the current state will be auto-saved first.`)) {
return;
}
    setBusy(id);
    try {
      await invokeVersion("revert", { id });
      toast.success("Reverted — refresh to see changes");
      await refresh();
    } catch (e) {
 toast.error(e.message); 
} finally {
 setBusy(null); 
}
  };

  return (
    <div className="bg-[#111318] border border-[#1a1a1e] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#C9A84C]" />
          <h3 className="text-sm font-semibold text-[#f0ede8]">Publish History & Version Control</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={refresh} disabled={loading}
          className="text-xs text-[#A1A1AA] hover:text-[#f0ede8]">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {/* Snapshot creator */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto_auto] gap-2 mb-5">
        <Input value={label} onChange={(e) => setLabel(e.target.value)}
          placeholder="Version label (e.g. 'Spring launch')"
          className="bg-[#0d0e12] border-[#1f1f24] text-[#f0ede8] text-sm" />
        <Input value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note for this snapshot"
          className="bg-[#0d0e12] border-[#1f1f24] text-[#f0ede8] text-sm" />
        <Button onClick={() => snapshot("draft")} disabled={busy === "snapshot"}
          className="bg-[#1a1a1e] border border-[#27272A] text-[#f0ede8] hover:bg-[#22232a] text-xs">
          <Save className="w-3 h-3 mr-1" /> Snapshot
        </Button>
        <Button onClick={() => snapshot("baseline")} disabled={busy === "snapshot"}
          className="bg-[#C9A84C] text-[#0F0F10] hover:bg-[#D4B85C] text-xs"
          title="Reset baseline to the current frontend state — useful as a recovery point.">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Set as Baseline
        </Button>
      </div>

      {/* Version list */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {!loading && versions.length === 0 && (
          <p className="text-xs text-[#5a5a5e] text-center py-8">
            No versions yet. Click <em>Set as Baseline</em> to snapshot the current frontend.
          </p>
        )}
        {versions.map((v) => (
          <div key={v.id} className="flex items-center justify-between gap-3 p-3 bg-[#0d0e12] border border-[#1a1a1e]">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-[#f0ede8] truncate">{v.label}</span>
                <span className={statusBadge(v.status)}>{v.status}</span>
              </div>
              <p className="text-[10px] text-[#5a5a5e] mt-1">
                {new Date(v.created_at).toLocaleString()} ·{" "}
                {v.content_count} blocks · {v.image_count} images · {v.setting_count} settings
                {v.note ? ` · ${v.note}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button size="sm" variant="ghost" onClick={() => publish(v.id)}
                disabled={busy === v.id || v.status === "published"}
                className="h-7 text-[10px] text-[#A1A1AA] hover:text-emerald-300">
                <Rocket className="w-3 h-3 mr-1" /> Publish
              </Button>
              <Button size="sm" variant="ghost" onClick={() => revert(v.id, v.label)}
                disabled={busy === v.id}
                className="h-7 text-[10px] text-[#A1A1AA] hover:text-amber-300">
                <RotateCcw className="w-3 h-3 mr-1" /> Revert
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
