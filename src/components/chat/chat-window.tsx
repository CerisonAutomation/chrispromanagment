import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/use-chat';
import MessageBubble from './message-bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Send, RefreshCw } from 'lucide-react';

interface ChatWindowProps {
  roomId: string;
}

export default function ChatWindow({ roomId }: ChatWindowProps) {
  const { messages, sendMessage, loading } = useChat(roomId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) {
return;
}
    setSending(true);
    try {
      await sendMessage(newMessage.trim(), roomId);
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  const firstSender = messages[0]?.sender_name || 'Guest';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#161618]">
        <div className="w-9 h-9 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] text-sm font-bold">
          {firstSender.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-[#F5F5F0] font-semibold text-sm">{firstSender}</h3>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-5 h-5 text-[#C9A84C] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-[#71717A] text-sm py-8">No messages yet — start the conversation.</p>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === userId}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex gap-2 bg-[#161618]">
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 bg-[#0a0a0b] border-white/10 text-[#F5F5F0] text-sm"
          disabled={sending}
        />
        <Button type="submit" disabled={sending || !newMessage.trim()}
          className="bg-[#C9A84C] text-[#0F0F10] hover:bg-[#D4B85C] px-3">
          {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}