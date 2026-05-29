/**
 * Page content skeleton for Suspense fallback
 * Malta Gold glassmorphism loading state
 */
export function PageContentSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[60vh] bg-gradient-to-b from-[#111214] to-[#0a0b0d] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-2xl px-6">
            <div className="h-12 w-3/4 mx-auto bg-white/5 rounded-lg" />
            <div className="h-6 w-1/2 mx-auto bg-white/5 rounded-lg" />
            <div className="flex gap-4 justify-center pt-4">
              <div className="h-12 w-36 bg-[#c8a96a]/20 rounded-xl" />
              <div className="h-12 w-36 bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Content sections skeleton */}
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        {/* Features section */}
        <div className="space-y-8">
          <div className="h-8 w-48 bg-white/5 rounded-lg mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-white/5 rounded-2xl" />
            ))}
          </div>
        </div>
        
        {/* Properties section */}
        <div className="space-y-8">
          <div className="h-8 w-48 bg-white/5 rounded-lg mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 bg-white/5 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Property card skeleton
 */
export function PropertyCardSkeleton() {
  return (
    <div className="bg-[#111214] border border-[rgba(200,169,106,0.1)] rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-white/5 rounded" />
        <div className="h-4 w-1/2 bg-white/5 rounded" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-white/5 rounded-full" />
          <div className="h-6 w-16 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Sidebar skeleton for admin
 */
export function SidebarSkeleton() {
  return (
    <aside className="w-[240px] bg-gradient-to-b from-[#111214] to-[#0e0f11] border-r border-[rgba(200,169,106,0.12)] flex flex-col animate-pulse">
      <div className="p-5 border-b border-[rgba(200,169,106,0.1)] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c8a96a] to-[#9b7d3f]" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-24 bg-white/5 rounded" />
          <div className="h-2.5 w-16 bg-white/5 rounded" />
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-white/5 rounded-lg" />
        ))}
      </nav>
    </aside>
  );
}
