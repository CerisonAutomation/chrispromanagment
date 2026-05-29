// =============================================================================
// UI DOMAIN TYPES
// Toast, AI messages, history entries — shared across editor + frontend.
// =============================================================================
import type { PuckData } from './puck';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

export interface HistoryEntry {
  content: PuckData | null;
  selectedBlockId: string | null;
  timestamp: number;
}
