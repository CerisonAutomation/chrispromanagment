// =============================================================================
// AUTOCOMPLETE SERVICE - Production-grade implementation
// =============================================================================

import type {
  AIAutocompleteRequest,
  AIAutocompleteResponse,
  AutocompleteConfig,
  AutocompleteContext,
  AutocompleteEvent,
  AutocompleteEventHandler,
  AutocompleteHistory,
  AutocompleteHistoryItem,
  AutocompleteItem,
  AutocompleteProvider,
  AutocompleteState,
  MatchResult,
} from './types';
import {defaultAutocompleteConfig} from './types';

import {groupByCategory, searchItems} from './fuzzy-match';
import {aiRateLimiter, apiClient} from '@/infrastructure/complete-cache-api';
import {useCallback, useEffect, useRef, useState} from 'react';

// ---------------------------------------------------------------------------
// DEBOUNCE UTIL
// ---------------------------------------------------------------------------

function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ---------------------------------------------------------------------------
// HISTORY MANAGEMENT
// ---------------------------------------------------------------------------

class AutocompleteHistoryManager implements AutocompleteHistory {
  items: AutocompleteHistoryItem[] = [];
  maxSize: number = 100;
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
    this.loadFromStorage();
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('autocomplete-history');
      if (stored) {
        this.items = JSON.parse(stored);
      }
    } catch {
      // Ignore storage errors
    }
  }
  
  private saveToStorage(): void {
    try {
      localStorage.setItem('autocomplete-history', JSON.stringify(this.items));
    } catch {
      // Ignore storage errors
    }
  }
  
  add(item: AutocompleteItem): AutocompleteHistory {
    const existingIndex = this.items.findIndex(h => h.item.id === item.id);
    
    if (existingIndex !== -1) {
      // Update existing
      const existing = this.items[existingIndex];
      this.items[existingIndex] = {
        ...existing,
        usedAt: Date.now(),
        useCount: existing.useCount + 1,
      };
    } else {
      // Add new
      this.items.push({
        item,
        usedAt: Date.now(),
        useCount: 1,
      });
    }
    
    // Sort by recency and trim
    this.items.sort((a, b) => b.usedAt - a.usedAt);
    this.items = this.items.slice(0, this.maxSize);
    
    this.saveToStorage();
    return this;
  }
  
  getRecent(limit: number = 10): readonly AutocompleteHistoryItem[] {
    return this.items.slice(0, limit);
  }
  
  getFavorites(): readonly AutocompleteHistoryItem[] {
    return this.items
      .filter(h => h.item.metadata.favorite || h.useCount > 5)
      .sort((a, b) => b.useCount - a.useCount);
  }
  
  clear(): AutocompleteHistory {
    this.items = [];
    this.saveToStorage();
    return this;
  }
}

// ---------------------------------------------------------------------------
// AUTOCOMPLETE SERVICE
// ---------------------------------------------------------------------------

export class AutocompleteService {
  private providers: Map<string, AutocompleteProvider> = new Map();
  private state: AutocompleteState = {
    isOpen: false,
    items: [],
    selectedIndex: 0,
    context: null,
    loading: false,
    error: null,
    source: 'local',
  };
  private config: AutocompleteConfig;
  private history: AutocompleteHistoryManager;
  private eventHandlers: Set<AutocompleteEventHandler> = new Set();
  private debouncedSearch: (query: string) => void;
  private abortController: AbortController | null = null;
  
  constructor(config: Partial<AutocompleteConfig> = {}) {
    this.config = { ...defaultAutocompleteConfig, ...config };
    this.history = new AutocompleteHistoryManager();
    
    this.debouncedSearch = debounce(
      (query: string) => this.performSearch(query),
      this.config.debounceMs
    );
  }
  
  // Register a provider
  registerProvider(provider: AutocompleteProvider): void {
    this.providers.set(provider.id, provider);
  }
  
  // Unregister a provider
  unregisterProvider(providerId: string): void {
    this.providers.delete(providerId);
  }
  
