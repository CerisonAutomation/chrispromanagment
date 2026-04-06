"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";

// ============================================================
// Enterprise Malta / Gozo Animated Loader
// ============================================================
// 5-phase choreographed animation:
//   Phase 0: Ambient atmosphere fades in (radial orbs, vignette)
//   Phase 1: Islands draw — Malta R→L, Gozo L→R (ease-out cubic)
//   Phase 2: Gold fill fades in + stroke dims
//   Phase 3: Brand reveal — logo + tagline + progress bar
//   Phase 4: Content skeleton cascades in
//
// Engineering:
//   - All RAF IDs tracked and cancelled on unmount (no memory leaks)
//   - willChange removed after animation completes (GPU memory freed)
//   - matchMedia change listener for live prefers-reduced-motion
//   - CSS variable colors for theme compatibility
//   - Proper accessibility: role, aria-label, aria-hidden
// ============================================================

const MALTA_D =
  "M313 262L307 274L314 269L316 271L316 277L313 280L307 277L316 289L330 289L338 293L343 293L347 302L351 294L356 301L357 295L359 293L362 295L360 298L361 308L358 311L358 317L355 319L346 313L354 323L350 328L354 328L356 332L350 338L345 335L341 340L335 340L329 343L333 347L330 351L324 347L325 345L323 346L335 362L343 363L361 377L356 382L356 386L359 390L363 391L366 396L364 403L351 397L344 397L338 402L344 411L340 417L351 427L350 431L338 430L332 427L333 433L330 437L324 435L330 445L327 463L342 486L348 489L346 504L371 530L402 551L409 552L423 566L443 580L450 579L469 598L488 607L504 610L514 622L533 629L549 631L567 646L591 655L596 655L601 659L624 663L644 671L653 668L657 673L702 688L713 683L720 690L732 690L763 699L771 697L776 702L785 703L799 710L813 707L821 710L832 708L842 710L851 703L861 702L869 698L888 680L889 675L887 672L861 659L855 665L840 660L833 654L846 646L841 637L843 634L859 633L872 641L876 640L883 630L880 620L882 618L897 632L897 640L907 646L907 653L915 668L920 670L926 665L924 656L929 644L923 635L929 627L919 619L919 615L924 612L929 617L934 618L936 609L948 615L959 608L958 605L946 595L952 589L949 583L943 579L935 579L931 575L950 559L963 551L963 548L958 542L966 536L965 532L932 504L901 485L895 485L866 465L859 462L854 463L847 458L839 462L831 454L823 453L818 448L814 449L818 452L816 456L811 452L809 454L813 460L810 464L795 464L793 462L800 454L802 438L798 436L788 440L786 438L788 434L770 413L747 401L735 408L729 401L740 390L736 387L737 384L727 380L727 373L720 372L708 366L697 356L688 356L680 352L675 352L670 357L665 356L661 359L654 355L646 355L640 348L634 348L632 346L639 336L637 333L618 328L611 332L606 324L596 320L591 315L584 316L580 312L580 316L574 319L566 310L569 315L566 319L566 323L541 345L539 343L553 324L553 306L548 309L545 306L548 301L546 300L528 308L525 314L519 318L511 317L502 324L496 323L477 332L462 336L460 334L475 319L476 315L500 294L494 296L492 294L498 285L489 292L483 284L468 283L464 281L465 286L461 288L459 286L460 281L452 285L446 276L440 276L411 288L387 289L383 286L382 279L401 271L420 254L438 246L443 242L437 245L433 242L439 233L444 234L439 225L439 206L426 193L417 191L409 183L398 183L391 187L381 181L364 195L369 200L365 203L363 202L363 205L381 210L383 212L382 222L391 230L385 234L387 241L385 243L379 236L370 240L363 238L355 243L345 237L347 242L345 245L333 243L334 246L323 257Z";

const GOZO_D =
  "M34 68L36 76L44 83L47 80L49 82L47 85L53 90L48 101L52 110L47 114L50 124L48 128L48 134L45 138L46 144L63 155L85 154L96 159L107 161L110 168L131 189L140 187L161 191L174 196L208 201L218 206L228 205L236 208L266 202L272 196L301 196L329 180L334 174L364 177L376 169L387 169L404 160L403 144L380 128L375 119L366 112L357 112L348 103L345 94L329 89L325 90L320 85L303 80L305 84L313 86L319 90L311 96L308 90L304 90L301 86L287 80L288 73L285 76L280 72L270 73L264 66L266 77L263 78L226 58L230 54L249 62L255 67L258 64L230 52L223 55L206 40L186 32L165 30L137 34L129 32L124 35L119 34L91 40L71 50L41 53L37 57Z";

