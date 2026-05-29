import { useEffect, useState } from "react";
import { Clock, RotateCcw, Camera, Loader2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CmsCommandRepository, CmsQueryRepository } from "@/lib/cms-repository";
import type { CmsVersion } from "@/lib/cms-types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VersionPanelProps {
  userId: string | undefined;
  onRestored: () => void;
  onClose: () => void;
}

export function VersionPanel({ userId, onRestored, onClose }: VersionPanelProps) {
  const [versions,  setVersions]  = useState<CmsVersion[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [label,     setLabel]     = useState("");
  const [note,      setNote]      = useState("");

  // Fixed: useEffect (not useState) for initial load
  useEffect(() => {
    CmsQueryRepository.fetchVersions(25).then((r) => {
      setLoading(false);
      if (r.ok) setVersions(r.data);
      else toast.error(r.error);
    });
  }, []);

  const reload = async () => {
    setLoading(true);
    const r = await CmsQueryRepository.fetchVersions(25);
    setLoading(false);
    if (r.ok) setVersions(r.data);
    else toast.error(r.error);
  };

  const createSnapshot = async () => {
    setCreating(true);
    const r = await CmsCommandRepository.createSnapshot(label, note, userId);
    setCreating(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Snapshot saved");
    setLabel(""); setNote("");
    await reload();
  };

  const restore = async (id: string) => {
    setRestoring(id);
    const r = await CmsCommandRepository.restoreSnapshot(id);
    setRestoring(null);
    setConfirmId(null);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(`Restored ${r.data} blocks`);
    onRestored();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gold" />
          <span className="font-display font-medium">Version History</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close version panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Snapshot creator */}
      <div className="shrink-0 border-b border-border/30 p-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Save current state</p>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional)" className="h-8 text-xs" />
        <Input value={note}  onChange={(e) => setNote(e.target.value)}  placeholder="Note (optional)"  className="h-8 text-xs" />
        <Button onClick={createSnapshot} variant="gold" size="sm" className="w-full h-8 text-xs" disabled={creating}>
          {creating ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Camera className="h-3 w-3 mr-1.5" />}
          Take Snapshot
        </Button>
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gold" />
          </div>
        )}
        {!loading && versions.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">No snapshots yet.</p>
        )}
        {versions.map((v) => (
          <div key={v.id} className="rounded-xl border border-border/40 bg-card/30 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{v.label}</div>
                {v.note && <div className="text-xs text-muted-foreground truncate">{v.note}</div>}
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{new Date(v.created_at).toLocaleString()}</span>
                  <span>·</span>
                  <span>{v.content_count} blocks</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmId(v.id)}
                disabled={!!restoring}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors disabled:opacity-40"
                aria-label={`Restore snapshot: ${v.label}`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {confirmId === v.id && (
              <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-2">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  This will overwrite all current content
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => restore(v.id)}
                    size="sm"
                    className="h-6 flex-1 text-[10px] bg-amber-500 hover:bg-amber-400 text-black border-0"
                    disabled={restoring === v.id}
                  >
                    {restoring === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Restore"}
                  </Button>
                  <Button onClick={() => setConfirmId(null)} size="sm" variant="ghost" className="h-6 text-[10px]">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
