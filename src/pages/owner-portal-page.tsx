import { useEffect, useState } from 'react';
import { useOwnersStore } from '@/store';
import type { Owner } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Users, Plus, RefreshCw, Trash2, FileText, Mail, Phone } from 'lucide-react';

const BLANK: Omit<Owner, 'id' | 'created_at'> = {
  full_name: '',
  email: '',
  phone: '',
  company: '',
};

export default function OwnerPortalPage() {
  const { owners, reports, loading, fetch, fetchReports, create, remove, select, selected } = useOwnersStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch();
    fetchReports();
  }, [fetch, fetchReports]);

  const handleCreate = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      await create({ ...form, full_name: form.full_name.trim(), email: form.email.trim() });
      toast.success('Owner added');
      setShowForm(false);
      setForm(BLANK);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success('Owner removed');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  const ownerReports = selected ? reports.filter(r => r.owner_id === selected.id) : reports;

  return (
    <div className="min-h-screen bg-[#0F0F10] p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#D4AF37]" />
            Owner Portal
          </h1>
          <p className="text-sm text-[#71717A] mt-1">{owners.length} owners</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetch} disabled={loading} className="border-white/10 text-[#A1A1AA]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowForm(v => !v)} className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]">
            <Plus className="w-4 h-4 mr-2" />Add Owner
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="p-6 bg-[#161618] border-[#D4AF37]/30 space-y-4">
          <h2 className="text-[#F5F5F0] font-semibold">New Owner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Full name *" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]" />
            <Input placeholder="Email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]" />
            <Input placeholder="Phone" value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]" />
            <Input placeholder="Company" value={form.company ?? ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setShowForm(false); setForm(BLANK); }} className="border-white/10">Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Add Owner'}
            </Button>
          </div>
        </Card>
      )}

      <Tabs defaultValue="owners">
        <TabsList className="bg-[#161618] border border-white/10 rounded-none p-1 h-auto">
          {['owners', 'reports'].map(t => (
            <TabsTrigger key={t} value={t}
              className="rounded-none capitalize text-xs uppercase tracking-wider data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0F0F10] text-[#A1A1AA] px-5 py-2">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="owners" className="mt-4">
          {loading && !owners.length ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="w-6 h-6 text-[#D4AF37] animate-spin" />
            </div>
          ) : owners.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-lg">
              <Users className="w-10 h-10 text-[#71717A] mb-3" />
              <p className="text-[#A1A1AA] text-sm">No owners yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {owners.map(o => (
                <Card
                  key={o.id}
                  className={`p-4 bg-[#161618] border cursor-pointer transition-all ${selected?.id === o.id ? 'border-[#D4AF37]/40' : 'border-white/10 hover:border-white/20'}`}
                  onClick={() => { select(selected?.id === o.id ? null : o); if (selected?.id !== o.id) fetchReports(o.id); }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[#F5F5F0] font-medium">{o.full_name}</h3>
                      {o.company && <p className="text-xs text-[#71717A]">{o.company}</p>}
                      <div className="flex gap-3 mt-1 text-xs text-[#A1A1AA]">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{o.email}</span>
                        {o.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{o.phone}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleDelete(o.id); }}
                      className="text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          {selected && (
            <p className="text-xs text-[#D4AF37] mb-3">Showing reports for {selected.full_name}</p>
          )}
          {ownerReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-lg">
              <FileText className="w-10 h-10 text-[#71717A] mb-3" />
              <p className="text-[#A1A1AA] text-sm">No reports generated yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ownerReports.map(r => (
                <Card key={r.id} className="p-4 bg-[#161618] border-white/10">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[#F5F5F0] font-medium text-sm">
                        {r.period_start} — {r.period_end}
                      </p>
                      <div className="flex gap-4 mt-1 text-xs text-[#A1A1AA]">
                        <span>Gross: <span className="text-[#D4AF37]">€{r.gross_revenue.toFixed(2)}</span></span>
                        <span>Fee: €{r.management_fee.toFixed(2)}</span>
                        <span>Net: <span className="text-green-400">€{r.net_payout.toFixed(2)}</span></span>
                        <span>{r.bookings_count} bookings</span>
                        <span>{r.occupancy_rate.toFixed(1)}% occ.</span>
                      </div>
                    </div>
                    {r.pdf_url && (
                      <a href={r.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-white/10 text-[#A1A1AA]">
                          <FileText className="w-4 h-4 mr-1" />PDF
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
