import { useState, useEffect } from 'react';
import { analyticsEngine } from '@/lib/analytics-engine';
import RevenueChart from '@/components/analytics/revenue-chart';
import OccupancyChart from '@/components/analytics/occupancy-chart';
import BookingsChart from '@/components/analytics/bookings-chart';
import TopPropertiesTable from '@/components/analytics/top-properties-table';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsDashboardPage() {
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [occupancyData, setOccupancyData] = useState<{ month: string; occupancy: number }[]>([]);
  const [bookingsData, setBookingsData] = useState<{ month: string; bookings: number }[]>([]);
  const [topProperties, setTopProperties] = useState<{ name: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [revenue, occupancy, bookings, topProps] = await Promise.all([
          analyticsEngine.getRevenueData(),
          analyticsEngine.getOccupancyData(),
          analyticsEngine.getBookingsData(),
          analyticsEngine.getTopProperties()
        ]);

        setRevenueData(revenue);
        setOccupancyData(occupancy);
        setBookingsData(bookings);
        setTopProperties(topProps);
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4">Loading analytics...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold">Total Revenue</h3>
          <p className="text-3xl font-bold">
            €{revenueData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold">Avg Occupancy</h3>
          <p className="text-3xl font-bold">
            {(occupancyData.reduce((sum, item) => sum + item.rate, 0) / occupancyData.length || 0).toFixed(1)}%
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold">Total Bookings</h3>
          <p className="text-3xl font-bold">
            {bookingsData.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card className="p-4">
            <RevenueChart data={revenueData} />
          </Card>
        </TabsContent>
        <TabsContent value="occupancy">
          <Card className="p-4">
            <OccupancyChart data={occupancyData} />
          </Card>
        </TabsContent>
        <TabsContent value="bookings">
          <Card className="p-4">
            <BookingsChart data={bookingsData} />
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-4 mt-6">
        <h2 className="text-xl font-semibold mb-4">Top Performing Properties</h2>
        <TopPropertiesTable data={topProperties} />
      </Card>
    </div>
  );
}
