// @ts-nocheck
/**
 * Supabase Realtime collaboration manager.
 * Replaces the dead socket.io/BACKEND_URL version with Supabase channels.
 */
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

type Handler = (data: unknown) => void;

class RealtimeManager {
  private channels = new Map<string, RealtimeChannel>();
  private handlers = new Map<string, Handler[]>();

  /** Subscribe to postgres_changes on any table */
  watchTable(table: string, event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*', onRow: (row: unknown) => void) {
    const key = `table:${table}:${event}`;
    const ch = supabase.channel(key)
      .on('postgres_changes', { event, schema: 'public', table }, (payload) => onRow(payload.new ?? payload.old))
      .subscribe();
    this.channels.set(key, ch);
    return () => {
 supabase.removeChannel(ch); this.channels.delete(key); 
};
  }

  /** Broadcast presence/custom events on a named room */
  joinRoom(room: string, userDisplay: string) {
    const ch = supabase.channel(`room:${room}`, {
      config: { presence: { key: userDisplay } },
    });
    ch.subscribe();
    this.channels.set(`room:${room}`, ch);
    return ch;
  }

  leaveRoom(room: string) {
    const ch = this.channels.get(`room:${room}`);
    if (ch) {
 supabase.removeChannel(ch); this.channels.delete(`room:${room}`); 
}
  }

  /** Broadcast arbitrary payload to room subscribers */
  broadcast(room: string, event: string, payload: unknown) {
    const ch = this.channels.get(`room:${room}`);
    ch?.send({ type: 'broadcast', event, payload });
  }

  on(event: string, handler: Handler) {
    if (!this.handlers.has(event)) {
this.handlers.set(event, []);
}
    this.handlers.get(event)!.push(handler);
    return () => {
      const list = this.handlers.get(event) ?? [];
      this.handlers.set(event, list.filter(h => h !== handler));
    };
  }

  trigger(event: string, data: unknown) {
    this.handlers.get(event)?.forEach(h => {
 try {
 h(data); 
} catch {} 
});
  }

  teardown() {
    this.channels.forEach(ch => supabase.removeChannel(ch));
    this.channels.clear();
  }

  getStatus() {
    return { channels: this.channels.size };
  }
}

export const wsManager = new RealtimeManager();
export const useWebSocket = () => wsManager;
export default wsManager;