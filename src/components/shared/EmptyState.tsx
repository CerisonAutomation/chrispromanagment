import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  body?: string;
  /** Optional CTA link */
  action?: { label: string; to: string };
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="col-span-full rounded-2xl border border-border/40 bg-card/30 px-10 py-16 text-center">
      <p className="font-display text-xl">{title}</p>
      {body && <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{body}</p>}
      {action && (
        <Button asChild variant="gold" size="sm" className="mt-6">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
