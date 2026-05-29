// =============================================================================
// CANONICAL PUCK USE-OPTIMISTIC HOOK
// Immediate UI updates with automatic rollback on failure
// =============================================================================

import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface OptimisticUpdate<TData, TVariables, TResult = TData> {
  queryKey: string[];
  optimisticData: TData;
  receiveData?: (result: TResult) => TData;
  rollback?: (previousData: TData | undefined) => TData;
}

/**
 * Hook for optimistic updates with automatic rollback
 */
export function useOptimisticUpdate<
  TData,
  TVariables,
  TResult = TData
>({
  queryKey,
  optimisticData,
  receiveData,
  rollback,
  mutationFn,
  onSuccess,
  onError,
  onSettled,
}: OptimisticUpdate<TData, TVariables, TResult> & {
  mutationFn: (variables: TVariables) => Promise<TResult>;
  onSuccess?: (data: TResult) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}) {
  const queryClient = useQueryClient();
  const previousDataRef = useRef<TData | undefined>(undefined);

  const mutation = useMutation({
    mutationFn,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      previousDataRef.current = queryClient.getQueryData<TData>(queryKey);
      queryClient.setQueryData<TData>(queryKey, optimisticData);
    },
    onSuccess: (data) => {
      if (receiveData) {
        queryClient.setQueryData<TData>(queryKey, receiveData(data));
      }
      onSuccess?.(data);
    },
    onError: () => {
      if (previousDataRef.current !== undefined) {
        queryClient.setQueryData<TData>(
          queryKey,
          rollback ? rollback(previousDataRef.current) : previousDataRef.current
        );
      }
      onError?.(new Error("Mutation failed"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      onSettled?.();
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Simple optimistic toggle for boolean state
 */
export function useOptimisticToggle({
  queryKey,
  value,
  mutationFn,
  onSuccess,
  onError,
}: {
  queryKey: string[];
  value: boolean;
  mutationFn: () => Promise<void>;
  onSuccess?: () => void;
  onError?: () => void;
}) {
  const queryClient = useQueryClient();
  const previousValue = useRef(value);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      previousValue.current = value;
      await mutationFn();
    },
    onMutate: () => {
      queryClient.setQueryData(queryKey, (old: unknown) => {
        if (typeof old === 'object' && old !== null) {
          return { ...(old as object), status: !value };
        }
        return !value;
      });
    },
    onError: () => {
      queryClient.setQueryData(queryKey, (old: unknown) => {
        if (typeof old === 'object' && old !== null) {
          return { ...(old as object), status: value };
        }
        return value;
      });
      onError?.();
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { toggle: mutate, isPending };
}
