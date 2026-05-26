import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCacheStats, clearAllCaches, invalidateCache } from "@/lib/perf";
import { useGuestyTokenStatus } from "@/hooks/use-guesty";
import { Trash2, RefreshCw, Database } from "lucide-react";

const POLL_MS = 1500;

/**
 * Admin debug panel — surfaces:
 *   • Live cache hit/miss/hit-rate per cache (pages / blocks / bookings)
 *   • Clear all caches + clear individual caches
 *   • Guesty OAuth token vault status (expiry, last refresh, refresh count)
 */
export default function CacheDebugPanel() {
  const [stats, setStats] = useState(getCacheStats());
  const { status: rawStatus, loading, refresh } = useGuestyTokenStatus();
  const status: any = rawStatus;

  useEffect(() => {
    const id = setInterval(() => setStats(getCacheStats()), POLL_MS);
    return () => clearInterval(id);
  }, []);

  const fmtRate = (r) => `${(r * 100).toFixed(1)}%`;
  const fmtSecs = (s) => {
    if (s == null) return "—";
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> Cache stats (live)
          </CardTitle>
          <Button variant="destructive" size="sm" onClick={() => { clearAllCaches(); setStats(getCacheStats()); }}>
            <Trash2 className="h-4 w-4 mr-1" /> Clear all
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(stats).map(([name, s]: [string, any]) => (
              <div key={name} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium capitalize">{name}</div>
                  <Badge variant="outline" className="">{s.size} keys</Badge>

                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Hits: <span className="font-mono text-foreground">{s.hits}</span></div>
                  <div>Misses: <span className="font-mono text-foreground">{s.misses}</span></div>
                  <div>Hit rate: <span className="font-mono text-foreground">{fmtRate(s.hitRate)}</span></div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => { invalidateCache(name); setStats(getCacheStats()); }}
                >
                  Clear {name}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Guesty token vault</CardTitle>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {!status ? (
            <div className="text-sm text-muted-foreground">Loading token status…</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Stat label="Has token" value={status.has_token ? "Yes" : "No"} ok={status.has_token} />
              <Stat label="Expires in" value={fmtSecs(status.seconds_until_expiry)} />
              <Stat label="Last refresh" value={status.last_refreshed_at ? new Date(status.last_refreshed_at).toLocaleString() : "—"} />
              <Stat label="Refresh count" value={status.refresh_count ?? 0} />
              <Stat label="Memory cached" value={status.memory_cached ? "Yes" : "No"} />
              <Stat label="Scope" value={status.scope ?? "—"} />
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Token is refreshed automatically every 6 hours via pg_cron → <code>guesty-token-refresh</code>.
            Edge functions also lazily refresh if &lt;5 min remain.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, ok }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-medium mt-1 ${ok === false ? "text-destructive" : ""}`}>{String(value)}</div>
    </div>
  );
}
