import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Download, Maximize2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SmartImage from "./SmartImage";

/**
 * Lightbox — full-screen image viewer.
 * - Keyboard nav (←/→/Esc)
 * - Touch swipe
 * - Preloads neighbor images
 * - Thumbnail strip with active sync + auto-scroll
 * - Caption + counter
 * - Optional download button
 */
export default function Lightbox({
  open,
  onOpenChange,
  images = [],
  index = 0,
  onIndexChange,
  title,
  allowDownload = false,
}) {
  const [i, setI] = useState(index);
  const stripRef = useRef(null);
  const touchStart = useRef(null);

  useEffect(() => { setI(index); }, [index, open]);
  useEffect(() => { onIndexChange?.(i); }, [i, onIndexChange]);

  const total = images.length;
  const next = useCallback(() => setI((p) => (p + 1) % Math.max(1, total)), [total]);
  const prev = useCallback(() => setI((p) => (p - 1 + Math.max(1, total)) % Math.max(1, total)), [total]);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") onOpenChange?.(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, next, prev, onOpenChange]);

  // Preload neighbors
  useEffect(() => {
    if (!open || total === 0) return;
    [-1, 1].forEach((d) => {
      const n = images[(i + d + total) % total];
      const src = n?.original || n?.large || n?.regular;
      if (src) { const im = new Image(); im.src = src; }
    });
  }, [i, open, images, total]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    const el = stripRef.current?.querySelector(`[data-thumb-i="${i}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [i]);

  if (total === 0) return null;
  const current = images[i] || {};
  const src = current.original || current.large || current.regular;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-screen h-screen max-h-screen bg-black border-none p-0 rounded-none">
        <div className="flex flex-col w-full h-full">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-black/80 shrink-0 z-10">
            <span className="text-white/70 text-sm font-medium truncate max-w-[40vw]">{title}</span>
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-sm tabular-nums">{i + 1} / {total}</span>
              {allowDownload && src && (
                <a href={src} target="_blank" rel="noreferrer" download className="text-white/60 hover:text-white" aria-label="Download">
                  <Download className="w-4 h-4" />
                </a>
              )}
              <button onClick={() => onOpenChange?.(false)} className="text-white/60 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image area */}
          <div
            className="flex-1 relative flex items-center justify-center bg-black overflow-hidden min-h-0"
            onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStart.current == null) return;
              const dx = e.changedTouches[0].clientX - touchStart.current;
              if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
              touchStart.current = null;
            }}
          >
            <SmartImage
              key={i}
              picture={current}
              alt={current.caption || `${title || "Photo"} ${i + 1}`}
              priority
              fit="contain"
              objectPosition="center"
              className="bg-transparent"
              imgClassName=""
              sizes="100vw"
              style={{ width: "100%", height: "100%" }}
            />

            {current.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-8 py-4 pointer-events-none">
                <p className="text-white/80 text-sm text-center italic">{current.caption}</p>
              </div>
            )}

            {total > 1 && (
              <>
                <Button variant="ghost" size="icon" onClick={prev}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/60 hover:bg-black/80 text-white rounded-full border border-white/10">
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" onClick={next}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/60 hover:bg-black/80 text-white rounded-full border border-white/10">
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail strip — virtualized via overflow + lazy SmartImage */}
          {total > 1 && (
            <div ref={stripRef} className="shrink-0 bg-black/90 border-t border-white/10 px-4 py-3">
              <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    data-thumb-i={idx}
                    onClick={() => setI(idx)}
                    className={`flex-shrink-0 rounded overflow-hidden border-2 transition-all ${idx === i ? "border-[#D4AF37] opacity-100" : "border-transparent opacity-50 hover:opacity-80"}`}
                    style={{ width: 64, height: 44 }}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <SmartImage picture={img} alt="" className="w-full h-full" sizes="64px" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
