// @ts-nocheck
import { useState } from 'react';
import { getConciergeResponse, ConciergeMessage } from '@/lib/concierge-ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface ConciergeChatProps {
  propertyId?: string;
}

export default function ConciergeChat({ propertyId }: ConciergeChatProps) {
  const [messages, setMessages] = useState<ConciergeMessage[]>([
    { role: 'assistant', content: 'Hello! I\'m your property concierge. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) {
return;
}

    const userMessage: ConciergeMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await getConciergeResponse(
        [...messages, userMessage],
        { propertyId }
      );

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${(err as Error).message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">AI Concierge</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-muted mr-auto'
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="text-muted-foreground text-sm">Concierge is typing...</div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={loading}>
          Send
        </Button>
      </div>
    </Card>
  );
}