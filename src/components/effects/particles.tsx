"use client";

import {cn} from "@/lib/utils";
import React, {useEffect, useRef} from "react";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  color?: string;
  size?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
}

export function Particles({
  className,
  quantity = 30,
  staticity = 50,
  ease = 50,
  color = "var(--cpm-accent)",
  size = 2,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Particle[]>([]);
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const animationFrame = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;

    context.current = canvas.getContext("2d");
    const ctx = context.current;
    if (!ctx) return;

    const resizeCanvas = () => {
      canvasSize.current = {
        w: container.offsetWidth,
        h: container.offsetHeight,
      };
      canvas.width = container.offsetWidth * window.devicePixelRatio;
      canvas.height = container.offsetHeight * window.devicePixelRatio;
      canvas.style.width = `${container.offsetWidth}px`;
      canvas.style.height = `${container.offsetHeight}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();

    // Initialize particles
    circles.current = Array.from({ length: quantity }, () => ({
      x: Math.random() * canvasSize.current.w,
      y: Math.random() * canvasSize.current.h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * size + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      life: Math.random() * 100,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    container.addEventListener("mousemove", handleMouseMove);

    const drawParticle = (circle: Particle) => {
      if (!ctx) return;

      // Mouse interaction
      const dx = mouse.current.x - circle.x;
      const dy = mouse.current.y - circle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 150;

      if (dist < maxDist) {
        const force = (1 - dist / maxDist) * ease;
        circle.vx -= (dx / dist) * force * 0.01;
        circle.vy -= (dy / dist) * force * 0.01;
      }

      // Apply velocity with friction
      circle.x += circle.vx;
      circle.y += circle.vy;
      circle.vx *= 0.99;
      circle.vy *= 0.99;

      // Boundaries
      if (circle.x < 0 || circle.x > canvasSize.current.w) circle.vx *= -1;
      if (circle.y < 0 || circle.y > canvasSize.current.h) circle.vy *= -1;

      circle.x = Math.max(0, Math.min(canvasSize.current.w, circle.x));
      circle.y = Math.max(0, Math.min(canvasSize.current.h, circle.y));

      // Life cycle
      circle.life += 0.5;
      const lifeOpacity =
        Math.sin((circle.life * Math.PI) / 100) * 0.3 + 0.2;

      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.min(lifeOpacity, circle.opacity);
      ctx.fill();
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);

      // Draw connections
      circles.current.forEach((circle, i) => {
        circles.current.forEach((otherCircle, j) => {
          if (i >= j) return;
          const dx = circle.x - otherCircle.x;
          const dy = circle.y - otherCircle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(circle.x, circle.y);
            ctx.lineTo(otherCircle.x, otherCircle.y);
            ctx.strokeStyle = color;
            ctx.globalAlpha = (1 - dist / 120) * 0.08;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      // Draw particles
      circles.current.forEach(drawParticle);
      ctx.globalAlpha = 1;

      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrame.current);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [quantity, staticity, ease, color, size]);

  return (
    <div ref={canvasContainerRef} className={cn("absolute inset-0", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
