// @ts-nocheck
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ErrorEntry {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  changes: Record<string, unknown> | null;
  user_id: string | null;
  created_at: string;
  resolved?: boolean;
}

function severityFromAction(action: string): 'critical' | 'high' | 'medium' | 'low' {
  if (action.includes('critical') || action.includes('payment')) {
return 'critical';
}
  if (action.includes('error') || action.includes('failed') || action.includes('failure')) {
return 'high';
}
  if (action.includes('warn') || action.includes('timeout')) {
return 'medium';
}
  return 'low';
}

const SEVERITY_CONFIG = {
  critical: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', badge: 'destructive' as const },
  high: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', badge: 'destructive' as const },
  medium: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', badge: 'default' as const },
  low: { icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', badge: 'default' as const },
};

export default function ErrorDashboardPage() {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .or('action.ilike.%error%,action.ilike.%failed%,action.ilike.%failure%,action.ilike.%critical%,action.ilike.%warn%')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) {
throw error;
}
      setErrors((data as ErrorEntry[]) || []);
    } catch (e: unknown) {
      toast.error('Failed to load error log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
 fetchErrors(); 
}, []);

  const toggleResolve = (id: string) => {
    setResolved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const active = errors.filter(e => !resolved.has(e.id));
  const criticalCount = active.filter(e => severityFromAction(e.action) === 'critical').length;
  const highCount = active.filter(e => severityFromAction(e.action) === 'high').length;

  return (
    <div className="min-h-screen bg-[#0F0F10] p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-[#C9A84C]" />
            Error Dashboard
          </h1>
          <p className="text-sm text-[#71717A] mt-1">Live from audit log · {active.length} unresolved</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchErrors} disabled={loading} className="border-white/10 text-[#A1A1AA]">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5 bg-[#161618] border-white/10">
          <p className="text-xs text-[#71717A] uppercase tracking-widest mb-1">Critical</p>
          <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
        </Card>
        <Card className="p-5 bg-[#161618] border-white/10">
          <p className="text-xs text-[#71717A] uppercase tracking-widest mb-1">High</p>
          <p className="text-3xl font-bold text-orange-400">{highCount}</p>
        </Card>
        <Card className="p-5 bg-[#161618] border-white/10">
          <p className="text-xs text-[#71717A] uppercase tracking-widest mb-1">Total</p>
          <p className="text-3xl font-bold text-[#F5F5F0]">{active.length}</p>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-6 h-6 text-[#C9A84C] animate-spin" />
        </div>
      ) : errors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-lg">
          <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
          <p className="text-[#A1A1AA] text-sm">No error events in audit log</p>
        </div>
      ) : (
        <div className="space-y-2">
          {errors.map(err => {
            const sev = severityFromAction(err.action);
            const cfg = SEVERITY_CONFIG[sev];
            const isResolved = resolved.has(err.id);
            return (
              <Card key={err.id} className={`px-4 py-3 bg-[#161618] border flex items-start justify-between gap-4 transition-all ${isResolved ? 'opacity-50 border-white/5' : 'border-white/10'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <cfg.icon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
                    <Badge variant={cfg.badge} className="text-xs">{sev}</Badge>
                    {isResolved && <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">Resolved</Badge>}
                    <span className={`px-2 py-0.5 text-xs rounded border ${cfg.bg} ${cfg.color}`}>{err.action}</span>
                  </div>
                  {err.entity_type && (
                    <p className="text-xs text-[#A1A1AA]">
                      {err.entity_type}{err.entity_id ? ` · ${err.entity_id.slice(0, 12)}…` : ''}
                    </p>
                  )}
                  {err.changes && Object.keys(err.changes).length > 0 && (
                    <p className="text-xs text-[#71717A] font-mono truncate mt-0.5">
                      {JSON.stringify(err.changes).slice(0, 100)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-xs text-[#71717A]">{new Date(err.created_at).toLocaleString()}</p>
                  <Button variant="ghost" size="sm" onClick={() => toggleResolve(err.id)}
                    className={isResolved ? 'text-[#71717A]' : 'text-green-400 hover:text-green-300'}>
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
