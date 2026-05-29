/**
 * Pages admin loading state.
 */
export default function PagesLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-10 w-28 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse flex items-center px-4 gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
