import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/use-chat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface ChatWindowProps {
  roomId: string;
}

export default function ChatWindow({ roomId }: ChatWindowProps) {
  const { messages, sendMessage } = useChat(roomId);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: user } = supabase.auth.getUser();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(newMessage, roomId);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full border rounded-lg">
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar>
          <AvatarImage src={messages[0]?.sender?.avatar_url} />
          <AvatarFallback>
            {messages[0]?.sender?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">
            {messages[0]?.sender?.full_name || 'Chat'}
          </h3>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === user?.user?.id}
            />
          ))}
          {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
