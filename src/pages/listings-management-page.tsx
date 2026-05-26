import { useEffect } from 'react';
import { usePropertiesStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RefreshCw, Building2, Bed, Bath, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ListingsManagementPage() {
  const { properties, loading, filter, total, fetch, setFilter, clearFilter, toggleActive, sync } = usePropertiesStore();

  useEffect(() => { fetch(); }, [fetch]);

  const handleToggle = async (guesty_id: string, active: boolean) => {
    try {
      await toggleActive(guesty_id, !active);
      toast.success(active ? 'Listing deactivated' : 'Listing activated');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  const handleSync = async () => {
    try {
      await sync();
      toast.success('Sync complete');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#D4AF37]" />
            Listings
          </h1>
          <p className="text-sm text-[#71717A] mt-1">
            {total} properties · {properties.filter(p => p.active).length} active
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetch} disabled={loading} className="border-white/10 text-[#A1A1AA]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleSync} disabled={loading} className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]" size="sm">
            Sync Guesty
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search by name…"
          value={filter.search ?? ''}
          onChange={e => setFilter({ search: e.target.value || undefined })}
          className="bg-[#161618] border-white/10 text-[#F5F5F0] max-w-xs"
        />
        <Input
          placeholder="Filter by city…"
          value={filter.city ?? ''}
          onChange={e => setFilter({ city: e.target.value || undefined })}
          className="bg-[#161618] border-white/10 text-[#F5F5F0] w-40"
        />
        <div className="flex gap-1">
          {([undefined, true, false] as const).map(val => (
            <button
              key={String(val)}
              onClick={() => setFilter({ active: val })}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter.active === val
                  ? 'bg-[#D4AF37] text-[#0F0F10] border-[#D4AF37]'
                  : 'border-white/10 text-[#A1A1AA] hover:border-white/20'
              }`}
            >
              {val === undefined ? 'All' : val ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>
      </div>

      {loading && !properties.length ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-6 h-6 text-[#D4AF37] animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-lg">
          <Building2 className="w-10 h-10 text-[#71717A] mb-3" />
          <p className="text-[#A1A1AA] text-sm">No properties found — sync from Guesty</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map(p => (
            <Card key={p.guesty_id} className={`p-4 bg-[#161618] border transition-all ${p.active ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
              {p.thumbnail ? (
                <img src={p.thumbnail} alt={p.title} className="w-full h-36 object-cover rounded mb-3" />
              ) : (
                <div className="w-full h-36 bg-white/5 rounded mb-3 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-[#71717A]" />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-[#F5F5F0] font-medium truncate">{p.title}</h3>
                  <p className="text-xs text-[#71717A]">{[p.city, p.country].filter(Boolean).join(', ')}</p>
                </div>
                <button onClick={() => handleToggle(p.guesty_id, p.active)} className="flex-shrink-0">
                  {p.active
                    ? <ToggleRight className="w-5 h-5 text-green-400" />
                    : <ToggleLeft className="w-5 h-5 text-[#71717A]" />}
                </button>
              </div>
              <div className="flex gap-3 mt-3 text-xs text-[#A1A1AA]">
                {p.bedrooms != null && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{p.bedrooms}</span>}
                {p.bathrooms != null && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{p.bathrooms}</span>}
                {p.accommodates != null && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.accommodates}</span>}
                {p.base_price != null && (
                  <span className="ml-auto font-semibold text-[#D4AF37]">
                    {p.currency ?? '€'}{p.base_price}/night
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
