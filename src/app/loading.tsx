/**
 * Root loading state — Malta Gold glassmorphism skeleton.
 * Shows immediately while Server Components stream in.
 */
export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
      <div className="relative">
        {/* Animated logo */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#c8a96a] to-[#9b7d3f] animate-pulse flex items-center justify-center text-2xl shadow-[0_0_40px_rgba(200,169,106,0.4)]">
          ✦
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="absolute -top-2 left-1/2 w-2 h-2 bg-[#c8a96a] rounded-full" />
        </div>
        <p className="mt-6 text-sm text-[rgba(232,228,220,0.4)] text-center font-medium tracking-wide">
          Christiano CMS
        </p>
      </div>
    </div>
  );
}
