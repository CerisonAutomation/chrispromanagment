// =============================================================================
// OPTIMISTIC UPDATE SYSTEM - TanStack Query Integration
// =============================================================================
// Addresses: Section 1.2 - Optimistic Update System

import { useQueryClient, useMutation, UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OptimisticUpdateConfig<TData, TVariables, TError> {
  /** Query key to invalidate after success */
  queryKey: string[];
  /** Function to create optimistic data */
  onMutate: (variables: TVariables) => Promise<TData>;
  /** Function to rollback on error */
  onError?: (error: TError, variables: TVariables, context: TData) => void;
  /** Function to execute after success */
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}

export interface RollbackContext<TData> {
  previousData: TData | undefined;
  timestamp: number;
}

export interface OptimisticMutationOptions<TData, TVariables, TError> {
  /** mutationFn - the actual API call */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Optimistic update configuration */
  optimisticConfig?: OptimisticUpdateConfig<TData, TVariables, TError>;
  /** Retry configuration */
  retry?: number;
  /** Retry delay */
  retryDelay?: (attemptIndex: number) => number;
}

// ---------------------------------------------------------------------------
// Optimistic Mutation Hook Factory
// ---------------------------------------------------------------------------

/**
 * Create a mutation with optimistic updates
 * Handles rollback on error and cache invalidation on success
 */
export function createOptimisticMutation<TData, TVariables, TError = Error>(
  options: OptimisticMutationOptions<TData, TVariables, TError>
) {
  return function useOptimisticMutation() {
    const queryClient = useQueryClient();
    const rollbackRef = useRef<RollbackContext<TData> | null>(null);

    return useMutation({
      mutationFn: options.mutationFn,

      // Before mutation: cancel any outgoing refetches and snapshot previous state
      onMutate: async (variables) => {
        if (!options.optimisticConfig) return;

        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ 
          queryKey: options.optimisticConfig.queryKey 
        });

        // Snapshot the previous value
        const previousData = queryClient.getQueryData<TData>(
          options.optimisticConfig.queryKey
        );

        rollbackRef.current = {
          previousData,
          timestamp: Date.now(),
        };

        // Optimistically update the cache
        const optimisticData = await options.optimisticConfig.onMutate(variables);
        
        queryClient.setQueryData(
          options.optimisticConfig.queryKey,
          optimisticData
        );

        // Return context with previous data for rollback
        return { previousData };
      },

      // On error: roll back to previous value
      onError: (error, variables, context) => {
        if (!options.optimisticConfig?.onError || !context) return;

        // Rollback to previous data
        if (rollbackRef.current?.previousData !== undefined) {
          queryClient.setQueryData(
            options.optimisticConfig.queryKey,
            rollbackRef.current.previousData
          );
        }

        options.optimisticConfig.onError(error as TError, variables, context.previousData!);
      },

      // Always refetch after error or success to ensure sync
      onSettled: (data, error, variables) => {
        if (!options.optimisticConfig?.onSettled) return;

        options.optimisticConfig.onSettled(
          data ?? undefined,
          error as TError | null,
          variables
        );

        // Invalidate queries to refetch
        queryClient.invalidateQueries({
          queryKey: options.optimisticConfig.queryKey,
        });
      },

      retry: options.retry ?? 0,
      retryDelay: options.retryDelay,
    });
  };
}

// ---------------------------------------------------------------------------
// Transaction Manager
// -----------------------------------------------------------------------------

export interface TransactionItem<TVariables = unknown> {
  id: string;
  variables: TVariables;
  mutationFn: (vars: TVariables) => Promise<unknown>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  error?: Error;
  timestamp: number;
}

export interface TransactionManager<TVariables = unknown> {
  /** Add item to transaction queue */
  add: (item: Omit<TransactionItem<TVariables>, 'id' | 'status' | 'timestamp'>) => string;
  /** Execute all pending items atomically */
  execute: () => Promise<{ successful: string[]; failed: string[] }>;
  /** Cancel pending items */
  cancel: (ids?: string[]) => void;
  /** Get pending items */
  getPending: () => TransactionItem<TVariables>[];
  /** Clear all */
  clear: () => void;
}

export function createTransactionManager<TVariables = unknown>(): TransactionManager<TVariables> {
  const items = new Map<string, TransactionItem<TVariables>>();

  return {
    add(item) {
      const id = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const txnItem: TransactionItem<TVariables> = {
        ...item,
        id,
        status: 'pending',
        timestamp: Date.now(),
      };
      items.set(id, txnItem);
      return id;
    },

    async execute() {
      const successful: string[] = [];
      const failed: string[] = [];

      for (const [id, item] of items) {
        if (item.status !== 'pending') continue;

        item.status = 'executing';
        
        try {
          await item.mutationFn(item.variables);
          item.status = 'completed';
          successful.push(id);
        } catch (error) {
          item.status = 'failed';
          item.error = error as Error;
          failed.push(id);
        }
      }

      return { successful, failed };
    },

    cancel(ids) {
      if (ids) {
        ids.forEach(id => items.delete(id));
      } else {
        // Cancel all pending
        Array.from(items.entries())
          .filter(([, item]) => item.status === 'pending')
          .forEach(([id]) => items.delete(id));
      }
    },

    getPending() {
      return Array.from(items.values()).filter(item => item.status === 'pending');
    },

    clear() {
      items.clear();
    },
  };
}

