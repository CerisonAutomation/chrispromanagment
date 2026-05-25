import ConciergeChat from '@/components/concierge/ConciergeChat';
import { Card } from '@/components/ui/card';

export default function ConciergePage() {
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold mb-4">AI Concierge</h1>
      <Card className="h-[calc(100%-3rem)]">
        <ConciergeChat />
      </Card>
    </div>
  );
}
