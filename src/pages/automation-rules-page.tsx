import { useEffect, useState } from 'react';
import { useAutomationStore } from '@/store';
import type { AutomationRule, AutomationTrigger, AutomationAction } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Play, Power, RefreshCw, Zap } from 'lucide-react';

const TRIGGERS: { value: AutomationTrigger; label: string }[] = [
  { value: 'booking_created', label: 'Booking Created' },
  { value: 'booking_cancelled', label: 'Booking Cancelled' },
  { value: 'checkin', label: 'Guest Check-in' },
  { value: 'checkout', label: 'Guest Check-out' },
  { value: 'review_received', label: 'Review Received' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'maintenance_created', label: 'Maintenance Ticket Created' },
  { value: 'message_received', label: 'Message Received' },
];

const ACTIONS: { value: AutomationAction; label: string }[] = [
  { value: 'send_email', label: 'Send Email' },
  { value: 'send_sms', label: 'Send SMS' },
  { value: 'create_task', label: 'Create Task' },
  { value: 'notify_owner', label: 'Notify Owner' },
  { value: 'update_channel', label: 'Update Channel Manager' },
  { value: 'webhook', label: 'Webhook' },
];

const BLANK: Omit<AutomationRule, 'id' | 'created_at' | 'run_count' | 'last_run_at'> = {
  name: '',
  description: '',
  trigger: 'booking_created',
  action: 'send_email',
  action_config: {},
  is_active: true,
};

export default function AutomationRulesPage() {
  const { rules, loading, fetch, create, remove, toggle, trigger } = useAutomationStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [configText, setConfigText] = useState('{}');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    let action_config: Record<string, unknown> = {};
    try { action_config = JSON.parse(configText); } catch { toast.error('Invalid JSON in config'); return; }
    setSaving(true);
    try {
      await create({ ...form, action_config });
      toast.success('Rule created');
      setShowForm(false);
      setForm(BLANK);
      setConfigText('{}');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: AutomationRule) => {
    try {
      await toggle(rule.id, !rule.is_active);
      toast.success(rule.is_active ? 'Rule disabled' : 'Rule enabled');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success('Rule deleted');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  const handleRun = async (id: string) => {
    try {
      await trigger(id);
      toast.success('Rule triggered');
    } catch {
      toast.error('Trigger failed — edge function may not be deployed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#D4AF37]" />
            Automation Rules
          </h1>
          <p className="text-sm text-[#71717A] mt-1">
            {rules.length} rules · {rules.filter(r => r.is_active).length} active
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetch} disabled={loading} className="border-white/10 text-[#A1A1AA]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowForm(v => !v)} className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]">
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="p-6 bg-[#161618] border-[#D4AF37]/30 space-y-4">
          <h2 className="text-[#F5F5F0] font-semibold">New Automation Rule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Rule name *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]"
            />
            <Input
              placeholder="Description (optional)"
              value={form.description ?? ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]"
            />
            <Select value={form.trigger} onValueChange={v => setForm(f => ({ ...f, trigger: v as AutomationTrigger }))}>
              <SelectTrigger className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]"><SelectValue placeholder="When..." /></SelectTrigger>
              <SelectContent>{TRIGGERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.action} onValueChange={v => setForm(f => ({ ...f, action: v as AutomationAction }))}>
              <SelectTrigger className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]"><SelectValue placeholder="Then..." /></SelectTrigger>
              <SelectContent>{ACTIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder='Action config JSON e.g. {"template":"welcome","delay_minutes":0}'
            value={configText}
            onChange={e => setConfigText(e.target.value)}
            className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0] font-mono text-xs h-20"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setShowForm(false); setForm(BLANK); setConfigText('{}'); }} className="border-white/10">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create Rule'}
            </Button>
          </div>
        </Card>
      )}

      {loading && !rules.length ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-6 h-6 text-[#D4AF37] animate-spin" />
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-lg">
          <Zap className="w-10 h-10 text-[#71717A] mb-3" />
          <p className="text-[#A1A1AA] text-sm">No automation rules yet — create one above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => {
            const triggerLabel = TRIGGERS.find(t => t.value === rule.trigger)?.label ?? rule.trigger;
            const actionLabel = ACTIONS.find(a => a.value === rule.action)?.label ?? rule.action;
            return (
              <Card key={rule.id} className={`p-5 bg-[#161618] border transition-all ${rule.is_active ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${rule.is_active ? 'bg-green-400' : 'bg-[#71717A]'}`} />
                      <h3 className="text-[#F5F5F0] font-medium truncate">{rule.name}</h3>
                    </div>
                    {rule.description && (
                      <p className="text-xs text-[#71717A] mb-2 truncate">{rule.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                        When: {triggerLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[#A1A1AA] border border-white/10">
                        Then: {actionLabel}
                      </span>
                      {(rule.run_count ?? 0) > 0 && (
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[#71717A]">
                          Ran {rule.run_count}×
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleRun(rule.id)} className="text-[#A1A1AA] hover:text-[#D4AF37]" title="Run now">
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleToggle(rule)}
                      className={rule.is_active ? 'text-green-400 hover:text-green-300' : 'text-[#71717A] hover:text-[#A1A1AA]'}
                      title={rule.is_active ? 'Disable' : 'Enable'}
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)} className="text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
