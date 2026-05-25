import { useState, useEffect } from 'react';
import { pricingEngine } from '@/lib/pricing-engine';
import PricingChart from '@/components/pricing/PricingChart';
import ForecastTable from '@/components/pricing/ForecastTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

export default function PricingEnginePage() {
  const [propertyId, setPropertyId] = useState('');
  const [forecast, setForecast] = useState<{ month: string; price: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const loadForecast = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const data = await pricingEngine.generateForecast(propertyId);
      setForecast(data);
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">AI Pricing Engine</h1>

      <Card className="p-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Property ID</label>
            <Input
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="Enter property ID"
            />
          </div>
          <Button onClick={loadForecast} disabled={loading || !propertyId}>
            {loading ? 'Loading...' : 'Generate Forecast'}
          </Button>
        </div>
      </Card>

      {forecast.length > 0 && (
        <div className="grid gap-6">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">30-Day Price Forecast</h2>
            <PricingChart data={forecast} />
          </Card>

          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Forecast Details</h2>
            <ForecastTable data={forecast} />
          </Card>
        </div>
      )}
    </div>
  );
}
