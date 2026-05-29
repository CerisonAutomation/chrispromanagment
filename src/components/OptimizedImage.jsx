import { useEffect, useRef, useState } from "react";

/**
 * OptimizedImage — lazy loaded via IntersectionObserver, with srcset/sizes
 * support, graceful fallback, and a low-quality placeholder while loading.
 *
 * Drop-in replacement for <img>. Use everywhere we used a plain <img>.
 *
 * Props:
 *   - src: required main image URL (largest variant)
 *   - srcSet: optional srcset string
 *   - sizes: optional sizes string
 *   - alt: required alt text
 *   - aspectRatio: e.g. "4/3", "16/9", "1/1" — keeps layout stable while loading
 *   - placeholder: optional low-quality image URL (or default skeleton)
 *   - className: applied to the <img>
 *   - wrapperClassName: applied to wrapper div
 *   - eager: if true, skips IntersectionObserver and loads immediately (above-the-fold hero)
 *   - onLoad / onError: forwarded handlers
 */
export const OptimizedImage = ({
  src,
  srcSet,
  sizes,
  alt = "",
  aspectRatio,
  placeholder,
  className = "",
  wrapperClassName = "",
  eager = false,
  onLoad,
  onError,
  ...rest
}) => {
  const imgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(eager);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (eager || isVisible) return;
    const el = imgRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager, isVisible]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  const wrapperStyle = aspectRatio
    ? { aspectRatio: aspectRatio.replace(":", "/") }
    : undefined;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={wrapperStyle}
      data-testid="optimized-image-wrapper"
    >
      {/* Skeleton shimmer while loading */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#1A1A1C] to-[#27272A] animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Optional low-quality placeholder */}
      {placeholder && !isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover blur-md scale-105 ${className}`}
        />
      )}

      {/* Actual image — only loads once visible */}
      {isVisible && !hasError && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...rest}
        />
      )}

      {/* Hard-fail fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1C] text-[#71717A] text-xs">
          {alt || "Image unavailable"}
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
