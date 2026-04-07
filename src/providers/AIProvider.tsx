/**
 * @file AIProvider — Consolidated client-side AI context provider.
 * Wraps QueryClientProvider, SessionProvider, and future AI state.
 * Single import in layout.tsx replaces scattered provider imports.
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { useMemo, type ReactNode } from 'react';

interface AIProviderProps {
  children: ReactNode;
  session?: Parameters<typeof SessionProvider>[0]['session'];
}

/**
 * Root provider consolidating all client-side context.
 * Place once in src/app/layout.tsx — replaces all individual providers.
 */
export function AIProvider({ children, session }: AIProviderProps): JSX.Element {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              if (error instanceof Error && error.message.includes('401')) return false;
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      }),
    []
  );

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </QueryClientProvider>
    </SessionProvider>
  );
}
