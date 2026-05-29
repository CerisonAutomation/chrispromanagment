/**
 * 404 Not Found page — Malta Gold glassmorphism design.
 */
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-6">
      <div className="text-center space-y-8">
        {/* 404 Display */}
        <div className="relative">
          <div className="text-[120px] font-bold leading-none bg-gradient-to-b from-[#c8a96a] to-[#9b7d3f] bg-clip-text text-transparent">
            404
          </div>
          <div className="absolute inset-0 blur-3xl bg-[#c8a96a]/20 -z-10" />
        </div>
        
        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-[#e8e4dc]">
            Page not found
          </h1>
          <p className="text-[rgba(232,228,220,0.5)] max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#c8a96a] to-[#9b7d3f] text-[#0e0f11] font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            ← Go home
          </Link>
          <Link
            href="/properties"
            className="inline-flex items-center justify-center px-6 py-3 border border-[rgba(200,169,106,0.3)] text-[#c8a96a] font-semibold rounded-xl hover:bg-[rgba(200,169,106,0.1)] transition-colors"
          >
            View properties
          </Link>
        </div>
      </div>
    </div>
  );
}
