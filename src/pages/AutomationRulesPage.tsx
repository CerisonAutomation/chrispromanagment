import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Rule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
}

export default function AutomationRulesPage() {
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', name: 'Welcome Email', trigger: 'booking_created', action: 'send_email', isActive: true },
    { id: '2', name: 'Review Request', trigger: 'checkout', action: 'send_sms', isActive: true },
  ]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Automation Rules</h1>
      <Button className="mb-6">+ Create Rule</Button>
      <div className="grid gap-4">
        {rules.map(rule => (
          <Card key={rule.id} className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{rule.name}</h3>
                <p className="text-sm text-muted-foreground">
                  When {rule.trigger} → {rule.action}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">{rule.isActive ? 'Active' : 'Inactive'}</Button>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
