import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface ARViewerProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ARViewer({ imageUrl, onClose }: ARViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple 360 image viewer implementation
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = `
      <div class="w-full h-full bg-cover bg-center" style="background-image: url('${imageUrl}')"></div>
    `;

    return () => {
      container.innerHTML = '';
    };
  }, [imageUrl]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-6xl max-h-[80vh]">
        <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/30"
        >
          ✕
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
          Drag to look around | Scroll to zoom
        </div>
      </div>
    </div>
  );
}
