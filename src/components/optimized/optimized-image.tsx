// =============================================================================
// OPTIMIZED IMAGE COMPONENT
// Next/Image with blur placeholder, lazy loading, and WebP optimization
// =============================================================================

import Image from "next/image";
import {useCallback, useState} from "react";

export interface OptimizedImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image width (required for static, auto for responsive) */
  width?: number | string;
  /** Image height (required for static, auto for responsive) */
  height?: number | string;
  /** CSS class name */
  className?: string;
  /** Priority loading for LCP images */
  priority?: boolean;
  /** Blur data URL for placeholder */
  placeholder?: string;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Fill container parent */
  fill?: boolean;
  /** Quality (1-100), default 80 */
  quality?: number;
  /** Loading strategy: 'lazy' | 'eager' | 'viewport' */
  loading?: "lazy" | "eager";
  /** Animation on load */
  animateOnLoad?: boolean;
}

/**
 * Optimized image component with:
 * - Automatic WebP/AVIF conversion via Next.js
 * - Blur placeholder for perceived performance
 * - Lazy loading by default (except priority)
 * - Responsive srcset generation
 * - CLS prevention with aspect ratio
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  placeholder,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fill = false,
  quality = 80,
  loading = "lazy",
  animateOnLoad = true,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Generate blur placeholder if not provided
  const blurDataURL = placeholder || generateBlurPlaceholder(src);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={!fill ? { width, height } : undefined}
    >
      {/* Placeholder background */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-cpm-bg-secondary animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Error state */}
      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-cpm-bg-secondary text-cpm-text-tertiary"
          aria-hidden="true"
        >
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Actual image */}
      {!hasError && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : (width as number)}
          height={fill ? undefined : (height as number)}
          fill={fill}
          quality={quality}
          sizes={sizes}
          loading={priority ? "eager" : loading}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={`${animateOnLoad ? "transition-opacity duration-500" : ""} ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${fill ? "object-cover" : ""}`}
          priority={priority}
        />
      )}
    </div>
  );
}

/**
 * Generate a tiny blur placeholder URL
 * In production, this would be a pre-generated base64 or low-res image URL
 */
function generateBlurPlaceholder(src: string): string {
  // For external images, you could fetch a tiny version
  // For now, return a simple gradient placeholder
  if (src.includes("jwwb.nl")) {
    // Christiano's image CDN - could use a tiny thumbnail
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTcxOCMiLz48L3N2Zz4=";
  }
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIj8+PC9zdmc+";
}

// =============================================================================
// RESPONSIVE IMAGE GRID
// Automatically generates srcset for different viewport sizes
// =============================================================================

export interface ImageGridProps {
  images: Array<{
    src: string;
    alt: string;
    aspectRatio?: string;
  }>;
  className?: string;
  columns?: {
    default: number;
    md?: number;
    lg?: number;
  };
}

export function ResponsiveImageGrid({
  images,
  className = "",
  columns = { default: 1, md: 2, lg: 3 },
}: ImageGridProps) {
  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns.default}, minmax(0, 1fr))`,
      }}
    >
      {images.map((image, index) => (
        <div
          key={index}
          style={{ aspectRatio: image.aspectRatio || "16/9" }}
          className="overflow-hidden rounded-lg"
        >
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            fill
            sizes={`
              (max-width: 768px) 100vw,
              (max-width: 1024px) ${100 / (columns.md || columns.lg || 2)}vw,
              ${100 / (columns.lg || 3)}vw
            `}
            className="h-full w-full"
          />
        </div>
      ))}
    </div>
  );
}
