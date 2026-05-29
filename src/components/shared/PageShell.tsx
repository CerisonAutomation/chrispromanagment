import { SiteNav } from "./SiteNav";

interface PageShellProps {
  children: React.ReactNode;
  /** Show SiteNav (default true) */
  nav?: boolean;
}

export function PageShell({ children, nav = true }: PageShellProps) {
  return (
    <div className="relative min-h-screen bg-gradient-hero">
      {nav && <SiteNav />}
      {children}
    </div>
  );
}