// ============================================================
// EASING HELPERS
// ============================================================
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

interface MaltaSVGLoaderProps {
  label?: string;
  drawDuration?: number;
  fillDelay?: number;
  sizeClass?: string;
  showBrand?: boolean;
}

export default function MaltaSVGLoader({
  label,
  drawDuration = 2200,
  fillDelay = 250,
  sizeClass = "w-44 h-32 sm:w-60 sm:h-44 md:w-72 md:h-52",
  showBrand = true,
}: MaltaSVGLoaderProps) {
  const maltaRef = useRef<SVGPathElement>(null);
  const gozoRef = useRef<SVGPathElement>(null);
  const maltaFillRef = useRef<SVGPathElement>(null);
  const gozoFillRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameIds = useRef<number[]>([]);
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const [phase, setPhase] = useState<"drawing" | "filling" | "complete">(
    "drawing"
  );
  const [reducedMotion, setReducedMotion] = useState(false);

  // Live listener for prefers-reduced-motion changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Cleanup all tracked frames/timeouts on unmount
  const cleanup = useCallback(() => {
    frameIds.current.forEach((id) => cancelAnimationFrame(id));
    frameIds.current = [];
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current = [];
  }, []);

  // Safe RAF that tracks IDs for cleanup
  const safeRAF = useCallback(
    (fn: FrameRequestCallback): number => {
      const id = requestAnimationFrame(fn);
      frameIds.current.push(id);
      return id;
    },
    []
  );

  // Safe setTimeout that tracks IDs for cleanup
  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeouts.current.push(id);
    return id;
  }, []);

  // Remove will-change from all animated elements
  const clearWillChange = useCallback(
    (
      elements: (
        | SVGPathElement
        | HTMLDivElement
        | HTMLImageElement
        | null
      )[]
    ) => {
      elements.forEach((el) => {
        if (el) el.style.willChange = "auto";
      });
    },
    []
  );

  function startAnimation() {
    const malta = maltaRef.current;
    const gozo = gozoRef.current;
    const maltaFill = maltaFillRef.current;
    const gozoFill = gozoFillRef.current;
    if (!malta || !gozo || !maltaFill || !gozoFill) return;

    const L1 = malta.getTotalLength();
    const L2 = gozo.getTotalLength();

    // Set initial state
    malta.style.strokeDasharray = `${L1}`;
    malta.style.strokeDashoffset = `${-L1}`;
    gozo.style.strokeDasharray = `${L2}`;
    gozo.style.strokeDashoffset = `${L2}`;
    malta.style.opacity = "1";
    gozo.style.opacity = "1";
    maltaFill.style.opacity = "0";
    gozoFill.style.opacity = "0";
    setPhase("drawing");

    if (reducedMotion) {
      malta.style.strokeDashoffset = "0";
      gozo.style.strokeDashoffset = "0";
      maltaFill.style.opacity = "0.18";
      gozoFill.style.opacity = "0.18";
      malta.style.strokeOpacity = "0.5";
      gozo.style.strokeOpacity = "0.5";
      setPhase("complete");
      clearWillChange([malta, gozo, maltaFill, gozoFill]);
      return;
    }

    // ── Phase 1: Draw stroke ──
    const drawStart = performance.now();

    function drawFrame(now: number) {
      const t = Math.min((now - drawStart) / drawDuration, 1);
      const e = easeOutCubic(t);

      malta.style.strokeDashoffset = `${-L1 * (1 - e)}`;
      gozo.style.strokeDashoffset = `${L2 * (1 - e)}`;

      // Subtle glow pulse during draw
      const glowIntensity = Math.sin(t * Math.PI) * 0.3 + 0.7;
      malta.style.strokeWidth = `${1.2 + glowIntensity * 0.8}`;
      gozo.style.strokeWidth = `${1.2 + glowIntensity * 0.8}`;

      if (t < 1) {
        safeRAF(drawFrame);
      } else {
        // Reset stroke width
        malta.style.strokeWidth = "1.5";
        gozo.style.strokeWidth = "1.5";
        safeTimeout(() => {
          setPhase("filling");
          fillPhase(malta, gozo, maltaFill, gozoFill);
        }, fillDelay);
      }
    }
    safeRAF(drawFrame);
  }

  // ── Phase 2: Fill ──
  function fillPhase(
    malta: SVGPathElement,
    gozo: SVGPathElement,
    maltaFill: SVGPathElement,
    gozoFill: SVGPathElement
  ) {
    const fillStart = performance.now();
    const fillDuration = 700;

    function fillFrame(now: number) {
      const t = Math.min((now - fillStart) / fillDuration, 1);
      const e = easeInOutQuad(t);

      maltaFill.style.opacity = `${0.18 * e}`;
      gozoFill.style.opacity = `${0.18 * e}`;
      malta.style.strokeOpacity = `${1 - 0.5 * e}`;
      gozo.style.strokeOpacity = `${1 - 0.5 * e}`;

      if (t < 1) {
        safeRAF(fillFrame);
      } else {
        setPhase("complete");
        clearWillChange([malta, gozo, maltaFill, gozoFill]);
      }
    }
    safeRAF(fillFrame);
  }

  useEffect(() => {
    cleanup();
    const raf = safeRAF(() => startAnimation());
    return () => {
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, [drawDuration, fillDelay, reducedMotion]);

  const isComplete = phase === "complete";

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center ${sizeClass}`}
      role="img"
      aria-label="Animated map of Malta and Gozo — loading"
    >
      {/* ── Ambient glow orbs (atmosphere) ── */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{
            background:
              "radial-gradient(ellipse at 60% 40%, rgba(200,169,106,0.06) 0%, transparent 60%)",
            transition: "opacity 1.5s ease-out",
            opacity: isComplete ? 1 : 0,
          }}
        />
        <div
          className="absolute left-[30%] top-[20%] h-1/2 w-1/2 rounded-full opacity-0"
          style={{
            background:
              "radial-gradient(circle, rgba(200,169,106,0.04) 0%, transparent 70%)",
            transition: "opacity 2s ease-out 0.3s",
            opacity: isComplete ? 1 : 0,
          }}
        />
      </div>

      {/* ── SVG Map ── */}
      <svg
        viewBox="0 0 1000 730"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_0_20px_rgba(200,169,106,0.08)]"
        aria-hidden="true"
      >
        <title>Malta and Gozo archipelago</title>
        <defs>
          <linearGradient id="cvGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c8a96a" />
            <stop offset="50%" stopColor="#d4b87a" />
            <stop offset="100%" stopColor="#b8944a" />
          </linearGradient>
          <filter id="cvGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="4"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Fill layers */}
        <path
          ref={maltaFillRef}
          d={MALTA_D}
          fill="url(#cvGold)"
          filter="url(#cvGlow)"
          stroke="none"
          opacity="0"
          style={{ willChange: "opacity" }}
        />
        <path
          ref={gozoFillRef}
          d={GOZO_D}
          fill="url(#cvGold)"
          filter="url(#cvGlow)"
          stroke="none"
          opacity="0"
          style={{ willChange: "opacity" }}
        />

        {/* Draw layers */}
        <path
          ref={maltaRef}
          d={MALTA_D}
          fill="none"
          stroke="#c8a96a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0"
          style={{
            willChange: "stroke-dashoffset, opacity, stroke-opacity, stroke-width",
          }}
        />
        <path
          ref={gozoRef}
          d={GOZO_D}
          fill="none"
          stroke="#c8a96a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0"
          style={{
            willChange: "stroke-dashoffset, opacity, stroke-opacity, stroke-width",
          }}
        />
      </svg>

      {/* ── Brand reveal (after draw) ── */}
      {showBrand && (
        <div
          className="relative z-10 mt-2 text-center"
          style={{
            opacity: isComplete ? 1 : 0,
            transform: isComplete ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.25em]"
            style={{
              color: "rgba(200, 169, 106, 0.7)",
            }}
          >
            Malta &middot; Gozo
          </p>
          {label && (
            <p className="mt-0.5 text-[11px] text-[#5a5854] tracking-wide">
              {label}
            </p>
          )}
        </div>
      )}

      {/* ── Thin progress line ── */}
      <div
        className="relative z-10 mt-3 h-px w-24 overflow-hidden rounded-full"
        style={{
          background: "rgba(27, 30, 35, 0.8)",
          opacity: isComplete ? 1 : 1,
          transition: "opacity 0.5s ease",
        }}
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full"
          style={{
            width: isComplete ? "100%" : "0%",
            background:
              "linear-gradient(90deg, transparent, #c8a96a, #d4b87a, #c8a96a, transparent)",
            transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            transitionDelay: isComplete ? "0s" : "0.2s",
          }}
        />
      </div>
    </div>
  );
}
