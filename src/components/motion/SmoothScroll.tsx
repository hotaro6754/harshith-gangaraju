'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Weighted scrolling.
 *
 * The plan originally ruled Lenis out, on the theory that ScrollTrigger's
 * `scrub` smoothing was enough. It is not the same thing: scrub smooths the
 * animations, while the page itself still stops dead on every wheel notch.
 * Five of the six award winners checked while reviewing this site smooth the
 * scroll itself, and next to them this site's pinned sequences felt steppy
 * on a mouse wheel.
 *
 * Wired the way the two libraries expect: one clock (GSAP's ticker drives
 * Lenis, so there is a single rAF loop), and every Lenis scroll tells
 * ScrollTrigger to update in the same frame.
 *
 * Not on touch (native momentum is already right and hijacking it is worse),
 * and not under reduced motion. While the preloader holds the page, wheel
 * input is swallowed rather than smoothed into a scroll it has locked.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.9,
      anchors: { offset: 0 },
      autoRaf: false,
      virtualScroll: () => document.documentElement.style.overflow !== 'hidden',
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Lenis already smooths; GSAP's own lag smoothing on top of it makes
    // pinned sections lurch after a long frame.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}
