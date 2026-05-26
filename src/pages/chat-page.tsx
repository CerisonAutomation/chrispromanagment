import { useState } from 'react';
import { useChat } from '@/hooks/use-chat';
import ChatWindow from '@/components/chat/chat-window';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

export default function ChatPage() {
  const { rooms, loading } = useChat();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredRooms = rooms.filter(room =>
    room.property?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Room List */}
        <Card className="md:col-span-1 h-full flex flex-col">
          <div className="p-4 border-b">
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading conversations...
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations found
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedRoomId === room.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedRoomId(room.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={room.property?.images?.[0]} />
                        <AvatarFallback>
                          {room.property?.title?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {room.property?.title || 'Property Chat'}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {format(new Date(room.updated_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className="md:col-span-2 h-full">
          {selectedRoomId ? (
            <ChatWindow roomId={selectedRoomId} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a conversation to start chatting
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
