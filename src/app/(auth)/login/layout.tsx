/**
 * Login layout — NO auth check to prevent redirect loop.
 * This layout overrides the parent admin/layout.tsx.
 */
import type { ReactNode } from 'react';

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
