/**
 * CarouselHero — premium auto-rotating hero.
 *
 * Upgrades over v1:
 *  - Fixed JSX (v1 shipped with literal `\"` escapes that wouldn't compile).
 *  - Ken Burns slow-zoom on the active slide.
 *  - Crossfade between slides with reduced-motion respect.
 *  - Top progress bar tied to slide duration.
 *  - Pause on hover / focus / tab-hidden.
 *  - Keyboard nav (← → Home End) when the section has focus.
 *  - Swipe gesture on touch devices.
 *  - First slide eager + fetchpriority="high"; rest lazy.
 *  - 100dvh hard-stop section (no scroll snapping — project rule).
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const CarouselHero = ({ data = {} }) => {
  const slides = Array.isArray(data.slides) ? data.slides : [];
  const autoplay = data.autoplay !== false;
  const interval = Math.max(2000, Number(data.interval) || 6000);
  const showArrows = data.showArrows !== false;
  const showDots = data.showDots !== false;
  const showProgress = data.showProgress !== false;
  const kenBurns = data.kenBurns !== false;

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef(null);
  const touchStartX = useRef(null);
  const reduceMotion = useMemo(prefersReducedMotion, []);

  const go = useCallback(
    (i) => setCurrent(((i % slides.length) + slides.length) % slides.length),
    [slides.length]
  );
  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || slides.length <= 1 || paused || reduceMotion) return;
    const t = setInterval(next, interval);
    return () => clearInterval(t);
  }, [autoplay, interval, next, slides.length, paused, reduceMotion]);

  // Pause when tab hidden
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Keyboard nav
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (!el.contains(document.activeElement) && document.activeElement !== el) return;
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      else if (e.key === "Home") { e.preventDefault(); go(0); }
      else if (e.key === "End") { e.preventDefault(); go(slides.length - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, slides.length]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0]?.clientX ?? null; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    touchStartX.current = null;
  };

  if (!slides.length) return null;

  const progressKey = `${current}-${paused}`;
  const progressDuration = autoplay && !paused && !reduceMotion ? `${interval}ms` : "0ms";

  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      className="relative w-full h-[100dvh] overflow-hidden bg-[#0F0F10] focus:outline-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label={data.ariaLabel || "Featured highlights"}
    >
      {/* Top progress bar */}
      {showProgress && slides.length > 1 && (
        <div className="absolute top-0 left-0 right-0 z-30 h-[2px] bg-[#F5F5F0]/10">
          <div
            key={progressKey}
            className="h-full bg-[#D4AF37]"
            style={{
              width: "100%",
              transformOrigin: "left",
              animation: progressDuration !== "0ms" ? `kc-progress ${progressDuration} linear forwards` : undefined,
              transform: progressDuration === "0ms" ? "scaleX(0)" : undefined,
            }}
          />
        </div>
      )}

      {/* Slides */}
      {slides.map((slide, i) => {
        const active = i === current;
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
              active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            aria-hidden={!active}
          >
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={slide.image}
                alt={slide.alt || slide.headline || ""}
                className="w-full h-full object-cover will-change-transform"
                loading={i === 0 ? "eager" : "lazy"}
                fetchpriority={i === 0 ? "high" : "auto"}
                decoding="async"
                style={
                  kenBurns && active && !reduceMotion
                    ? { animation: "kc-kenburns 12000ms ease-out forwards" }
                    : undefined
                }
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-[#0F0F10]/55 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F10]/70 via-[#0F0F10]/20 to-transparent" />

            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full">
                <div
                  className={`max-w-3xl transition-all duration-[900ms] ease-out ${
                    active ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  }`}
                  style={{ transitionDelay: active ? "150ms" : "0ms" }}
                >
                  {slide.badge && (
                    <div className="inline-block px-4 py-2 border border-[#D4AF37]/30 bg-[#D4AF37]/5 backdrop-blur-sm mb-6">
                      <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-medium">
                        {slide.badge}
                      </span>
                    </div>
                  )}

                  <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl lg:text-8xl text-[#F5F5F0] font-bold mb-6 leading-[1.05]">
                    {slide.headline}
                  </h1>

                  {slide.subheadline && (
                    <p className="text-lg md:text-2xl text-[#A1A1AA] mb-10 leading-relaxed max-w-2xl">
                      {slide.subheadline}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    {slide.cta1Text && (
                      <Button
                        asChild
                        className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] px-8 py-6 text-base md:text-lg font-semibold rounded-none uppercase tracking-widest"
                      >
                        <a href={slide.cta1Link || "#"}>{slide.cta1Text}</a>
                      </Button>
                    )}
                    {slide.cta2Text && (
                      <Button
                        asChild
                        variant="outline"
                        className="border-[#F5F5F0]/60 text-[#F5F5F0] bg-transparent hover:bg-[#F5F5F0] hover:text-[#0F0F10] px-8 py-6 text-base md:text-lg rounded-none uppercase tracking-widest"
                      >
                        <a href={slide.cta2Link || "#"}>{slide.cta2Text}</a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-[#0F0F10]/70 hover:bg-[#D4AF37] hover:text-[#0F0F10] text-[#F5F5F0] p-3 backdrop-blur-sm transition-all items-center justify-center"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={next}
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-[#0F0F10]/70 hover:bg-[#D4AF37] hover:text-[#0F0F10] text-[#F5F5F0] p-3 backdrop-blur-sm transition-all items-center justify-center"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3" role="tablist">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === current}
              onClick={() => go(i)}
              className={`h-[3px] transition-all ${
                i === current ? "w-10 bg-[#D4AF37]" : "w-4 bg-[#F5F5F0]/30 hover:bg-[#F5F5F0]/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Local keyframes — scoped so we don't bloat globals.css */}
      <style>{`
        @keyframes kc-kenburns {
          0%   { transform: scale(1) translate3d(0,0,0); }
          100% { transform: scale(1.08) translate3d(-1.5%, -1%, 0); }
        }
        @keyframes kc-progress {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="kc-kenburns"], [style*="kc-progress"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
};

export default CarouselHero;
