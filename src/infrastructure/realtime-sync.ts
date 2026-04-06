// =============================================================================
// REAL-TIME COLLABORATION ENGINE - WebSocket + Presence + Cursors
// =============================================================================
// Addresses: Section 1 - Real-Time Collaboration Engine

import { useEffect, useRef, useCallback, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PresenceUser {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  cursor?: CursorPosition;
  selection?: string[];
  lastActive: number;
}

export interface CursorPosition {
  x: number;
  y: number;
  blockId?: string;
}

export interface SyncMessage {
  type: 'presence' | 'cursor' | 'selection' | 'edit' | 'sync' | 'join' | 'leave';
  payload: unknown;
  userId: string;
  timestamp: number;
}

export interface RealtimeConfig {
  wsUrl: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  presenceTTL?: number;
}

// ---------------------------------------------------------------------------
// Presence State
// ---------------------------------------------------------------------------

export interface PresenceState {
  users: Map<string, PresenceUser>;
  localUser: PresenceUser | null;
  isConnected: boolean;
  isSyncing: boolean;
}

// ---------------------------------------------------------------------------
// WebSocket Client
// ---------------------------------------------------------------------------

class RealtimeClient {
  private ws: WebSocket | null = null;
  private config: Required<RealtimeConfig>;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private presenceUsers = new Map<string, PresenceUser>();
  private localUser: PresenceUser | null = null;
  private messageHandlers: Set<(msg: SyncMessage) => void> = new Set();
  private presenceUpdateHandlers: Set<(users: PresenceUser[]) => void> = new Set();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private state: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  constructor(config: RealtimeConfig) {
    this.config = {
      wsUrl: config.wsUrl,
      reconnectInterval: config.reconnectInterval ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      presenceTTL: config.presenceTTL ?? 30000,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(user: PresenceUser): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.state === 'connected') {
        resolve();
        return;
      }

      this.localUser = user;
      this.state = 'connecting';

      try {
        this.ws = new WebSocket(this.config.wsUrl);

        this.ws.onopen = () => {
          this.state = 'connected';
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.sendJoin();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data) as SyncMessage;
            this.handleMessage(msg);
          } catch (e) {
            console.error('Failed to parse message:', e);
          }
        };

        this.ws.onclose = () => {
          this.state = 'disconnected';
          this.stopHeartbeat();
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          if (this.state === 'connecting') {
            reject(error);
          }
        };
      } catch (error) {
        this.state = 'disconnected';
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.sendLeave();
      this.ws.close();
      this.ws = null;
    }
    this.state = 'disconnected';
    this.presenceUsers.clear();
  }

  /**
   * Send cursor position
   */
  sendCursor(position: CursorPosition): void {
    this.send({
      type: 'cursor',
      payload: position,
      userId: this.localUser?.id ?? '',
      timestamp: Date.now(),
    });
  }

  /**
   * Send selection
   */
  sendSelection(blockIds: string[]): void {
    this.send({
      type: 'selection',
      payload: blockIds,
      userId: this.localUser?.id ?? '',
      timestamp: Date.now(),
    });
  }

  /**
   * Send edit operation
   */
  sendEdit(operation: unknown): void {
    this.send({
      type: 'edit',
      payload: operation,
      userId: this.localUser?.id ?? '',
      timestamp: Date.now(),
    });
  }

  /**
   * Request full sync
   */
  requestSync(): void {
    this.send({
      type: 'sync',
      payload: null,
      userId: this.localUser?.id ?? '',
      timestamp: Date.now(),
    });
  }

  /**
   * Subscribe to messages
   */
  onMessage(handler: (msg: SyncMessage) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Subscribe to presence updates
   */
  onPresenceUpdate(handler: (users: PresenceUser[]) => void): () => void {
    this.presenceUpdateHandlers.add(handler);
    return () => this.presenceUpdateHandlers.delete(handler);
  }

  /**
   * Get current presence state
   */
  getPresence(): PresenceUser[] {
    return Array.from(this.presenceUsers.values());
  }

  /**
   * Get connection state
   */
  isConnected(): boolean {
    return this.state === 'connected';
  }

  // Private methods
  private send(msg: SyncMessage): void {
    if (this.ws && this.state === 'connected') {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private sendJoin(): void {
    if (this.localUser) {
      this.send({
        type: 'join',
        payload: this.localUser,
        userId: this.localUser.id,
        timestamp: Date.now(),
      });
    }
  }

  private sendLeave(): void {
    if (this.localUser) {
      this.send({
        type: 'leave',
        payload: null,
        userId: this.localUser.id,
        timestamp: Date.now(),
      });
    }
  }

  private handleMessage(msg: SyncMessage): void {
    // Notify all message handlers
    this.messageHandlers.forEach((handler) => handler(msg));

    // Handle presence updates
    if (msg.type === 'join' || msg.type === 'presence') {
      const user = msg.payload as PresenceUser;
      this.presenceUsers.set(msg.userId, {
        ...user,
        lastActive: msg.timestamp,
      });
      this.notifyPresenceUpdate();
    } else if (msg.type === 'leave') {
      this.presenceUsers.delete(msg.userId);
      this.notifyPresenceUpdate();
    } else if (msg.type === 'cursor') {
      const existing = this.presenceUsers.get(msg.userId);
      if (existing) {
        existing.cursor = msg.payload as CursorPosition;
        existing.lastActive = msg.timestamp;
        this.notifyPresenceUpdate();
      }
    } else if (msg.type === 'selection') {
      const existing = this.presenceUsers.get(msg.userId);
      if (existing) {
        existing.selection = msg.payload as string[];
        existing.lastActive = msg.timestamp;
        this.notifyPresenceUpdate();
      }
    }
  }

  private notifyPresenceUpdate(): void {
    this.presenceUpdateHandlers.forEach((handler) =>
      handler(this.getPresence())
    );
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);

    this.reconnectTimer = setTimeout(() => {
      if (this.localUser) {
        this.connect(this.localUser).catch(console.error);
      }
    }, this.config.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.localUser) {
        this.send({
          type: 'presence',
          payload: { ...this.localUser, lastActive: Date.now() },
          userId: this.localUser.id,
          timestamp: Date.now(),
        });
      }
    }, this.config.presenceTTL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton Instance
// ---------------------------------------------------------------------------

let realtimeClient: RealtimeClient | null = null;

export function initRealtime(config: RealtimeConfig): RealtimeClient {
  realtimeClient = new RealtimeClient(config);
  return realtimeClient;
}

export function getRealtime(): RealtimeClient | null {
  return realtimeClient;
}

// ---------------------------------------------------------------------------
// React Hook
// ---------------------------------------------------------------------------

export function useRealtime(user: PresenceUser) {
  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<RealtimeClient | null>(null);

  useEffect(() => {
    // Initialize or get existing client
    if (!clientRef.current) {
      clientRef.current = getRealtime() ?? initRealtime({
        wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001',
      });
    }

    const client = clientRef.current;

    // Connect
    client.connect(user).then(() => {
      setIsConnected(true);
    }).catch(console.error);

    // Subscribe to presence updates
    const unsubscribe = client.onPresenceUpdate((users) => {
      setPresence(users);
    });

    return () => {
      unsubscribe();
      client.disconnect();
      setIsConnected(false);
    };
  }, [user.id]);

  const sendCursor = useCallback((position: CursorPosition) => {
    clientRef.current?.sendCursor(position);
  }, []);

  const sendSelection = useCallback((blockIds: string[]) => {
    clientRef.current?.sendSelection(blockIds);
  }, []);

  const sendEdit = useCallback((operation: unknown) => {
    clientRef.current?.sendEdit(operation);
  }, []);

  const requestSync = useCallback(() => {
    clientRef.current?.requestSync();
  }, []);

  return {
    presence,
    isConnected,
    sendCursor,
    sendSelection,
    sendEdit,
    requestSync,
  };
}

// ---------------------------------------------------------------------------
// Conflict Resolution
// ---------------------------------------------------------------------------

export interface ConflictResolution {
  strategy: 'lww' | 'merge' | 'manual';
  resolve: (local: unknown, remote: unknown) => unknown;
}

export const ConflictResolution = {
  lastWriteWins: <T>(): ConflictResolution => ({
    strategy: 'lww',
    resolve: (_local, remote) => remote,
  }),

  merge: <T>(merger: (a: T, b: T) => T): ConflictResolution => ({
    strategy: 'merge',
    resolve: (local, remote) => merger(local as T, remote as T),
  }),

  manual: <T>(): ConflictResolution => ({
    strategy: 'manual',
    resolve: () => null, // Returns null to indicate manual resolution needed
  }),
};

// ---------------------------------------------------------------------------
// Sync State Machine
// ---------------------------------------------------------------------------

export type SyncState = 
  | 'idle'
  | 'optimistic'
  | 'syncing'
  | 'synced'
  | 'conflict'
  | 'error'
  | 'offline';

export interface SyncStateMachine {
  state: SyncState;
  transition: (event: SyncEvent) => void;
  canTransition: (event: SyncEvent) => boolean;
}

export type SyncEvent = 
  | { type: 'edit_start' }
  | { type: 'edit_success' }
  | { type: 'edit_error' }
  | { type: 'conflict_detected' }
  | { type: 'conflict_resolved' }
  | { type: 'go_offline' }
  | { type: 'go_online' }
  | { type: 'retry' };

const transitions: Record<SyncState, SyncEvent['type'][]> = {
  idle: ['edit_start', 'go_offline'],
  optimistic: ['edit_success', 'edit_error', 'conflict_detected'],
  syncing: ['edit_success', 'edit_error', 'go_offline'],
  synced: ['edit_start', 'go_offline'],
  conflict: ['conflict_resolved', 'edit_error'],
  error: ['retry', 'go_offline'],
  offline: ['edit_start', 'go_online'],
};

export function createSyncStateMachine(
  initialState: SyncState = 'idle',
  onChange?: (state: SyncState) => void
): SyncStateMachine {
  let state = initialState;

  return {
    get state() {
      return state;
    },

    transition(event) {
      const allowed = transitions[state];
      if (allowed.includes(event.type)) {
        switch (event.type) {
          case 'edit_start':
            state = 'optimistic';
            break;
          case 'edit_success':
            state = 'synced';
            break;
          case 'edit_error':
            state = 'error';
            break;
          case 'conflict_detected':
            state = 'conflict';
            break;
          case 'conflict_resolved':
            state = 'synced';
            break;
          case 'go_offline':
            state = 'offline';
            break;
          case 'go_online':
            state = 'idle';
            break;
          case 'retry':
            state = 'optimistic';
            break;
        }
        onChange?.(state);
      }
    },

    canTransition(event) {
      return transitions[state].includes(event.type);
    },
  };
}

// ---------------------------------------------------------------------------
// Default Export
// ---------------------------------------------------------------------------

export default {
  RealtimeClient,
  initRealtime,
  getRealtime,
  useRealtime,
  ConflictResolution,
  createSyncStateMachine,
};