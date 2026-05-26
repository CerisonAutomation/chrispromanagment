// @ts-nocheck
import { ChatMessage } from '@/hooks/use-chat';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const initial = (message.sender_name ?? 'U').charAt(0).toUpperCase();

  return (
    <div className={`flex gap-2 items-end ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-xs font-bold flex-shrink-0">
          {initial}
        </div>
      )}

      <div className={`max-w-[70%] rounded-lg px-3 py-2 ${isOwn ? 'bg-[#D4AF37] text-[#0a0a0b]' : 'bg-white/5 text-[#F5F5F0]'}`}>
        {!isOwn && message.sender_name && (
          <p className="text-[10px] font-medium opacity-60 mb-0.5">{message.sender_name}</p>
        )}
        <p className="text-sm leading-relaxed">{message.content}</p>
        <span className={`text-[10px] opacity-50 block mt-0.5 ${isOwn ? 'text-right' : ''}`}>
          {format(new Date(message.created_at), 'HH:mm')}
          {message.is_read && isOwn && ' ✓'}
        </span>
      </div>

      {isOwn && (
        <div className="w-7 h-7 rounded-full bg-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-bold flex-shrink-0">
          {initial}
        </div>
      )}
    </div>
  );
}