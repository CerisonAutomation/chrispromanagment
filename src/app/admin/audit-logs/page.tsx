'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const supabase = createClient();

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: unknown;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit', 'logs', dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
      if (dateFrom) query = query.gte('created_at', dateFrom);
      if (dateTo) query = query.lte('created_at', dateTo);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>
      <div className="flex gap-4 mb-6">
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <Button>Filter</Button>
        <Button variant="outline">Export CSV</Button>
      </div>
      {isLoading && <p>Loading...</p>}
      <div className="grid gap-2">
        {(logs ?? []).map(log => (
          <Card key={log.id} className="p-4 flex justify-between">
            <div>
              <p className="font-medium">{log.action} on {log.resource}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
            <span className="text-sm text-muted-foreground">{log.userId}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
