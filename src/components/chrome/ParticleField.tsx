'use client';

import { useEffect, useRef } from 'react';

/**
 * The field inside the boundary.
 *
 * Canvas, not DOM or SVG nodes. A particle per element would mean dozens of
 * transformed nodes and a style recalculation every frame — the same mistake
 * that made the hero stutter. One canvas is one element, one loop, and a
 * raster sized to the frame rather than the viewport.
 *
 * The motion is meant to read as a field settling, not as a physics demo:
 * slow drift, a little depth, and a pointer that nudges rather than pushes.
 * If the interaction is the first thing someone notices, it is too strong.
 */

export interface ParticleFieldProps {
  /** Stops the loop entirely when the opening is over. */
  active: boolean;
  /** Set when the exit begins — particles drift outward and thin out. */
  dispersing: boolean;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0 far, 1 near. Drives size, opacity and how much the pointer moves it. */
  depth: number;
}

const INK = '190, 193, 200'; // Moonlit's moon colour, matching the hero's ink.
const MAX_DPR = 2;
const POINTER_RADIUS = 110;

export function ParticleField({ active, dispersing, className }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Mirrored into a ref so the loop can read it without `dispersing` being a
  // dependency — a prop change must never tear down and restart the
  // animation mid-exit. Synced in an effect, because writing a ref during
  // render is not allowed.
  const dispersingRef = useRef(dispersing);
  useEffect(() => {
    dispersingRef.current = dispersing;
  }, [dispersing]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (still.matches) return;

    const coarse = window.matchMedia('(pointer: coarse)').matches;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let disposed = false;

    const pointer = { x: -9999, y: -9999, active: false };

    const seed = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density by area, so a phone does not run a desktop's particle count.
      const target = Math.round(Math.min(90, Math.max(18, (width * height) / 4200)));

      particles = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        depth: Math.random(),
      }));
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const draw = () => {
      if (disposed) return;
      context.clearRect(0, 0, width, height);

      const escaping = dispersingRef.current;

      for (const p of particles) {
        // Pointer nudge: nearer particles feel it more, and it eases off with
        // distance so nothing snaps.
        if (pointer.active && !escaping) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < POINTER_RADIUS && distance > 0.001) {
            const force = ((POINTER_RADIUS - distance) / POINTER_RADIUS) * 0.045;
            p.vx += (dx / distance) * force * (0.4 + p.depth);
            p.vy += (dy / distance) * force * (0.4 + p.depth);
          }
        }

        if (escaping) {
          // Outward from the centre, so the field opens rather than scatters.
          const dx = p.x - width / 2;
          const dy = p.y - height / 2;
          const distance = Math.hypot(dx, dy) || 1;
          p.vx += (dx / distance) * 0.07;
          p.vy += (dy / distance) * 0.07;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Drag, so a nudge settles instead of accumulating forever.
        p.vx *= 0.985;
        p.vy *= 0.985;

        if (!escaping) {
          // Contained: the field has a boundary, and particles belong inside it.
          if (p.x < 0) p.x += width;
          if (p.x > width) p.x -= width;
          if (p.y < 0) p.y += height;
          if (p.y > height) p.y -= height;
        }

        const radius = 0.5 + p.depth * 1.3;
        const alpha = (0.12 + p.depth * 0.34) * (escaping ? 0.5 : 1);

        context.beginPath();
        context.arc(p.x, p.y, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${INK}, ${alpha.toFixed(3)})`;
        context.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    seed();
    frame = requestAnimationFrame(draw);

    const onResize = () => seed();
    window.addEventListener('resize', onResize);
    if (!coarse) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [active]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
