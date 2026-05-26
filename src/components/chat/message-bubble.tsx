// @ts-nocheck
import { ChatMessage } from '@/hooks/use-chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback>
            {message.sender?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[70%] ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
        <p className="text-sm">{message.content}</p>
        <span className="text-xs opacity-70 block mt-1">
          {format(new Date(message.created_at), 'HH:mm')}
          {message.is_read && isOwn && ' ✓'}
        </span>
      </div>

      {isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback>
            {message.sender?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}