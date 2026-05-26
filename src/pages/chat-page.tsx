import { useEffect, useState } from 'react';
import { useChatStore } from '@/store';
import type { ChatRoom } from '@/store';
import ChatWindow from '@/components/chat/chat-window';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { MessageSquare, Plus, RefreshCw, Circle } from 'lucide-react';
import { toast } from 'sonner';

function statusColor(status: string) {
  return status === 'open' ? 'text-green-400' : 'text-[#71717A]';
}

function initials(room: ChatRoom) {
  const name = room.guest_name || room.guest_email;
  return name.slice(0, 2).toUpperCase();
}

export default function ChatPage() {
  const { rooms, loading, fetchRooms, setActiveRoom, activeRoomId, createRoom } = useChatStore();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const filtered = rooms.filter(r => {
    const q = search.toLowerCase();
    return (
      r.guest_name?.toLowerCase().includes(q) ||
      r.guest_email.toLowerCase().includes(q) ||
      r.subject?.toLowerCase().includes(q)
    );
  });

  const handleCreate = async () => {
    if (!newEmail.trim()) { toast.error('Email is required'); return; }
    setCreating(true);
    try {
      const room = await createRoom(newEmail.trim(), newName.trim() || newEmail.trim(), newSubject.trim() || undefined);
      setActiveRoom(room.id);
      setShowNew(false);
      setNewEmail(''); setNewName(''); setNewSubject('');
      toast.success('Conversation started');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-3rem)] gap-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#D4AF37]" />
            Messages
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchRooms} disabled={loading} className="border-white/10 text-[#A1A1AA]">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setShowNew(v => !v)} className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]" size="sm">
              <Plus className="w-4 h-4 mr-1" />New
            </Button>
          </div>
        </div>

        {showNew && (
          <Card className="p-4 bg-[#161618] border-[#D4AF37]/30 mb-4 space-y-3">
            <h2 className="text-[#F5F5F0] font-semibold text-sm">New Conversation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input placeholder="Guest email *" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]" />
              <Input placeholder="Guest name" value={newName} onChange={e => setNewName(e.target.value)}
                className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]" />
              <Input placeholder="Subject" value={newSubject} onChange={e => setNewSubject(e.target.value)}
                className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNew(false)} className="border-white/10">Cancel</Button>
              <Button size="sm" onClick={handleCreate} disabled={creating} className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]">
                {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Start Chat'}
              </Button>
            </div>
          </Card>
        )}

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Room list */}
          <div className="w-72 shrink-0 flex flex-col bg-[#161618] border border-white/10 rounded-lg">
            <div className="p-3 border-b border-white/10">
              <Input
                placeholder="Search conversations…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0] text-sm h-8"
              />
            </div>
            <ScrollArea className="flex-1">
              {loading && !rooms.length ? (
                <div className="p-4 text-center text-[#71717A] text-sm">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                  Loading…
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-[#71717A] text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No conversations
                </div>
              ) : filtered.map(room => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room.id)}
                  className={`w-full text-left p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${activeRoomId === room.id ? 'bg-[#D4AF37]/10 border-l-2 border-l-[#D4AF37]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-xs font-bold flex-shrink-0">
                      {initials(room)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Circle className={`w-1.5 h-1.5 flex-shrink-0 fill-current ${statusColor(room.status)}`} />
                        <p className="text-[#F5F5F0] text-sm font-medium truncate">
                          {room.guest_name || room.guest_email}
                        </p>
                      </div>
                      {room.subject && (
                        <p className="text-[#71717A] text-xs truncate">{room.subject}</p>
                      )}
                      <p className="text-[#71717A] text-xs mt-0.5">
                        {format(new Date(room.updated_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </ScrollArea>
          </div>

          {/* Chat window */}
          <div className="flex-1 min-w-0 bg-[#161618] border border-white/10 rounded-lg overflow-hidden">
            {activeRoomId ? (
              <ChatWindow roomId={activeRoomId} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#71717A]">
                <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
