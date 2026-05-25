// Top-level error boundary (P5). Logs to console + surfaces friendly UI.
import React from "react";

export class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info?.componentStack);
    // Best-effort: post to optional client-error logger; ignore failures.
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/client-errors`;
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: String(error?.message || error),
          stack: String(error?.stack || ""),
          componentStack: String(info?.componentStack || ""),
          url: typeof window !== "undefined" ? window.location.href : "",
          ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F10] text-[#F5F5F0] p-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-xs uppercase tracking-widest text-[#D4AF37]">Something went wrong</p>
          <h1 className="text-2xl font-serif">We hit an unexpected error.</h1>
          <p className="text-sm text-[#A1A1AA]">
            The team has been notified. Try reloading — your work is safe.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#D4AF37] text-[#0F0F10] text-sm font-medium hover:bg-[#E5C158]"
            >
              Reload page
            </button>
            <button
              onClick={this.reset}
              className="px-4 py-2 border border-white/15 text-sm hover:bg-white/5"
            >
              Try again
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre className="text-left text-[10px] text-[#71717A] mt-4 overflow-auto max-h-48 p-3 bg-black/40 rounded">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