  // Open autocomplete
  async open(context: AutocompleteContext): Promise<void> {
    this.abortController?.abort();
    this.abortController = new AbortController();
    
    this.state = {
      ...this.state,
      isOpen: true,
      context,
      loading: true,
      error: null,
      selectedIndex: 0,
    };
    
    this.emitEvent({ type: 'open', timestamp: Date.now(), context });
    
    try {
      const items = await this.fetchSuggestions(context);
      
      this.state = {
        ...this.state,
        items,
        loading: false,
      };
      
      this.emitEvent({ type: 'items-update', timestamp: Date.now(), context, data: { count: items.length } });
    } catch (error) {
      this.state = {
        ...this.state,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      this.emitEvent({ type: 'error', timestamp: Date.now(), context, data: { error } });
    }
  }
  
  // Close autocomplete
  close(): void {
    this.abortController?.abort();
    this.abortController = null;
    
    this.state = {
      ...this.state,
      isOpen: false,
      items: [],
      context: null,
      loading: false,
    };
    
    if (this.state.context) {
      this.emitEvent({ type: 'close', timestamp: Date.now(), context: this.state.context });
    }
  }
  
  // Update query (called while typing)
  updateQuery(query: string): void {
    if (!this.state.isOpen || !this.state.context) return;
    
    const context: AutocompleteContext = {
      ...this.state.context,
      query,
    };
    
    this.state = {
      ...this.state,
      context,
      loading: true,
    };
    
    this.emitEvent({ type: 'query-change', timestamp: Date.now(), context });
    
    if (query.length < this.config.minQueryLength) {
      // Show recent/favorite items
      const recent = this.history.getRecent(10);
      this.state = {
        ...this.state,
        items: recent.map(h => ({
          ...h.item,
          metadata: { ...h.item.metadata, recent: true },
        })),
        loading: false,
      };
      return;
    }
    
    this.debouncedSearch(query);
  }
  
  // Perform actual search
  private async performSearch(query: string): Promise<void> {
    if (!this.state.context) return;
    
    try {
      const items = await this.fetchSuggestions(this.state.context);
      
      // Apply fuzzy search if enabled
      let results = items;
      if (this.config.enableFuzzy && query.length >= this.config.minQueryLength) {
        const matches = searchItems(items, query, this.config.fuzzyOptions, this.config.maxResults);
        results = matches.map(m => m.item);
      }
      
      this.state = {
        ...this.state,
        items: results,
        loading: false,
      };
      
      this.emitEvent({ type: 'items-update', timestamp: Date.now(), context: this.state.context, data: { count: results.length } });
    } catch (error) {
      this.state = {
        ...this.state,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  }
  
  // Fetch suggestions from all providers
  private async fetchSuggestions(context: AutocompleteContext): Promise<readonly AutocompleteItem[]> {
    const allItems: AutocompleteItem[] = [];
    const signal = this.abortController?.signal;
    
    // Get providers in priority order
    const providerIds = this.config.providers;
    
    for (const providerId of providerIds) {
      const provider = this.providers.get(providerId);
      if (!provider) continue;
      
      if (!provider.canActivate(context)) continue;
      
      try {
        const result = await provider.getSuggestions(context);
        
        if (result.success) {
          allItems.push(...result.data);
        }
      } catch {
        // Ignore provider errors
      }
      
      if (signal?.aborted) break;
    }
    
    // Deduplicate by ID
    const uniqueItems = new Map<string, AutocompleteItem>();
    for (const item of allItems) {
      if (!uniqueItems.has(item.id)) {
        uniqueItems.set(item.id, item);
      }
    }
    
    return Array.from(uniqueItems.values());
  }
  
  // Fetch AI suggestions
  async fetchAISuggestions(request: AIAutocompleteRequest): Promise<AIAutocompleteResponse | null> {
    if (!this.config.enableAI) return null;
    if (!aiRateLimiter.canExecute()) {
      console.warn('AI rate limit exceeded');
      return null;
    }
    
    try {
      const startTime = Date.now();
      
      const response = await apiClient.post<AIAutocompleteResponse>('/ai/autocomplete', request);
      
      if (response.success) {
        aiRateLimiter.recordRequest();
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('AI autocomplete error:', error);
      return null;
    }
  }
  
  // Select item by index
  selectIndex(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.state.items.length - 1));
    
    this.state = {
      ...this.state,
      selectedIndex: clamped,
    };
    
    const selected = this.state.items[clamped];
    if (selected && this.state.context) {
      this.emitEvent({ type: 'select', timestamp: Date.now(), context: this.state.context, data: { item: selected } });
    }
  }
  
  // Select next item
  selectNext(): void {
    this.selectIndex(this.state.selectedIndex + 1);
  }
  
  // Select previous item
  selectPrev(): void {
    this.selectIndex(this.state.selectedIndex - 1);
  }
  
  // Select first item
  selectFirst(): void {
    this.selectIndex(0);
  }
  
  // Select last item
  selectLast(): void {
    this.selectIndex(this.state.items.length - 1);
  }
  
  // Confirm selection
  confirm(stayOpen: boolean = false): AutocompleteItem | null {
    const selected = this.state.items[this.state.selectedIndex];
    if (!selected || !this.state.context) return null;
    
    // Add to history
    this.history.add(selected);
    
    this.emitEvent({ type: 'confirm', timestamp: Date.now(), context: this.state.context, data: { item: selected } });
    
    if (!stayOpen) {
      this.close();
    }
    
    return selected;
  }
  
  // Cancel autocomplete
  cancel(): void {
    if (this.state.context) {
      this.emitEvent({ type: 'cancel', timestamp: Date.now(), context: this.state.context });
    }
    this.close();
  }
  
  // Subscribe to events
  subscribe(handler: AutocompleteEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }
  
  // Emit event
  private emitEvent(event: AutocompleteEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch {
        // Ignore handler errors
      }
    }
  }
  
  // Get current state
  getState(): AutocompleteState {
    return this.state;
  }
  
  // Get history
  getHistory(): AutocompleteHistory {
    return this.history;
  }
  
  // Group items by category
  getGroupedItems(): ReturnType<typeof groupByCategory> {
    const matches: MatchResult[] = this.state.items.map(item => ({
      item,
      score: item.priority / 100,
      matches: [],
    }));
    return groupByCategory(matches);
  }
}

// Singleton instance
export const autocompleteService = new AutocompleteService();

// ---------------------------------------------------------------------------
// REACT HOOK
// ---------------------------------------------------------------------------

export function useAutocomplete() {
  const [state, setState] = useState<AutocompleteState>(autocompleteService.getState());
  const serviceRef = useRef(autocompleteService);
  
  useEffect(() => {
    const unsubscribe = serviceRef.current.subscribe(() => {
      setState(serviceRef.current.getState());
    });
    
    return unsubscribe;
  }, []);
  
  const open = useCallback((context: AutocompleteContext) => {
    return serviceRef.current.open(context);
  }, []);
  
  const close = useCallback(() => {
    serviceRef.current.close();
  }, []);
  
  const updateQuery = useCallback((query: string) => {
    serviceRef.current.updateQuery(query);
  }, []);
  
  const selectNext = useCallback(() => {
    serviceRef.current.selectNext();
  }, []);
  
  const selectPrev = useCallback(() => {
    serviceRef.current.selectPrev();
  }, []);
  
  const confirm = useCallback((stayOpen?: boolean) => {
    return serviceRef.current.confirm(stayOpen);
  }, []);
  
  const cancel = useCallback(() => {
    serviceRef.current.cancel();
  }, []);
  
  return {
    state,
    open,
    close,
    updateQuery,
    selectNext,
    selectPrev,
    confirm,
    cancel,
    service: serviceRef.current,
  };
}
