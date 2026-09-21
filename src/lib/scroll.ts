import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * One re-measure for the whole page once the fonts have landed.
 *
 * Every pinned section depends on the display face: its arrival changes line
 * heights, and so where each pin starts and ends. The hero, the manifesto and
 * the work sequence each used to call `ScrollTrigger.refresh()` on
 * `document.fonts.ready` independently. A refresh re-measures every trigger
 * on the page, pins included, so three of them back to back were most of an
 * 800ms main-thread stall on load, which is also what froze the loader at 0%.
 *
 * Now any number of callers share a single refresh, scheduled once, after
 * fonts are ready and the current work has yielded.
 */

let scheduled = false;

export function refreshWhenFontsReady() {
  if (scheduled || typeof document === 'undefined') return;
  scheduled = true;

  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    requestAnimationFrame(() => {
      scheduled = false;
      ScrollTrigger.refresh();
    });
  });
}
