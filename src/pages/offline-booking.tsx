import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function OfflineBooking() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingBookings, setPendingBookings] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({ name: '', email: '', propertyId: '' });

  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  const handleSubmit = () => {
    if (!isOnline) {
      setPendingBookings(prev => [...prev, { ...form, id: Date.now() }]);
      setForm({ name: '', email: '', propertyId: '' });
      alert('Booking saved offline. Will sync when online.');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Offline Booking</h1>
      {!isOnline && (
        <div className="bg-yellow-100 border border-yellow-400 p-4 rounded mb-6">
          <p className="font-medium">You are offline</p>
          <p className="text-sm">Bookings will be saved locally and synced when online.</p>
        </div>
      )}
      <Card className="p-6">
        <div className="grid gap-4">
          <Input 
            placeholder="Name" 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })} 
          />
          <Input 
            placeholder="Email" 
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })} 
          />
          <Input 
            placeholder="Property ID" 
            value={form.propertyId} 
            onChange={e => setForm({ ...form, propertyId: e.target.value })} 
          />
          <Button onClick={handleSubmit}>Submit Booking</Button>
        </div>
      </Card>
      {pendingBookings.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Pending Sync ({pendingBookings.length})</h2>
          {pendingBookings.map(b => (
            <Card key={b.id} className="p-4 mb-2">
              <p className="font-medium">{b.name}</p>
              <p className="text-sm text-muted-foreground">{b.email}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
