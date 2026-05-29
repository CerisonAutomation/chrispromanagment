'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ErrorEntry {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  createdAt: string;
}

const SEVERITY_VARIANT: Record<ErrorEntry['severity'], 'destructive' | 'default' | 'secondary' | 'outline'> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

export default function ErrorDashboardPage() {
  const [errors, setErrors] = useState<ErrorEntry[]>([
    { id: '1', message: 'Payment finalize failed', severity: 'critical', resolved: false, createdAt: '2026-05-25T10:00:00Z' },
    { id: '2', message: 'Guesty token refresh failed', severity: 'high', resolved: false, createdAt: '2026-05-25T09:30:00Z' },
    { id: '3', message: 'Image upload timeout', severity: 'medium', resolved: true, createdAt: '2026-05-24T14:20:00Z' },
  ]);

  const resolve = (id: string) =>
    setErrors(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));

  const criticalCount = errors.filter(e => e.severity === 'critical' && !e.resolved).length;
  const highCount = errors.filter(e => e.severity === 'high' && !e.resolved).length;
  const unresolvedCount = errors.filter(e => !e.resolved).length;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Error Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="p-6"><h3 className="text-sm font-medium">Critical</h3><p className="text-3xl font-bold text-red-600">{criticalCount}</p></Card>
        <Card className="p-6"><h3 className="text-sm font-medium">High</h3><p className="text-3xl font-bold text-orange-600">{highCount}</p></Card>
        <Card className="p-6"><h3 className="text-sm font-medium">Total Unresolved</h3><p className="text-3xl font-bold">{unresolvedCount}</p></Card>
      </div>
      <div className="grid gap-2">
        {errors.map(error => (
          <Card key={error.id} className={`p-4 flex justify-between items-center ${error.resolved ? 'opacity-60' : ''}`}>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={SEVERITY_VARIANT[error.severity]}>{error.severity}</Badge>
                {error.resolved && <Badge variant="outline">Resolved</Badge>}
              </div>
              <p className="font-medium mt-1">{error.message}</p>
              <p className="text-sm text-muted-foreground">{new Date(error.createdAt).toLocaleString()}</p>
            </div>
            {!error.resolved && <Button size="sm" onClick={() => resolve(error.id)}>Resolve</Button>}
          </Card>
        ))}
      </div>
    </div>
  );
}
