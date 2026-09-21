'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { hashSeed, mulberry32 } from '@/lib/ridge';

gsap.registerPlugin(useGSAP);

/**
 * A word that keeps failing in the same places.
 *
 * Watermelon's error-3 block sets "404" with a jittering RGB ghost and wraps
 * it in hacker-terminal copy ("connection severed", "initialize reboot").
 * The glitch is a good instinct for a page that exists because something
 * broke; the terminal costume is not, and this site has avoided it
 * everywhere else.
 *
 * So: the word is set three times. The base copy never moves. Two copies
 * above it are clipped to horizontal bands and, in short bursts, shear
 * sideways by seeded amounts, like a surface that has fractured along fixed
 * lines. Only `transform` animates; the clip-paths are static, so the
 * browser composites the bands instead of repainting the glyphs. The fault
 * lines are the same on every visit, because they are seeded.
 *
 * Reduced motion: the base copy only.
 */

const BANDS = [
  { top: 18, bottom: 58 },
  { top: 57, bottom: 22 },
] as const;

export function Fracture({ text }: { text: string }) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const bands = gsap.utils.toArray<HTMLElement>('[data-band]');
        const rand = mulberry32(hashSeed(`fracture:${text}`));
        const shear = () => (rand() - 0.5) * 0.14;

        const burst = gsap.timeline({ repeat: -1, repeatDelay: 2.2, delay: 0.8 });
        for (let step = 0; step < 4; step++) {
          burst.to(bands, {
            xPercent: () => shear() * 100,
            opacity: 1,
            duration: 0.06,
            ease: 'steps(1)',
          });
        }
        burst.to(bands, { xPercent: 0, opacity: 0, duration: 0.18, ease: 'power3.out' });
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <span className="fracture" ref={root}>
      <span className="fracture-base">{text}</span>
      {BANDS.map((band, i) => (
        <span
          key={i}
          className="fracture-band"
          aria-hidden="true"
          data-band
          style={{ clipPath: `inset(${band.top}% 0 ${band.bottom}% 0)` }}
        >
          {text}
        </span>
      ))}
    </span>
  );
}
