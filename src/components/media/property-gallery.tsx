import { useState, useMemo } from "react";
import { Grid3x3, ChevronLeft, ChevronRight } from "lucide-react";
import SmartImage from "./SmartImage";
import Lightbox from "./Lightbox";

/**
 * PropertyGallery — Airbnb-style responsive gallery.
 * - Mobile: single hero image with swipe + dots, "View all" CTA
 * - Desktop: 1 large + 2x2 grid (5 visible), "+N photos" overlay on last tile
 * - Click any tile → opens Lightbox at that index
 * - First image is LCP-prioritized
 * - All other tiles lazy-loaded
 */
export default function PropertyGallery({ images = [], title = "" }) {
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [mobileIdx, setMobileIdx] = useState(0);

  const list = useMemo(() => images.filter(Boolean), [images]);
  if (list.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-6">
        <SmartImage picture={null} alt="" aspectRatio="16/9" className="rounded-md" />
      </section>
    );
  }

  const openAt = (i) => { setStartIndex(i); setOpen(true); };
  const desktopTiles = list.slice(0, 5);
  const extra = Math.max(0, list.length - 5);

  return (
    <section className="relative" data-testid="property-gallery">
      {/* Mobile: hero + swipe */}
      <div className="md:hidden relative max-w-7xl mx-auto">
        <SmartImage
          picture={list[mobileIdx]}
          alt={`${title} photo ${mobileIdx + 1}`}
          priority={mobileIdx === 0}
          aspectRatio="4/3"
          onClick={() => openAt(mobileIdx)}
          sizes="100vw"
        />
        {list.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setMobileIdx((p) => (p - 1 + list.length) % list.length); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setMobileIdx((p) => (p + 1) % list.length); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 text-white text-xs tabular-nums">
              {mobileIdx + 1} / {list.length}
            </div>
          </>
        )}
      </div>

      {/* Desktop: Airbnb 5-grid */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-6">
        <div
          className="grid gap-2 rounded-lg overflow-hidden"
          style={{ gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "300px 300px" }}
        >
          {desktopTiles.map((img, i) => (
            <div
              key={i}
              className="relative"
              style={i === 0 ? { gridColumn: 1, gridRow: "1 / 3" } : undefined}
            >
              <SmartImage
                picture={img}
                alt={`${title} photo ${i + 1}`}
                priority={i === 0}
                className="w-full h-full"
                sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                onClick={() => openAt(i)}
              />
              {i === 4 && extra > 0 && (
                <button
                  onClick={() => openAt(0)}
                  className="absolute inset-0 bg-black/55 hover:bg-black/65 transition-colors flex items-center justify-center text-white font-semibold text-lg"
                >
                  +{extra} more
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Show-all button (both viewports) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-4 md:pb-2">
        <button
          onClick={() => openAt(0)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#161618] border border-white/10 text-[#F5F5F0] text-sm hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all rounded-md"
          data-testid="view-all-photos-btn"
        >
          <Grid3x3 className="w-4 h-4" />
          Show all {list.length} photos
        </button>
      </div>

      <Lightbox
        open={open}
        onOpenChange={setOpen}
        images={list}
        index={startIndex}
        title={title}
      />
    </section>
  );
}
