/**
 * CAROUSEL HERO BLOCK - Game Changer Feature
 * Auto-rotating hero with multiple slides
 */

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CarouselHero = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = data.slides || [];
  const autoplay = data.autoplay !== false;
  const interval = data.interval || 5000;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, nextSlide, slides.length]);

  if (!slides.length) return null;

  return (
    <section className=\"relative min-h-screen overflow-hidden\">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <div className=\"absolute inset-0\">
            <img
              src={slide.image}
              alt={slide.headline}
              className=\"w-full h-full object-cover\"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>

          {/* Overlay */}
          <div className=\"absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-[#0F0F10]/50 to-transparent\" />
          <div className=\"absolute inset-0 bg-gradient-to-r from-[#0F0F10]/60 to-transparent\" />

          {/* Content */}
          <div className=\"relative z-10 h-full flex items-center\">
            <div className=\"max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full\">
              <div className=\"max-w-3xl animate-fade-in\">
                {/* Badge */}
                {slide.badge && (
                  <div className=\"inline-block px-4 py-2 border border-[#D4AF37]/30 bg-[#D4AF37]/5 backdrop-blur-sm mb-6\">
                    <span className=\"text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-medium\">
                      {slide.badge}
                    </span>
                  </div>
                )}

                {/* Headline */}
                <h1 className=\"font-['Playfair_Display'] text-5xl md:text-7xl lg:text-8xl text-[#F5F5F0] font-bold mb-6 leading-[1.1]\">
                  {slide.headline}
                </h1>

                {/* Subheadline */}
                <p className=\"text-xl md:text-2xl text-[#A1A1AA] mb-10 leading-relaxed\">
                  {slide.subheadline}
                </p>

                {/* CTAs */}
                <div className=\"flex flex-col sm:flex-row gap-4\">
                  <Button
                    className=\"bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] px-8 py-6 text-lg font-semibold rounded-none uppercase tracking-widest\"\n                    onClick={() => window.location.href = slide.cta1Link}
                  >
                    {slide.cta1Text}
                  </Button>
                  {slide.cta2Text && (
                    <Button
                      variant=\"outline\"
                      className=\"border-[#F5F5F0] text-[#F5F5F0] hover:bg-[#F5F5F0] hover:text-[#0F0F10] px-8 py-6 text-lg rounded-none uppercase tracking-widest\"
                      onClick={() => window.location.href = slide.cta2Link}
                    >
                      {slide.cta2Text}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {data.showArrows && slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className=\"absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-[#0F0F10]/80 hover:bg-[#D4AF37] text-[#F5F5F0] p-3 backdrop-blur-sm transition-all group\"
            aria-label=\"Previous slide\"
          >
            <ChevronLeft className=\"w-6 h-6 group-hover:scale-110 transition-transform\" />
          </button>
          <button
            onClick={nextSlide}
            className=\"absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-[#0F0F10]/80 hover:bg-[#D4AF37] text-[#F5F5F0] p-3 backdrop-blur-sm transition-all group\"
            aria-label=\"Next slide\"
          >
            <ChevronRight className=\"w-6 h-6 group-hover:scale-110 transition-transform\" />
          </button>
        </>
      )}

      {/* Dots */}
      {data.showDots && slides.length > 1 && (
        <div className=\"absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3\">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 transition-all ${
                index === currentSlide
                  ? 'w-8 bg-[#D4AF37]'
                  : 'w-2 bg-[#F5F5F0]/30 hover:bg-[#F5F5F0]/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CarouselHero;
