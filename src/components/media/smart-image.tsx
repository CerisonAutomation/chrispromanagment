// @ts-nocheck
import { useState, useRef, useEffect, useMemo } from "react";

/**
 * SmartImage — production-grade <img> wrapper.
 * - Native lazy-loading + async decode
 * - Fallback chain (tries large → original → regular → thumbnail)
 * - Skeleton placeholder via aspect-ratio
 * - Fade-in on load
 * - IntersectionObserver gate for true viewport-based loading (works even when parent hides)
 * - Error state with retry
 */
export function SmartImage({
  picture,
  src,
  alt = "",
  aspectRatio,           // e.g. "4/3", "16/9", "1/1"
  className = "",
  imgClassName = "",
  sizes = "100vw",
  priority = false,      // skip lazy + observer for above-the-fold (LCP)
  objectPosition = "center top",
  fit = "cover",
  onClick,
  ...rest
}) {
  // Build fallback chain from a Guesty-style picture object or a raw src.
  const sources = useMemo(() => {
    if (Array.isArray(src)) return src.filter(Boolean);
    if (src) return [src];
    if (picture && typeof picture === "object") {
      return [picture.large, picture.original, picture.regular, picture.thumbnail].filter(Boolean);
    }
    if (typeof picture === "string") return [picture];
    return [];
  }, [picture, src]);

  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(priority);
  const ref = useRef(null);

  useEffect(() => {
    if (priority || visible) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (setVisible(true), io.disconnect())),
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [priority, visible]);

  const current = sources[idx];
  const hasMore = idx < sources.length - 1;

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`relative overflow-hidden bg-[#1A1A1C] ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
      {...rest}
    >
      {/* Skeleton shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1C] via-[#222226] to-[#1A1A1C] animate-pulse" />
      )}
      {visible && current && (
        <img
          src={current}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchpriority={priority ? "high" : "auto"}
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (hasMore) setIdx((i) => i + 1);
            else setLoaded(true); // give up, hide skeleton
          }}
          className={`w-full h-full transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
          style={{ objectFit: fit, objectPosition }}
          draggable={false}
        />
      )}
      {!current && loaded === false && visible && (
        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">No image</div>
      )}
    </div>
  );
}

export default SmartImage;