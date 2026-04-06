/**
 * History Slice - Manages undo/redo history
 * Part of the modular slice architecture
 */

import type {AppState} from "../../types";
import {generateId} from "../../lib/generate-id";

// =============================================================================
// Types
// =============================================================================

export type History = {
  state: AppState;
  id: string;
  timestamp: number;
};

export type HistorySliceState = {
  index: number;
  histories: History[];
  initialAppState: AppState | null;
};

export type HistorySlice = HistorySliceState & {
  /** Check if there are past states */
  hasPast: () => boolean;
  
  /** Check if there are future states */
  hasFuture: () => boolean;
  
  /** Get the current history entry */
  currentHistory: () => History | null;
  
  /** Get the previous history entry */
  prevHistory: () => History | null;
  
  /** Get the next history entry */
  nextHistory: () => History | null;
  
  /** Record a new state */
  record: (state: AppState) => void;
  
  /** Go back to previous state */
  back: () => void;
  
  /** Go forward to next state */
  forward: () => void;
  
  /** Jump to specific history index */
  jump: (index: number) => void;
  
  /** Set histories directly */
  setHistories: (histories: History[]) => void;
  
  /** Set history index directly */
  setHistoryIndex: (index: number) => void;
  
  /** Clear all history */
  clear: () => void;
  
  /** Get total number of history entries */
  getLength: () => number;
  
  /** Get undo stack (all past states) */
  getUndoStack: () => AppState[];
  
  /** Get redo stack (all future states) */
  getRedoStack: () => AppState[];
};

// =============================================================================
// Constants
// =============================================================================

const EMPTY_HISTORY_INDEX = 0;
const DEBOUNCE_MS = 250;
const MAX_HISTORY = 100;

// =============================================================================
// Helper Functions
// =============================================================================

function tidyState(state: AppState): AppState {
  return {
    ...state,
    ui: {
      ...state.ui,
      field: {
        ...state.ui.field,
        focus: null,
      },
    },
  };
}

// Debounce helper
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  timeout: number
): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), timeout);
  }) as T;
}

// =============================================================================
// Default State
// =============================================================================

export const defaultHistoryState: HistorySliceState = {
  index: EMPTY_HISTORY_INDEX,
  histories: [],
  initialAppState: null,
};

// =============================================================================
// Slice Factory
// =============================================================================

export function createHistorySlice(
  set: (newState: Partial<HistorySlice>) => void,
  get: () => HistorySlice
): HistorySlice {
  // Debounced record function
  const debouncedRecord = debounce((state: AppState) => {
    const { histories, index } = get();
    
    const history: History = {
      state: tidyState(state),
      id: generateId("history"),
      timestamp: Date.now(),
    };
    
    // Truncate future histories and add new one
    const newHistories = [...histories.slice(0, index + 1), history];
    
    // Limit history size
    const trimmedHistories = newHistories.length > MAX_HISTORY
      ? newHistories.slice(-MAX_HISTORY)
      : newHistories;
    
    set({
      histories: trimmedHistories,
      index: trimmedHistories.length - 1,
    });
  }, DEBOUNCE_MS);
  
  return {
    ...defaultHistoryState,
    
    hasPast: () => get().index > EMPTY_HISTORY_INDEX,
    
    hasFuture: () => get().index < get().histories.length - 1,
    
    currentHistory: () => {
      const { histories, index } = get();
      return histories[index] || null;
    },
    
    prevHistory: () => {
      const { history } = get();
      return history.hasPast() ? history.histories[history.index - 1] : null;
    },
    
    nextHistory: () => {
      const s = get();
      return s.hasFuture() ? s.histories[s.index + 1] : null;
    },
    
    record: (state) => {
      debouncedRecord(state);
    },
    
    back: () => {
      const { history } = get();
      
      if (history.hasPast()) {
        const prevState = history.prevHistory()?.state || history.initialAppState;
        
        set({
          index: history.index - 1,
        });
        
        // Return the state to be dispatched
        return prevState;
      }
      
      return null;
    },
    
    forward: () => {
      const { history } = get();
      
      if (history.hasFuture()) {
        const nextState = history.nextHistory()?.state;
        
        set({
          index: history.index + 1,
        });
        
        return nextState || null;
      }
      
      return null;
    },
    
    jump: (index) => {
      const { histories } = get();
      
      if (index >= 0 && index < histories.length) {
        set({ index });
      }
    },
    
    setHistories: (histories) => {
      set({
        histories,
        index: histories.length - 1,
      });
    },
    
    setHistoryIndex: (index) => {
      const { histories } = get();
      
      if (index >= 0 && index < histories.length) {
        set({ index });
      }
    },
    
    clear: () => {
      const { initialAppState } = get();
      
      set({
        histories: initialAppState ? [{ state: initialAppState, id: generateId("history"), timestamp: Date.now() }] : [],
        index: EMPTY_HISTORY_INDEX,
      });
    },
    
    getLength: () => get().histories.length,
    
    getUndoStack: () => {
      const { histories, index } = get();
      return histories.slice(0, index).map((h) => h.state);
    },
    
    getRedoStack: () => {
      const { histories, index } = get();
      return histories.slice(index + 1).map((h) => h.state);
    },
  };
}

// =============================================================================
// React Hook for History Keyboard Shortcuts
// =============================================================================

export function useHistoryShortcuts(
  onBack: () => void,
  onForward: () => void
): void {
  // This would be called in a useEffect in the consuming component
  // to register keyboard shortcuts
}
