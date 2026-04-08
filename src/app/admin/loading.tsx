/**
 * Admin loading state — glassmorphism sidebar + content skeleton.
 */
export default function AdminLoading() {
  return (
    <div className="admin-layout flex min-h-screen bg-[#0a0b0d]">
      {/* Sidebar skeleton */}
      <aside className="w-[240px] bg-gradient-to-b from-[#111214] to-[#0e0f11] border-r border-[rgba(200,169,106,0.12)] flex flex-col">
        {/* Brand skeleton */}
        <div className="p-5 border-b border-[rgba(200,169,106,0.1)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c8a96a] to-[#9b7d3f] animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-white/5 rounded animate-pulse" />
            <div className="h-2.5 w-16 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
        {/* Nav skeleton */}
        <nav className="flex-1 p-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </nav>
        {/* User skeleton */}
        <div className="p-3 border-t border-[rgba(200,169,106,0.1)]">
          <div className="flex items-center gap-2.5 p-2 bg-white/[0.03] rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c8a96a] to-[#9b7d3f] animate-pulse" />
            <div className="space-y-1">
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-[#c8a96a]/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </aside>
      {/* Main content skeleton */}
      <main className="flex-1 p-8 space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
      </main>
    </div>
  );
}
