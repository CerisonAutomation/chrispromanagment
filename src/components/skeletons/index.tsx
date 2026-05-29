import { cn } from "@/lib/utils";

// ─── Primitive ────────────────────────────────────────────────────────────────
function Sk({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

// ─── Property card skeleton ────────────────────────────────────────────────────
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
      <Sk className="aspect-[4/3] w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Sk className="h-3 w-20" />
        <Sk className="h-5 w-3/4" />
        <div className="flex gap-4">
          <Sk className="h-3 w-14" />
          <Sk className="h-3 w-10" />
        </div>
        <Sk className="h-8 w-full rounded-lg mt-4" />
      </div>
    </div>
  );
}

// ─── Booking grid skeleton ─────────────────────────────────────────────────────
export function BookingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Listing detail skeleton ───────────────────────────────────────────────────
export function ListingDetailSkeleton() {
  return (
    <div className="container pb-24 animate-fade-in">
      {/* Gallery */}
      <Sk className="mb-10 aspect-[16/9] w-full rounded-2xl" />

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {/* Title block */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Sk className="h-3 w-24" />
              <Sk className="h-3 w-16" />
            </div>
            <Sk className="h-8 w-2/3" />
            <div className="flex gap-6">
              <Sk className="h-4 w-24" />
              <Sk className="h-4 w-20" />
              <Sk className="h-4 w-28" />
            </div>
          </div>
          {/* Description */}
          <div className="space-y-2">
            <Sk className="h-5 w-40" />
            <Sk className="h-4 w-full" />
            <Sk className="h-4 w-5/6" />
            <Sk className="h-4 w-4/5" />
          </div>
          {/* Amenities */}
          <div className="space-y-3">
            <Sk className="h-5 w-32" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Sk key={i} className="h-10 rounded-lg" />)}
            </div>
          </div>
          {/* Calendar */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Sk className="h-64 rounded-xl" />
            <Sk className="h-64 rounded-xl" />
          </div>
        </div>
        {/* Booking card */}
        <Sk className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Stats bar skeleton ────────────────────────────────────────────────────────
export function StatsBarSkeleton() {
  return (
    <div className="border-y border-border/40 bg-card/20">
      <div className="container grid grid-cols-2 gap-px py-10 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-6 flex flex-col items-center gap-2">
            <Sk className="h-8 w-16" />
            <Sk className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Testimonial skeleton ──────────────────────────────────────────────────────
export function TestimonialSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-card/30 p-6 space-y-3">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => <Sk key={i} className="h-4 w-4 rounded" />)}
      </div>
      <Sk className="h-4 w-full" />
      <Sk className="h-4 w-5/6" />
      <Sk className="h-4 w-3/4" />
      <div className="pt-2 space-y-1">
        <Sk className="h-4 w-24" />
        <Sk className="h-3 w-16" />
      </div>
    </div>
  );
}

// ─── Inquiry row skeleton ──────────────────────────────────────────────────────
export function InquiryRowSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Sk className="h-6 w-40" />
        <Sk className="h-4 w-32" />
      </div>
      <Sk className="h-4 w-48" />
      <div className="grid gap-2 sm:grid-cols-3">
        <Sk className="h-4 w-full" />
        <Sk className="h-4 w-full" />
        <Sk className="h-4 w-full" />
      </div>
    </div>
  );
}

// ─── CMS block skeleton ────────────────────────────────────────────────────────
export function CmsBlockSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/30 bg-card/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <Sk className="h-2 w-2 rounded-full" />
            <Sk className="h-4 w-48" />
            <Sk className="h-4 w-16 rounded-full" />
            <div className="ml-auto flex gap-2">
              <Sk className="h-7 w-7 rounded-md" />
              <Sk className="h-7 w-16 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
