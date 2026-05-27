import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Download, FileText, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface TaxReport {
  totalRevenue: number;
  vatAmount: number;
  netIncome: number;
  bookings: number;
  averageStay: number;
  byProperty: { title: string; revenue: number; bookings: number }[];
  byMonth: { month: string; revenue: number }[];
}

const VAT_RATE = 0.15;
const YEARS = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

export default function TaxReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [report, setReport] = useState<TaxReport | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { data: reservations, error } = await supabase
        .from('reservations_cache')
        .select('total_price, check_in, check_out, listing_id, status')
        .gte('check_in', startDate)
        .lte('check_in', endDate)
        .eq('status', 'confirmed');

      if (error) {
throw error;
}

      const rows = reservations || [];

      const totalRevenue = rows.reduce((s, r) => s + (r.total_price || 0), 0);
      const totalNights = rows.reduce((s, r) => {
        if (!r.check_in || !r.check_out) {
return s;
}
        const nights = Math.round((new Date(r.check_out).getTime() - new Date(r.check_in).getTime()) / 86400000);
        return s + nights;
      }, 0);

      // By month
      const monthMap = new Map<string, number>();
      rows.forEach(r => {
        if (!r.check_in) {
return;
}
        const month = r.check_in.slice(0, 7);
        monthMap.set(month, (monthMap.get(month) || 0) + (r.total_price || 0));
      });
      const byMonth = Array.from(monthMap.entries())
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // By property — join with guesty_properties_cache
      const listingIds = [...new Set(rows.map(r => r.listing_id).filter(Boolean))];
      const propTitles: Record<string, string> = {};
      if (listingIds.length) {
        const { data: props } = await supabase
          .from('guesty_properties_cache')
          .select('guesty_id, title')
          .in('guesty_id', listingIds as string[]);
        props?.forEach(p => {
 propTitles[p.guesty_id] = p.title || p.guesty_id; 
});
      }
      const propMap = new Map<string, { revenue: number; bookings: number }>();
      rows.forEach(r => {
        if (!r.listing_id) {
return;
}
        const cur = propMap.get(r.listing_id) || { revenue: 0, bookings: 0 };
        propMap.set(r.listing_id, { revenue: cur.revenue + (r.total_price || 0), bookings: cur.bookings + 1 });
      });
      const byProperty = Array.from(propMap.entries())
        .map(([id, v]) => ({ title: propTitles[id] || id, ...v }))
        .sort((a, b) => b.revenue - a.revenue);

      setReport({
        totalRevenue,
        vatAmount: totalRevenue * VAT_RATE,
        netIncome: totalRevenue * (1 - VAT_RATE),
        bookings: rows.length,
        averageStay: rows.length ? totalNights / rows.length : 0,
        byProperty,
        byMonth,
      });
    } catch (err) {
      toast.error('Failed to generate report. Check your database connection.');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
 generateReport(); 
}, [generateReport]);

  const exportCSV = () => {
    if (!report) {
return;
}
    const rows = [
      ['Month', 'Revenue (€)', 'VAT 15% (€)', 'Net (€)'],
      ...report.byMonth.map(m => [
        m.month,
        m.revenue.toFixed(2),
        (m.revenue * VAT_RATE).toFixed(2),
        (m.revenue * (1 - VAT_RATE)).toFixed(2),
      ]),
      [],
      ['TOTAL', report.totalRevenue.toFixed(2), report.vatAmount.toFixed(2), report.netIncome.toFixed(2)],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tax-report-${year}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-[#F5F5F0] p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] mb-1">Tax Reports</h1>
            <p className="text-sm text-[#71717A]">Malta VAT 15% — Confirmed reservations only</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={year} onValueChange={v => {
 setYear(v); 
}}>
              <SelectTrigger className="w-28 bg-[#161618] border-white/10 text-[#F5F5F0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#161618] border-white/10">
                {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={generateReport} disabled={loading} variant="outline" className="border-white/10 text-[#F5F5F0]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><FileText className="w-4 h-4 mr-2" />Refresh</>}
            </Button>
            {report && (
              <Button onClick={exportCSV} className="bg-[#C9A84C] text-[#0F0F10] hover:bg-[#D4B85C]">
                <Download className="w-4 h-4 mr-2" />Export CSV
              </Button>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" />
          </div>
        )}

        {!loading && report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Gross Revenue', value: `€${report.totalRevenue.toLocaleString('en', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-[#C9A84C]' },
                { label: 'VAT (15%)', value: `€${report.vatAmount.toLocaleString('en', { minimumFractionDigits: 2 })}`, icon: FileText, color: 'text-red-400' },
                { label: 'Net Income', value: `€${report.netIncome.toLocaleString('en', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-green-400' },
                { label: 'Bookings', value: report.bookings.toString(), icon: Calendar, color: 'text-blue-400' },
                { label: 'Avg Stay', value: `${report.averageStay.toFixed(1)} nights`, icon: Calendar, color: 'text-purple-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="p-4 bg-[#161618] border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <p className="text-xs text-[#71717A] uppercase tracking-widest">{label}</p>
                  </div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Monthly breakdown */}
              <Card className="p-6 bg-[#161618] border-white/10">
                <h2 className="text-lg font-semibold text-[#F5F5F0] mb-4">Monthly Breakdown</h2>
                {report.byMonth.length === 0 ? (
                  <p className="text-[#71717A] text-sm">No confirmed reservations in {year}.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#71717A] border-b border-white/5">
                        <th className="text-left pb-2">Month</th>
                        <th className="text-right pb-2">Revenue</th>
                        <th className="text-right pb-2">VAT</th>
                        <th className="text-right pb-2">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.byMonth.map(m => (
                        <tr key={m.month} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 text-[#F5F5F0]">{m.month}</td>
                          <td className="py-2 text-right text-[#C9A84C]">€{m.revenue.toFixed(2)}</td>
                          <td className="py-2 text-right text-red-400">€{(m.revenue * VAT_RATE).toFixed(2)}</td>
                          <td className="py-2 text-right text-green-400">€{(m.revenue * (1 - VAT_RATE)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>

              {/* By property */}
              <Card className="p-6 bg-[#161618] border-white/10">
                <h2 className="text-lg font-semibold text-[#F5F5F0] mb-4">By Property</h2>
                {report.byProperty.length === 0 ? (
                  <p className="text-[#71717A] text-sm">No data for {year}.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#71717A] border-b border-white/5">
                        <th className="text-left pb-2">Property</th>
                        <th className="text-right pb-2">Bookings</th>
                        <th className="text-right pb-2">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.byProperty.map(p => (
                        <tr key={p.title} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 text-[#F5F5F0] max-w-[150px] truncate">{p.title}</td>
                          <td className="py-2 text-right text-[#A1A1AA]">{p.bookings}</td>
                          <td className="py-2 text-right text-[#C9A84C]">€{p.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>
          </>
        )}

        {!loading && report && report.bookings === 0 && (
          <div className="mt-6 p-4 bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-center text-sm text-[#A1A1AA]">
            No confirmed reservations found for {year}. Reservations sync automatically via the Guesty webhook.
          </div>
        )}
      </div>
    </div>
  );
}
