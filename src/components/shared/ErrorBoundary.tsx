import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props  { children: ReactNode; fallback?: ReactNode }
interface State  { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : "Unknown error" };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    // In production, send to observability layer (Sentry, etc.)
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="grid min-h-screen place-items-center bg-gradient-hero p-6 text-center">
          <div className="max-w-md">
            <div className="font-display text-5xl text-destructive/60">⚠</div>
            <h1 className="mt-4 font-display text-2xl">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">{this.state.message}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => window.location.reload()} variant="gold">
                Reload page
              </Button>
              <Button onClick={() => window.location.assign("/")} variant="outline">
                Go home
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
