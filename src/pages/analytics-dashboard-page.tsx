import { useState, useEffect } from 'react';
import { analyticsEngine, type TopProperty } from '@/lib/analytics-engine';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { TrendingUp, TrendingDown, Home, Calendar, DollarSign, Percent, Loader2 } from 'lucide-react';

const GOLD = '#D4AF37';
const SURFACE = '#161618';
const BG = '#0F0F10';
const MUTED = '#A1A1AA';
const TEXT = '#F5F5F0';

function fmt(n: number, currency = 'EUR') {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

function pct(n: number) { return `${n.toFixed(1)}%`; }

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  icon: React.ReactNode;
}

function KPICard({ label, value, sub, trend, icon }: KPICardProps) {
  const up = trend !== undefined && trend >= 0;
  return (
    <div className="bg-[#161618] border border-white/10 p-6 relative overflow-hidden group hover:border-[#D4AF37]/30 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-green-400' : 'text-red-400'}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-[#A1A1AA] text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="font-['Playfair_Display'] text-2xl text-[#F5F5F0]">{value}</p>
      {sub && <p className="text-[#71717A] text-xs mt-1">{sub}</p>}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#161618] border border-white/10 px-3 py-2 text-xs">
      <p className="text-[#A1A1AA] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: GOLD }} className="font-semibold">
          {typeof p.value === 'number' && p.value > 1000 ? fmt(p.value) : `${p.value?.toFixed?.(1) ?? p.value}`}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsDashboardPage() {
  const [revenue, setRevenue] = useState<{ date: string; amount: number }[]>([]);
  const [occupancy, setOccupancy] = useState<{ date: string; rate: number }[]>([]);
  const [bookings, setBookings] = useState<{ date: string; count: number }[]>([]);
  const [topProps, setTopProps] = useState<TopProperty[]>([]);
  const [kpi, setKpi] = useState({ totalRevenue: 0, avgOccupancy: 0, totalBookings: 0, avgNightlyRate: 0 });
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      analyticsEngine.getRevenueData(days),
      analyticsEngine.getOccupancyData(days),
      analyticsEngine.getBookingsData(days),
      analyticsEngine.getTopProperties(6),
      analyticsEngine.getKPIStats(days),
    ]).then(([rev, occ, book, top, stats]) => {
      setRevenue(rev);
      setOccupancy(occ);
      setBookings(book);
      setTopProps(top);
      setKpi(stats);
    }).finally(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-[#A1A1AA] text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenue.map(r => r.amount), 1);

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#D4AF37] text-xs uppercase tracking-widest mb-2">Performance Overview</p>
            <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]">Analytics Dashboard</h1>
          </div>
          <div className="flex items-center gap-1 bg-[#161618] border border-white/10 p-1">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                  days === d ? 'bg-[#D4AF37] text-[#0F0F10]' : 'text-[#A1A1AA] hover:text-[#F5F5F0]'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <KPICard label="Total Revenue" value={fmt(kpi.totalRevenue)} icon={<DollarSign className="w-5 h-5" />} />
          <KPICard label="Avg Occupancy" value={pct(kpi.avgOccupancy)} icon={<Percent className="w-5 h-5" />} />
          <KPICard label="Total Bookings" value={String(kpi.totalBookings)} icon={<Calendar className="w-5 h-5" />} />
          <KPICard label="Avg Nightly Rate" value={fmt(kpi.avgNightlyRate)} icon={<Home className="w-5 h-5" />} />
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="mb-10">
          <TabsList className="bg-[#161618] border border-white/10 rounded-none mb-6 p-1 h-auto">
            {['revenue', 'occupancy', 'bookings'].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-none capitalize text-xs uppercase tracking-wider data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0F0F10] data-[state=active]:shadow-none text-[#A1A1AA] px-5 py-2"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="revenue">
            <div className="bg-[#161618] border border-white/10 p-6">
              <h2 className="font-['Playfair_Display'] text-lg text-[#F5F5F0] mb-6">Revenue (last {days} days)</h2>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenue} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GOLD} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={v => v.slice(5)} interval={Math.floor(revenue.length / 6)} />
                  <YAxis tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={v => v > 0 ? `€${(v / 1000).toFixed(0)}k` : '€0'} width={48} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke={GOLD} strokeWidth={2} fill="url(#rev-grad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="occupancy">
            <div className="bg-[#161618] border border-white/10 p-6">
              <h2 className="font-['Playfair_Display'] text-lg text-[#F5F5F0] mb-6">Occupancy Rate (last {days} days)</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={occupancy} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={v => v.slice(5)} interval={Math.floor(occupancy.length / 6)} />
                  <YAxis tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={v => `${v.toFixed(0)}%`} domain={[0, 100]} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="rate" stroke={GOLD} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="bg-[#161618] border border-white/10 p-6">
              <h2 className="font-['Playfair_Display'] text-lg text-[#F5F5F0] mb-6">Bookings (last {days} days)</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={bookings} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false}
                    tickFormatter={v => v.slice(5)} interval={Math.floor(bookings.length / 6)} />
                  <YAxis tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill={GOLD} fillOpacity={0.8} radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Top Properties */}
        <div className="bg-[#161618] border border-white/10 p-6">
          <h2 className="font-['Playfair_Display'] text-lg text-[#F5F5F0] mb-6">Top Performing Properties</h2>
          {topProps.length === 0 ? (
            <p className="text-[#71717A] text-sm py-8 text-center">No reservation data yet — properties will appear here once bookings come in.</p>
          ) : (
            <div className="space-y-3">
              {topProps.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4">
                  <span className="font-['Playfair_Display'] text-lg text-[#D4AF37]/50 w-6 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F5F5F0] text-sm font-medium truncate">{p.title}</p>
                    <p className="text-[#71717A] text-xs">{p.bookings} booking{p.bookings !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[#D4AF37] font-semibold text-sm">{fmt(p.revenue)}</p>
                    <div className="mt-1 h-1 bg-white/5 w-24">
                      <div
                        className="h-full bg-[#D4AF37]"
                        style={{ width: `${(p.revenue / (topProps[0]?.revenue || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
