import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Ticket {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  vendorId?: string;
  createdAt: string;
}

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['maintenance', 'tickets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('maintenance_tickets').select('*');
      if (error) throw error;
      return data as Ticket[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('maintenance_tickets').insert({
        title, description, propertyId, priority, status: 'open'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setTitle(''); setDescription(''); setPropertyId('');
    }
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Maintenance Tickets</h1>
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Ticket</h2>
        <div className="grid gap-4">
          <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Input placeholder="Property ID" value={propertyId} onChange={e => setPropertyId(e.target.value)} />
          <Select value={priority} onValueChange={v => setPriority(v as Ticket]}>
            <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </Card>
      {isLoading && <p>Loading...</p>}
      <div className="grid gap-4">
        {(tickets || []).map(ticket => (
          <Card key={ticket.id} className="p-4">
            <h3 className="font-semibold">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground">{ticket.description}</p>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs ${ticket.status === 'resolved' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                {ticket.status}
              </span>
              <span className="text-sm">{ticket.priority} priority</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
