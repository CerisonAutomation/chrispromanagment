// =============================================================================
// LAZY LOADING FOR BLOCKS
// Intersection Observer-based loading for below-fold content
// =============================================================================

import {type ComponentType, type ReactNode, useEffect, useState} from "react";

// =============================================================================
// LAZY LOADED BLOCK TYPES
// Only load heavy components when they enter the viewport
// =============================================================================

/**
 * Registry of lazy-loadable blocks
 * Components are dynamically imported only when visible
 */
export const LAZY_BLOCKS = {
  "GuestyPropertyGrid": () => import("@/blocks/guesty-property-grid"),
  "GuestyPropertyDetail": () => import("@/blocks/guesty-property-detail"),
  "GuestyBookingWidget": () => import("@/blocks/guesty-booking-widget"),
  "ImageGallery": () => import("@/blocks/image-gallery"),
  "VideoSection": () => import("@/blocks/video-section"),
  "TestimonialSection": () => import("@/blocks/testimonial-section"),
  "FeatureGrid": () => import("@/blocks/feature-grid"),
  "PricingTable": () => import("@/blocks/pricing-table"),
  "FaqSection": () => import("@/blocks/faq-section"),
  "MaltaMapSection": () => import("@/blocks/malta-map-section"),
  "PropertyShowcase": () => import("@/blocks/property-showcase"),
  "ComparisonSection": () => import("@/blocks/comparison-section"),
} as const;

export type LazyBlockType = keyof typeof LAZY_BLOCKS;

// =============================================================================
// LAZY BLOCK COMPONENT
// Loads block component only when visible in viewport
// =============================================================================

interface LazyBlockProps {
  /** Block type from registry */
  blockType: LazyBlockType;
  /** Block props to pass to component */
  props: Record<string, unknown>;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Fallback to show while loading */
  fallback?: ReactNode;
  /** Minimum time to show fallback (prevents flash) */
  minLoadTime?: number;
}

/**
 * Lazy block that loads component only when visible
 * Uses Intersection Observer for efficient viewport detection
 */
export function LazyBlock({
  blockType,
  props,
  rootMargin = "100px",
  fallback,
  minLoadTime = 0,
}: LazyBlockProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [Component, setComponent] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [loadTime, setLoadTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setLoadTime(Date.now() - startTime);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 }
    );

    // Create a dummy element to observe
    const element = document.getElementById(`lazy-block-${blockType}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [blockType, rootMargin]);

  // Dynamically import when visible
  useEffect(() => {
    if (!isVisible) return;

    const loadComponent = async () => {
      const loader = LAZY_BLOCKS[blockType];
      if (loader) {
        try {
          const loadedModule = await loader();
          // Wait for min load time if specified
          const remaining = minLoadTime - loadTime;
          if (remaining > 0) {
            await new Promise((r) => setTimeout(r, remaining));
          }
          const mod = module as { default?: React.ComponentType<unknown> };
          setComponent(() => mod.default || (() => null));
        } catch (error) {
          console.error(`Failed to load block ${blockType}:`, error);
        }
      }
    };

    loadComponent();
  }, [isVisible, blockType, minLoadTime, loadTime]);

  return (
    <div id={`lazy-block-${blockType}`} className="lazy-block-container">
      {/* Placeholder for intersection observer */}
      <div style={{ height: 1 }} aria-hidden="true" />

      {/* Show fallback or skeleton until loaded */}
      {!Component && (fallback || <BlockSkeleton blockType={blockType} />)}

      {/* Render loaded component */}
      {Component && <Component {...props} />}
    </div>
  );
}

// =============================================================================
// BLOCK SKELETON
// Visual placeholder while block loads
// =============================================================================

function BlockSkeleton({ blockType }: { blockType: LazyBlockType }) {
  // Different skeletons based on block type
  const skeletons: Record<string, ReactNode> = {
    GuestyPropertyGrid: (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-xl bg-cpm-bg-secondary p-4 space-y-3">
            <div className="aspect-video bg-cpm-bg-primary rounded-lg" />
            <div className="h-5 bg-cpm-bg-primary rounded w-3/4" />
            <div className="h-4 bg-cpm-bg-primary rounded w-1/2" />
          </div>
        ))}
      </div>
    ),
    ImageGallery: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse aspect-square bg-cpm-bg-secondary rounded-lg" />
        ))}
      </div>
    ),
    FeatureGrid: (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-4">
            <div className="h-12 w-12 bg-cpm-bg-secondary rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-cpm-bg-secondary rounded w-2/3" />
              <div className="h-4 bg-cpm-bg-secondary rounded" />
            </div>
          </div>
        ))}
      </div>
    ),
    default: (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-cpm-bg-secondary rounded w-3/4" />
        <div className="h-64 bg-cpm-bg-secondary rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 bg-cpm-bg-secondary rounded" />
          <div className="h-4 bg-cpm-bg-secondary rounded w-5/6" />
        </div>
      </div>
    ),
  };

  return skeletons[blockType] || skeletons.default;
}

// =============================================================================
// LAZY IMPORT HOOK
// For manual lazy loading of components
// =============================================================================

export function useLazyComponent<T extends ComponentType<unknown>>(
  loader: () => Promise<{ default: T }>,
  options: { enabled?: boolean; rootMargin?: string } = {}
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(options.enabled ?? false);

  const load = async () => {
    if (Component || isLoading) return;
    setIsLoading(true);
    try {
      const loadedModule = await loader();
      setComponent(() => loadedModule.default);
    } catch (error) {
      console.error("Failed to lazy load component:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (options.enabled !== undefined) {
      setIsVisible(options.enabled);
    }
  }, [options.enabled]);

  useEffect(() => {
    if (!isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          load();
          observer.disconnect();
        }
      },
      { rootMargin: options.rootMargin || "100px" }
    );

    // Observe the nearest element
    const element = document.querySelector(`[data-lazy-load]`);
    if (element) {
      observer.observe(element);
    } else {
      // No observer target, load immediately
      load();
    }

    return () => observer.disconnect();
  }, [isVisible, options.rootMargin]);

  return { Component, isLoading, load };
}

// =============================================================================
// PREFETCH HOOK
// Prefetch blocks on hover/touch
// =============================================================================

export function useBlockPrefetch() {
  const prefetch = (blockType: LazyBlockType) => {
    const loader = LAZY_BLOCKS[blockType];
    if (typeof loader === 'function') {
      // Prefetch the module
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "script";
      // Note: In production, you'd use webpack's prefetch
      // This is a simplified version
    }
  };

  return { prefetch };
}
