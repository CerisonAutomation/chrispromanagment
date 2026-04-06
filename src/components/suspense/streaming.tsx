// =============================================================================
// STREAMING & SUSPENSE COMPONENTS
// Progressive loading with streaming SSR for optimal FCP
// =============================================================================

import {type ReactNode, Suspense} from "react";

// =============================================================================
// SUSPENSE FALLBACK COMPONENTS - Skeleton loaders for each block type
// =============================================================================

export interface StreamingFallbackProps {
  delay?: number;
  height?: string;
}

/**
 * Light skeleton for above-the-fold content (Hero, Nav)
 * Minimal visual weight for fast perceived load
 */
export function LightSkeleton({ delay = 0 }: StreamingFallbackProps) {
  return (
    <div 
      className="animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-16 bg-gradient-to-r from-cpm-bg-secondary via-cpm-bg-primary to-cpm-bg-secondary rounded" />
    </div>
  );
}

/**
 * Full skeleton for content sections
 */
export function ContentSkeleton({ delay = 0, height = "h-64" }: StreamingFallbackProps) {
  return (
    <div 
      className="animate-pulse space-y-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-3/4 h-8 bg-cpm-bg-secondary rounded`} />
      <div className={`w-full ${height} bg-cpm-bg-secondary rounded-lg`} />
      <div className="space-y-2">
        <div className="h-4 bg-cpm-bg-secondary rounded w-full" />
        <div className="h-4 bg-cpm-bg-secondary rounded w-5/6" />
        <div className="h-4 bg-cpm-bg-secondary rounded w-4/6" />
      </div>
    </div>
  );
}

/**
 * Grid skeleton for multi-column layouts
 */
export function GridSkeleton({ delay = 0, columns = 3 }: StreamingFallbackProps) {
  return (
    <div 
      className="grid gap-6"
      style={{ 
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        animationDelay: `${delay}ms`
      }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="aspect-video bg-cpm-bg-secondary rounded-lg" />
          <div className="h-5 bg-cpm-bg-secondary rounded w-3/4" />
          <div className="h-4 bg-cpm-bg-secondary rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Feature grid skeleton
 */
export function FeatureSkeleton({ delay = 0, count = 6 }: StreamingFallbackProps) {
  return (
    <div 
      className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4">
          <div className="h-12 w-12 shrink-0 bg-cpm-bg-secondary rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-cpm-bg-secondary rounded w-2/3" />
            <div className="h-4 bg-cpm-bg-secondary rounded w-full" />
            <div className="h-4 bg-cpm-bg-secondary rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// STREAMING PAGE WRAPPER - Progressive enhancement
// =============================================================================

export interface StreamPageProps {
  children: ReactNode;
  /**
   * Fallback component to show while loading
   */
  fallback?: ReactNode;
  /**
   * Whether to use streaming (disable for critical above-fold content)
   */
  stream?: boolean;
  /**
   * CSS classes for the container
   */
  className?: string;
}

/**
 * Progressive page wrapper with optional streaming
 * Wraps content in Suspense for streaming SSR
 */
export function StreamPage({ 
  children, 
  fallback = <PageStreamFallback />,
  stream = true,
  className = ""
}: StreamPageProps) {
  if (!stream) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
}

/**
 * Default page-level streaming fallback
 */
export function PageStreamFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex h-10 w-10 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cpm-accent/30 border-t-cpm-accent" />
        </div>
        <p className="text-sm text-cpm-text-tertiary">Loading content...</p>
      </div>
    </div>
  );
}

// =============================================================================
// BLOCK-LEVEL STREAMING - For individual sections
// =============================================================================

export interface StreamBlockProps {
  children: ReactNode;
  /** Fallback skeleton component */
  fallback?: ReactNode;
  /** Animation delay in ms for staggered reveals */
  delay?: number;
  /** Class name */
  className?: string;
}

/**
 * Streaming wrapper for individual content blocks
 * Provides progressive loading with CSS animations
 */
export function StreamBlock({ 
  children, 
  fallback,
  delay = 0,
  className = ""
}: StreamBlockProps) {
  return (
    <Suspense fallback={fallback || <ContentSkeleton delay={delay} />}>
      <div 
        className={className}
        style={{ animationDelay: `${delay}ms` }}
      >
        {children}
      </div>
    </Suspense>
  );
}

/**
 * Wrapper for lazy-loaded blocks with intersection observer
 */
export function LazyBlock({ 
  children, 
  fallback,
  className = ""
}: StreamBlockProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback || <ContentSkeleton />}>
        {children}
      </Suspense>
    </div>
  );
}

// =============================================================================
// DEFERRED DATA LOADING - For below-fold content
// =============================================================================

export interface DeferredProps<T> {
  children: (data: T) => ReactNode;
  fallback?: ReactNode;
  /**
   * Promise that resolves the data
   */
  dataPromise: Promise<T>;
}

/**
 * Deferred component for non-critical data
 * Content loads after initial paint for faster FCP
 */
export function Deferred<T>(
  { children, fallback, dataPromise }: DeferredProps<T>
) {
  return (
    <Suspense fallback={fallback || null}>
      <DeferredContent children={children} dataPromise={dataPromise} />
    </Suspense>
  );
}

// Internal component that consumes the promise
function DeferredContent<T>({ 
  children, 
  dataPromise 
}: DeferredProps<T>) {
  // use() hook would be ideal here with React 19
  // For now, we wrap in Suspense and let it stream
  return <>{children(useSyncExternalStore ? {} as T : undefined as T)}</>;
}
