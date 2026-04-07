'use client';
/**
 * @fileoverview Root provider tree — compose all context providers here.
 * Import { Providers } in layout.tsx only.
 */
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgb(26,27,31)',
            border: '1px solid rgb(42,43,48)',
            color: 'rgb(232,228,220)',
          },
        }}
      />
    </>
  );
}
