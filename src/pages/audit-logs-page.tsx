// @ts-nocheck
import { useEffect } from 'react';
import { useAuditStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Shield, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const PAGE_SIZE = 50;

export default function AuditLogsPage() {
  const { logs, total, loading, error, filter, page, fetch, setFilter, clearFilter } = useAuditStore();

  useEffect(() => {
 fetch(1); 
}, [fetch]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const exportCSV = () => {
    const header = ['Time', 'Action', 'Entity Type', 'Entity ID', 'User ID'];
    const rows = logs.map(l => [
      new Date(l.created_at).toISOString(),
      l.action,
      l.entity_type ?? '',
      l.entity_id ?? '',
      l.user_id ?? '',
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#C9A84C]" />
            Audit Logs
          </h1>
          <p className="text-sm text-[#71717A] mt-1">{total.toLocaleString()} events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetch(page)} disabled={loading} className="border-white/10 text-[#A1A1AA]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!logs.length} className="border-white/10 text-[#A1A1AA]">
            <Download className="w-4 h-4 mr-2" />CSV
          </Button>
          <Button variant="outline" size="sm" onClick={clearFilter} className="border-white/10 text-[#A1A1AA]">
            Clear
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          type="date"
          value={filter.dateFrom ?? ''}
          onChange={e => setFilter({ dateFrom: e.target.value || undefined })}
          className="bg-[#161618] border-white/10 text-[#F5F5F0] w-40"
        />
        <Input
          type="date"
          value={filter.dateTo ?? ''}
          onChange={e => setFilter({ dateTo: e.target.value || undefined })}
          className="bg-[#161618] border-white/10 text-[#F5F5F0] w-40"
        />
        <Input
          placeholder="Filter by action…"
          value={filter.action ?? ''}
          onChange={e => setFilter({ action: e.target.value || undefined })}
          className="bg-[#161618] border-white/10 text-[#F5F5F0] w-48"
        />
        <Input
          placeholder="Entity type…"
          value={filter.entityType ?? ''}
          onChange={e => setFilter({ entityType: e.target.value || undefined })}
          className="bg-[#161618] border-white/10 text-[#F5F5F0] w-40"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      {loading && !logs.length ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-6 h-6 text-[#C9A84C] animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-lg">
          <Shield className="w-10 h-10 text-[#71717A] mb-3" />
          <p className="text-[#A1A1AA] text-sm">No audit events found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <Card key={log.id} className="px-4 py-3 bg-[#161618] border-white/10 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 text-xs bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 rounded">
                    {log.action}
                  </span>
                  {log.entity_type && (
                    <span className="text-xs text-[#A1A1AA] bg-white/5 px-2 py-0.5 rounded">
                      {log.entity_type}
                      {log.entity_id && ` · ${log.entity_id.slice(0, 8)}…`}
                    </span>
                  )}
                </div>
                {log.changes && Object.keys(log.changes).length > 0 && (
                  <p className="text-xs text-[#71717A] mt-1 font-mono truncate">
                    {JSON.stringify(log.changes).slice(0, 120)}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-[#A1A1AA]">{new Date(log.created_at).toLocaleString()}</p>
                {log.user_id && (
                  <p className="text-xs text-[#71717A] font-mono mt-0.5">{log.user_id.slice(0, 8)}…</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetch(page - 1)} disabled={page <= 1 || loading}
            className="border-white/10 text-[#A1A1AA]">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-[#A1A1AA]">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => fetch(page + 1)} disabled={page >= totalPages || loading}
            className="border-white/10 text-[#A1A1AA]">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
