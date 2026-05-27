import { useEffect } from 'react';
import { usePricingStore, usePropertiesStore } from '@/store';
import PricingChart from '@/components/pricing/pricing-chart';
import ForecastTable from '@/components/pricing/forecast-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, TrendingUp, Zap } from 'lucide-react';


export default function PricingEnginePage() {
  const { properties, fetch: fetchProperties, loading: propsLoading } = usePropertiesStore();
  const { forecasts, forecastLoading, loading, selectedPropertyId, setSelectedProperty } = usePricingStore();

  useEffect(() => {
 fetchProperties(); 
}, [fetchProperties]);

  const forecast = selectedPropertyId ? (forecasts[selectedPropertyId] ?? []) : [];

  const handleSelect = (propertyId: string) => {
    setSelectedProperty(propertyId);
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#C9A84C]" />
            AI Pricing Engine
          </h1>
          <p className="text-sm text-[#71717A] mt-1">Dynamic forecast based on seasonality & market data</p>
        </div>
        {selectedPropertyId && (
          <Button variant="outline" size="sm" onClick={() => handleSelect(selectedPropertyId)} disabled={forecastLoading}
            className="border-white/10 text-[#A1A1AA]">
            <RefreshCw className={`w-4 h-4 ${forecastLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {/* Property selector */}
      <Card className="p-4 bg-[#161618] border-white/10">
        <label className="block text-xs text-[#71717A] uppercase tracking-widest mb-2">Select Property</label>
        <Select value={selectedPropertyId ?? ''} onValueChange={handleSelect} disabled={propsLoading}>
          <SelectTrigger className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0] max-w-md">
            <SelectValue placeholder={propsLoading ? 'Loading properties…' : 'Choose a property'} />
          </SelectTrigger>
          <SelectContent className="bg-[#161618] border-white/10">
            {properties.map(p => (
              <SelectItem key={p.guesty_id} value={p.guesty_id} className="text-[#F5F5F0]">
                {p.title} {p.city ? `· ${p.city}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {forecastLoading && (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-[#C9A84C] animate-spin mx-auto mb-3" />
            <p className="text-[#A1A1AA] text-sm">Generating forecast…</p>
          </div>
        </div>
      )}

      {!forecastLoading && !selectedPropertyId && (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-lg">
          <TrendingUp className="w-10 h-10 text-[#71717A] mb-3" />
          <p className="text-[#A1A1AA] text-sm">Select a property to generate a price forecast</p>
        </div>
      )}

      {!forecastLoading && forecast.length > 0 && (
        <div className="grid gap-6">
          <Card className="p-6 bg-[#161618] border-white/10">
            <h2 className="text-[#F5F5F0] font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C9A84C]" />
              30-Day Price Forecast
            </h2>
            <PricingChart data={forecast} />
          </Card>
          <Card className="p-6 bg-[#161618] border-white/10">
            <h2 className="text-[#F5F5F0] font-semibold mb-4">Forecast Details</h2>
            <ForecastTable data={forecast} />
          </Card>
        </div>
      )}
    </div>
  );
}
