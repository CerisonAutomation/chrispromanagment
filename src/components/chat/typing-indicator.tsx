interface TypingIndicatorProps {
  users: string[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
      </div>
      <span>
        {users.join(', ')} {users.length === 1 ? 'is' : 'are'} typing...
      </span>
    </div>
  );
}
