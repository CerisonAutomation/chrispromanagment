import { Loader2 } from "lucide-react";

export function PageSpinner() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-hero">
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
    </div>
  );
}

/** Inline spinner for buttons / smaller contexts */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className ?? "h-4 w-4"}`} />;
}
