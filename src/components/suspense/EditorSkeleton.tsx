/**
 * @fileoverview EditorSkeleton — skeleton for Puck editor loading state.
 */
export function EditorSkeleton() {
  return (
    <div className="flex h-screen animate-pulse" aria-hidden="true">
      {/* Left panel */}
      <div className="w-64 border-r border-border bg-muted/30 space-y-3 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-muted" />
        ))}
      </div>
      {/* Canvas */}
      <div className="flex-1 bg-muted/10 p-8 space-y-6">
        <div className="h-16 w-1/2 mx-auto rounded-xl bg-muted" />
        <div className="h-48 rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 rounded-xl bg-muted" />
          <div className="h-32 rounded-xl bg-muted" />
        </div>
      </div>
      {/* Right panel */}
      <div className="w-72 border-l border-border bg-muted/30 space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
