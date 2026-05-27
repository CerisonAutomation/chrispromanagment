// @ts-nocheck
import { useEffect, useState } from 'react';
import { useMaintenanceStore } from '@/store';
import type { MaintenanceTicket, TicketStatus, TicketPriority } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, RefreshCw, Wrench, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'in-progress': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-white/5 text-[#71717A] border-white/10',
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: 'text-[#71717A]',
  medium: 'text-blue-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

const BLANK = {
  title: '',
  description: '',
  property_id: '',
  priority: 'medium' as TicketPriority,
  status: 'open' as TicketStatus,
};

export default function MaintenancePage() {
  const { tickets, loading, fetch, create, remove, resolve, setFilter, filter } = useMaintenanceStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch();
    const unsub = useMaintenanceStore.getState().subscribeRealtime();
    return unsub;
  }, [fetch]);

  const handleCreate = async () => {
    if (!form.title.trim()) {
 toast.error('Title is required'); return; 
}
    setSaving(true);
    try {
      await create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        property_id: form.property_id.trim() || undefined,
        priority: form.priority,
        status: 'open',
      });
      toast.success('Ticket created');
      setShowForm(false);
      setForm(BLANK);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async (t: MaintenanceTicket) => {
    try {
      await resolve(t.id);
      toast.success('Ticket resolved');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success('Ticket deleted');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#C9A84C]" />
            Maintenance
          </h1>
          <p className="text-sm text-[#71717A] mt-1">
            {tickets.length} tickets · {tickets.filter(t => t.status === 'open').length} open
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetch} disabled={loading} className="border-white/10 text-[#A1A1AA]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowForm(v => !v)} className="bg-[#C9A84C] text-[#0F0F10] hover:bg-[#D4B85C]">
            <Plus className="w-4 h-4 mr-2" />New Ticket
          </Button>
        </div>
      </div>

      {/* New ticket form */}
      {showForm && (
        <Card className="p-6 bg-[#161618] border-[#C9A84C]/30 space-y-4">
          <h2 className="text-[#F5F5F0] font-semibold">New Maintenance Ticket</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]" />
            <Input placeholder="Property ID (optional)" value={form.property_id}
              onChange={e => setForm(f => ({ ...f, property_id: e.target.value }))}
              className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]" />
          </div>
          <Textarea placeholder="Description" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0] h-20" />
          <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as TicketPriority }))}>
            <SelectTrigger className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0] w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => {
 setShowForm(false); setForm(BLANK); 
}} className="border-white/10">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-[#C9A84C] text-[#0F0F10] hover:bg-[#D4B85C]">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create Ticket'}
            </Button>
          </div>
        </Card>
      )}

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {(['', 'open', 'in-progress', 'resolved', 'closed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter({ status: s === '' ? null : s as TicketStatus })}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filter.status === (s || null)
                ? 'bg-[#C9A84C] text-[#0F0F10] border-[#C9A84C]'
                : 'border-white/10 text-[#A1A1AA] hover:border-white/20'
            }`}
          >
            {s === '' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {loading && !tickets.length ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-6 h-6 text-[#C9A84C] animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-lg">
          <Wrench className="w-10 h-10 text-[#71717A] mb-3" />
          <p className="text-[#A1A1AA] text-sm">No tickets — all systems operational</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <Card key={t.id} className={`p-5 bg-[#161618] border transition-all ${t.status === 'resolved' || t.status === 'closed' ? 'border-white/5 opacity-70' : 'border-white/10'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[t.status]}`}>
                      {t.status}
                    </span>
                    <span className={`text-xs font-medium flex items-center gap-1 ${PRIORITY_COLORS[t.priority]}`}>
                      {t.priority === 'urgent' && <AlertCircle className="w-3 h-3" />}
                      {t.priority}
                    </span>
                  </div>
                  <h3 className="text-[#F5F5F0] font-medium">{t.title}</h3>
                  {t.description && <p className="text-xs text-[#71717A] mt-1">{t.description}</p>}
                  <p className="text-xs text-[#71717A] mt-1">
                    {new Date(t.created_at).toLocaleDateString()}
                    {t.property_id && ` · ${t.property_id}`}
                    {t.cost != null && ` · €${t.cost}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {(t.status === 'open' || t.status === 'in-progress') && (
                    <Button variant="ghost" size="sm" onClick={() => handleResolve(t)} className="text-green-400 hover:text-green-300" title="Resolve">
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
