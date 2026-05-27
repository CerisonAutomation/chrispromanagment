// @ts-nocheck
import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  aspectRatio = 'auto',
  objectFit = 'cover',
  loading = 'lazy',
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
      onLoad?.();
    }
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={aspectRatio !== 'auto' ? { aspectRatio } : undefined}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 skeleton animate-shimmer" />
      )}
      {hasError ? (
        <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm">
          Failed to load image
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          className={`w-full h-full object-${objectFit} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={(e) => {
            setHasError(true);
            onError?.(e);
          }}
        />
      )}
    </div>
  );
};
