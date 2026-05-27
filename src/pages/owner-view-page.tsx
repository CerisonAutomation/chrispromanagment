// @ts-nocheck
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, LogOut, Loader2, TrendingUp, Building2 } from 'lucide-react';

interface OwnerReport {
  id: string;
  property_id: string | null;
  period_start: string;
  period_end: string;
  gross_revenue: number;
  management_fee: number;
  net_payout: number;
  bookings_count: number;
  occupancy_rate: number;
  pdf_url: string | null;
}

interface OwnerInfo {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
}

export default function OwnerViewPage() {
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<OwnerInfo | null>(null);
  const [reports, setReports] = useState<OwnerReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No active session. Please use the link from your email.');
        setLoading(false);
        return;
      }

      // Find owner record by email
      const { data: ownerRow, error: ownerErr } = await supabase
        .from('owners')
        .select('id, full_name, email, company')
        .eq('email', user.email!)
        .maybeSingle();

      if (ownerErr || !ownerRow) {
        setError('No owner account found for this email. Please contact your property manager.');
        setLoading(false);
        return;
      }

      // Link user_id if not set yet
      if (!ownerRow.id) {
        setError('Owner record error. Please contact support.');
        setLoading(false);
        return;
      }

      await supabase
        .from('owners')
        .update({ user_id: user.id })
        .eq('email', user.email!)
        .is('user_id', null);

      setOwner(ownerRow);

      // Fetch reports
      const { data: reportRows } = await supabase
        .from('owner_reports')
        .select('*')
        .eq('owner_id', ownerRow.id)
        .order('period_start', { ascending: false });

      setReports(reportRows ?? []);
      setLoading(false);
    }

    init();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-[#F5F5F0] font-semibold mb-2">Access Error</h2>
          <p className="text-[#A1A1AA] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const totalGross = reports.reduce((s, r) => s + r.gross_revenue, 0);
  const totalNet = reports.reduce((s, r) => s + r.net_payout, 0);
  const avgOcc = reports.length ? reports.reduce((s, r) => s + r.occupancy_rate, 0) / reports.length : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0a0a0b]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A84C] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" fill="#0a0a0b" />
                <path d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" fill="#C9A84C" />
              </svg>
            </div>
            <div>
              <p className="text-[#F5F5F0] text-sm font-semibold">Owner Portal</p>
              <p className="text-[#71717A] text-xs">Christiano Property Management</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-[#71717A] hover:text-[#A1A1AA]">
            <LogOut className="w-4 h-4 mr-1" /> Sign out
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Welcome */}
        <div>
          <p className="text-[#C9A84C] text-xs uppercase tracking-[0.25em] mb-1">Welcome back</p>
          <h1 className="text-3xl font-['Playfair_Display'] text-[#F5F5F0]">{owner?.full_name}</h1>
          {owner?.company && <p className="text-[#71717A] text-sm mt-1">{owner.company}</p>}
        </div>

        {/* Summary stats */}
        {reports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 bg-[#161618] border-white/10">
              <p className="text-xs text-[#71717A] uppercase tracking-wider mb-1">Total Gross Revenue</p>
              <p className="text-2xl font-semibold text-[#C9A84C]">€{totalGross.toFixed(0)}</p>
            </Card>
            <Card className="p-5 bg-[#161618] border-white/10">
              <p className="text-xs text-[#71717A] uppercase tracking-wider mb-1">Total Net Payout</p>
              <p className="text-2xl font-semibold text-green-400">€{totalNet.toFixed(0)}</p>
            </Card>
            <Card className="p-5 bg-[#161618] border-white/10">
              <p className="text-xs text-[#71717A] uppercase tracking-wider mb-1">Avg Occupancy</p>
              <p className="text-2xl font-semibold text-[#F5F5F0]">{avgOcc.toFixed(1)}%</p>
            </Card>
          </div>
        )}

        {/* Reports list */}
        <div>
          <h2 className="text-[#F5F5F0] font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C9A84C]" />
            Your Reports
          </h2>

          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-lg">
              <Building2 className="w-10 h-10 text-[#71717A] mb-3" />
              <p className="text-[#A1A1AA] text-sm">No reports available yet</p>
              <p className="text-[#71717A] text-xs mt-1">Reports are generated monthly by your property manager</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(r => (
                <Card key={r.id} className="p-5 bg-[#161618] border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[#F5F5F0] font-medium">
                        {r.period_start} — {r.period_end}
                      </p>
                      {r.property_id && (
                        <p className="text-xs text-[#71717A] mt-0.5 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />{r.property_id}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <span className="text-[#A1A1AA]">Gross: <span className="text-[#C9A84C] font-medium">€{r.gross_revenue.toFixed(2)}</span></span>
                        <span className="text-[#A1A1AA]">Mgmt fee: <span className="text-[#F5F5F0]">€{r.management_fee.toFixed(2)}</span></span>
                        <span className="text-[#A1A1AA]">Net: <span className="text-green-400 font-medium">€{r.net_payout.toFixed(2)}</span></span>
                        <span className="text-[#A1A1AA]">{r.bookings_count} bookings</span>
                        <span className="text-[#A1A1AA]">{r.occupancy_rate.toFixed(1)}% occ.</span>
                      </div>
                    </div>
                    {r.pdf_url && (
                      <a href={r.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-white/10 text-[#A1A1AA] hover:text-[#F5F5F0]">
                          <FileText className="w-4 h-4 mr-1" />Download PDF
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
