'use client';
/**
 * ImageGallery — Full production Puck block.
 * Lightbox gallery with masonry/grid/carousel layouts, lazy loading, keyboard navigation.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  layout: 'grid' | 'masonry' | 'carousel';
  columns: 2 | 3 | 4;
  enableLightbox: boolean;
  showCaptions: boolean;
  gap: 'sm' | 'md' | 'lg';
  aspectRatio: 'square' | '4/3' | '16/9' | 'auto';
  rounded: boolean;
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  index,
  onClose,
  showCaptions,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  showCaptions: boolean;
}) {
  const [current, setCurrent] = useState(index);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  const img = images[current];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      <button
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        ✕
      </button>

      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label="Previous image"
      >
        ‹
      </button>

      <div
        className="relative max-h-[85vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={img.src}
          alt={img.alt}
          width={1400}
          height={900}
          className="max-h-[80vh] w-auto rounded-lg object-contain shadow-2xl"
          priority
        />
        {showCaptions && img.caption && (
          <p className="mt-3 text-center text-sm text-white/70">{img.caption}</p>
        )}
        <p className="mt-1 text-center text-xs text-white/40">{current + 1} / {images.length}</p>
      </div>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label="Next image"
      >
        ›
      </button>
    </div>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────────

function Carousel({ images, showCaptions, enableLightbox, rounded }: {
  images: GalleryImage[];
  showCaptions: boolean;
  enableLightbox: boolean;
  rounded: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const img = images[current];

  return (
    <div className="relative overflow-hidden">
      <div ref={trackRef} className="relative">
        <div
          className={cn('relative aspect-video w-full overflow-hidden', rounded && 'rounded-2xl')}
          onClick={() => enableLightbox && setLightboxIndex(current)}
          style={{ cursor: enableLightbox ? 'zoom-in' : 'default' }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover transition-all duration-500"
            sizes="100vw"
            priority={current === 0}
          />
        </div>
        {showCaptions && img.caption && (
          <p className="mt-2 text-center text-sm text-gray-500">{img.caption}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
          className="rounded-full border border-gray-200 p-2 hover:bg-gray-50 transition-colors" aria-label="Previous">
          ‹
        </button>
        {images.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={cn('h-2 w-2 rounded-full transition-all', i === current ? 'bg-amber-500 w-4' : 'bg-gray-300')}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
        <button onClick={() => setCurrent((c) => (c + 1) % images.length)}
          className="rounded-full border border-gray-200 p-2 hover:bg-gray-50 transition-colors" aria-label="Next">
          ›
        </button>
      </div>

      {lightboxIndex !== null && (
        <Lightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} showCaptions={showCaptions} />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ImageGallery({
  images,
  layout,
  columns,
  enableLightbox,
  showCaptions,
  gap,
  aspectRatio,
  rounded,
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const gapClass = { sm: 'gap-2', md: 'gap-4', lg: 'gap-6' }[gap];
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[columns];

  const paddingClass = {
    square: 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    auto: 'aspect-auto',
  }[aspectRatio];

  if (!images || images.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
        Add images in the block properties.
      </div>
    );
  }

  if (layout === 'carousel') {
    return <Carousel images={images} showCaptions={showCaptions} enableLightbox={enableLightbox} rounded={rounded} />;
  }

  return (
    <>
      <div className={cn('grid', gapClass, colClass)}>
        {images.map((img, i) => (
          <div key={i} className="group relative overflow-hidden"
            style={{ cursor: enableLightbox ? 'zoom-in' : 'default' }}
            onClick={() => enableLightbox && setLightboxIndex(i)}
          >
            <div className={cn('relative w-full overflow-hidden', rounded && 'rounded-xl', paddingClass !== 'aspect-auto' && paddingClass)}>
              <Image
                src={img.src}
                alt={img.alt}
                fill={aspectRatio !== 'auto'}
                width={aspectRatio === 'auto' ? 800 : undefined}
                height={aspectRatio === 'auto' ? 600 : undefined}
                className={cn(
                  'object-cover transition-transform duration-500 group-hover:scale-105',
                  aspectRatio === 'auto' && 'w-full h-auto'
                )}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
              />
              {enableLightbox && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
                  <span className="scale-0 text-2xl text-white transition-transform group-hover:scale-100">🔍</span>
                </div>
              )}
            </div>
            {showCaptions && img.caption && (
              <p className="mt-1 text-sm text-gray-500">{img.caption}</p>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} showCaptions={showCaptions} />
      )}
    </>
  );
}

// ─── Puck Block Definition ────────────────────────────────────────────────────

export const ImageGalleryBlock = {
  label: 'Image Gallery',
  fields: {
    images: {
      type: 'array' as const,
      label: 'Images',
      arrayFields: {
        src: { type: 'text' as const, label: 'Image URL' },
        alt: { type: 'text' as const, label: 'Alt Text' },
        caption: { type: 'text' as const, label: 'Caption (optional)' },
      },
      defaultItemProps: { src: '', alt: '', caption: '' },
    },
    layout: {
      type: 'select' as const,
      label: 'Layout',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Masonry', value: 'masonry' },
        { label: 'Carousel', value: 'carousel' },
      ],
    },
    columns: {
      type: 'select' as const,
      label: 'Columns',
      options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }],
    },
    aspectRatio: {
      type: 'select' as const,
      label: 'Aspect Ratio',
      options: [
        { label: 'Square', value: 'square' },
        { label: '4:3', value: '4/3' },
        { label: '16:9', value: '16/9' },
        { label: 'Auto', value: 'auto' },
      ],
    },
    gap: {
      type: 'select' as const,
      label: 'Gap',
      options: [{ label: 'Small', value: 'sm' }, { label: 'Medium', value: 'md' }, { label: 'Large', value: 'lg' }],
    },
    enableLightbox: { type: 'radio' as const, label: 'Enable Lightbox', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    showCaptions: { type: 'radio' as const, label: 'Show Captions', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    rounded: { type: 'radio' as const, label: 'Rounded Corners', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
  },
  defaultProps: {
    images: [
      { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', alt: 'Malta seafront', caption: 'Malta seafront' },
      { src: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800', alt: 'Luxury villa', caption: 'Luxury villa' },
      { src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', alt: 'Pool view', caption: 'Pool view' },
    ],
    layout: 'grid' as const,
    columns: 3 as const,
    aspectRatio: '4/3' as const,
    gap: 'md' as const,
    enableLightbox: true,
    showCaptions: false,
    rounded: true,
  },
  render: (props: ImageGalleryProps) => <ImageGallery {...props} />,
};

export default ImageGalleryBlock;
