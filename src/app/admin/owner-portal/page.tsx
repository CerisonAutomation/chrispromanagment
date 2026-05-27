'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const supabase = createClient();

interface OwnerStats {
  totalEarnings: number;
  occupancyRate: number;
  upcomingBookings: number;
}

export default function OwnerPortalPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: stats } = useQuery({
    queryKey: ['owner', 'stats'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke('owner-stats');
      return data as OwnerStats;
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Owner Portal</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <Card className="p-6">
              <h3 className="text-sm font-medium">Total Earnings</h3>
              <p className="text-3xl font-bold">€{stats?.totalEarnings ?? 0}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium">Occupancy Rate</h3>
              <p className="text-3xl font-bold">{stats?.occupancyRate ?? 0}%</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium">Upcoming Bookings</h3>
              <p className="text-3xl font-bold">{stats?.upcomingBookings ?? 0}</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
