import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Listing {
  id: string;
  title: string;
  address?: { city?: string; country?: string };
  nightlyRates?: { amount: number }[];
}

export default function ListingsManagementPage() {
  const [search, setSearch] = useState('');
  
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['admin', 'listings'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('guesty-beapi', {
        body: { action: 'listings' }
      });
      if (error) throw error;
      return (data as Listing[]) || [] as Listing[];
    }
  });

  const filtered = (listings || []).filter(l => 
    l.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Listings Management</h1>
      <div className="flex gap-4 mb-6">
        <Input 
          placeholder="Search listings..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button>Add Listing</Button>
      </div>
      {isLoading && <LoadingSpinner />}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(listing => (
          <Card key={listing.id} className="p-4">
            <h3 className="font-semibold">{listing.title}</h3>
            <p className="text-sm text-muted-foreground">
              {listing.address?.city}, {listing.address?.country}
            </p>
            <p className="text-lg font-bold mt-2">
              €{listing.nightlyRates?.[0]?.amount || 'N/A'}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