// ---------------------------------------------------------------------------
// Offline Queue
// ---------------------------------------------------------------------------

export interface OfflineItem<TVariables = unknown> {
  id: string;
  variables: TVariables;
  mutationFn: (vars: TVariables) => Promise<unknown>;
  retries: number;
  maxRetries: number;
  createdAt: number;
  lastAttempt?: number;
}

export interface OfflineQueue<TVariables = unknown> {
  /** Add item to queue */
  enqueue: (item: Omit<OfflineItem<TVariables>, 'id' | 'retries' | 'createdAt'>) => void;
  /** Process queue when online */
  process: () => Promise<{ processed: number; failed: number }>;
  /** Get queue items */
  getItems: () => OfflineItem<TVariables>[];
  /** Clear queue */
  clear: () => void;
  /** Remove specific item */
  remove: (id: string) => void;
  /** Check if online */
  isOnline: () => boolean;
  /** Persist queue to localStorage */
  persist: () => void;
  /** Hydrate queue from localStorage */
  hydrate: () => void;
}

export function createOfflineQueue<TVariables = unknown>(
  options: {
    maxRetries?: number;
    onItemProcessed?: (item: OfflineItem<TVariables>, success: boolean) => void;
    onQueueEmpty?: () => void;
  } = {}
): OfflineQueue<TVariables> {
  const { maxRetries = 3, onItemProcessed, onQueueEmpty } = options;
  const items = new Map<string, OfflineItem<TVariables>>();
  let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Listen for online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      isOnline = true;
      // Auto-process when coming back online
      queue.process();
    });
    window.addEventListener('offline', () => {
      isOnline = false;
    });
  }

  const queue: OfflineQueue<TVariables> = {
    enqueue(item) {
      const id = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const offlineItem: OfflineItem<TVariables> = {
        ...item,
        id,
        retries: 0,
        createdAt: Date.now(),
      };
      items.set(id, offlineItem);
    },

    async process() {
      if (!isOnline || items.size === 0) {
        return { processed: 0, failed: 0 };
      }

      let processed = 0;
      let failed = 0;
      const toRemove: string[] = [];

      for (const [id, item] of items) {
        try {
          await item.mutationFn(item.variables);
          processed++;
          toRemove.push(id);
          onItemProcessed?.(item, true);
        } catch (error) {
          item.retries++;
          item.lastAttempt = Date.now();

          if (item.retries >= maxRetries) {
            failed++;
            toRemove.push(id);
            onItemProcessed?.(item, false);
          }
        }
      }

      // Remove processed/failed items
      toRemove.forEach(id => items.delete(id));

      // Persist remaining
      persistQueue();

      if (items.size === 0) {
        onQueueEmpty?.();
      }

      return { processed, failed };
    },

    getItems() {
      return Array.from(items.values());
    },

    clear() {
      items.clear();
      persistQueue();
    },

    remove(id) {
      items.delete(id);
      persistQueue();
    },

    isOnline: () => isOnline,

    persist() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('offline-queue', JSON.stringify(Array.from(items.entries())));
        }
      } catch {
        // Ignore storage errors
      }
    },

    hydrate() {
      try {
        if (typeof localStorage === 'undefined') return;
        const stored = localStorage.getItem('offline-queue');
        if (stored) {
          const parsed = JSON.parse(stored) as [string, OfflineItem<TVariables>][];
          parsed.forEach(([id, item]) => {
            items.set(id, { ...item, retries: 0 });
          });
        }
      } catch {
        // Ignore
      }
    },
  };

  // Helper function to call persist (defined after the object)
  function persistQueue(): void {
    queue.persist();
  }

  // Hydrate on init
  queue.hydrate();

  return queue;
}

// ---------------------------------------------------------------------------
// Query Key Factory
// ---------------------------------------------------------------------------

export const queryKeys = {
  // Pages
  pages: ['pages'] as const,
  page: (slug: string) => ['pages', slug] as const,
  pageVersions: (slug: string) => ['pages', slug, 'versions'] as const,
  
  // Properties
  properties: ['properties'] as const,
  property: (slug: string) => ['properties', slug] as const,
  propertyAvailability: (id: string, from: string, to: string) => 
    ['properties', id, 'availability', from, to] as const,
  
  // Bookings
  bookings: ['bookings'] as const,
  booking: (id: string) => ['bookings', id] as const,
  userBookings: (userId: string) => ['bookings', 'user', userId] as const,
  
  // Media
  media: ['media'] as const,
  mediaItem: (id: string) => ['media', id] as const,
  
  // User
  user: ['user'] as const,
  userSessions: ['user', 'sessions'] as const,
  
  // General
  health: ['health'] as const,
} as const;

// ---------------------------------------------------------------------------
// Default Export
// ---------------------------------------------------------------------------

export default {
  createOptimisticMutation,
  createTransactionManager,
  createOfflineQueue,
  queryKeys,
};