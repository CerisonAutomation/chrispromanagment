import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title: string;
  message?: string;
  hint?: string;
}

export function ErrorState({ title, message, hint }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <div className="font-medium text-destructive-foreground">{title}</div>
          {message && <div className="mt-1 text-sm text-muted-foreground">{message}</div>}
          {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
        </div>
      </div>
    </div>
  );
}
