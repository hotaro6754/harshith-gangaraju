'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The opening frame.
 *
 * Two rules shape this. It does not fake progress — there is no invented
 * percentage counting to 100 while nothing loads. It reports two things that
 * are genuinely true or not yet true: whether the display face has arrived,
 * and whether the environment has painted a frame. When both are real, it
 * leaves.
 *
 * And it does not tax people for being fast. There is a short floor purely so
 * the reveal is not a flicker, and on a warm cache the whole thing is over in
 * a few hundred milliseconds. A three-second hold would be theatre charged to
 * the visitor.
 *
 * It runs once per session. An opening frame is an opening, and replaying it
 * every time someone comes back from a case study would be an obstacle
 * wearing an opening's clothes.
 */

const SESSION_KEY = 'aizen:opened';
/** Long enough that the reveal reads as a transition, not a flash. */
const MIN_VISIBLE_MS = 420;
/** Hard ceiling. Nothing may hold the site behind this overlay for longer. */
const FAILSAFE_MS = 2200;

interface Step {
  id: string;
  label: string;
}

const STEPS: Step[] = [
  { id: 'type', label: 'Typefaces' },
  { id: 'scene', label: 'Environment' },
];

export function Preloader() {
  // Starts false so the server and the first client render agree; the overlay
  // itself is server-rendered and removed here, which is what makes the
  // no-JS case safe.
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  // Both are written in an effect, never during render: `Date.now` is impure,
  // and a ref initialised during render would be too.
  const startedAt = useRef<number | null>(null);
  const instant = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
    let cancelled = false;

    const mark = (id: string) => {
      if (!cancelled) setReady((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    };

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      // Private mode or blocked storage. Showing the opening again is a
      // perfectly acceptable failure.
    }

    if (seen) {
      // Already opened this session. That is just another external fact, so
      // it is reported through the same channel as the rest — asynchronously,
      // never synchronously from the effect body — and skips the floor.
      instant.current = true;
      queueMicrotask(() => {
        for (const step of STEPS) mark(step.id);
      });
      return () => {
        cancelled = true;
      };
    }

    // Real signal: the display face is what the hero is composed in, so its
    // arrival genuinely gates the first frame being correct.
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(() => mark('type'));

    // Real signal: two animation frames means the scene has been through
    // layout and paint at least once.
    requestAnimationFrame(() => requestAnimationFrame(() => mark('scene')));

    // Failsafe, and not a workaround — a page opened in a background tab is
    // a normal thing, and there `requestAnimationFrame` is suspended
    // indefinitely. Without this the opening frame would wait for a paint
    // that is never coming and hold the whole site behind it. An overlay that
    // can trap the page is a worse bug than an overlay that leaves early.
    const escape = window.setTimeout(() => {
      for (const step of STEPS) mark(step.id);
    }, FAILSAFE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(escape);
    };
  }, []);

  const allReady = STEPS.every((step) => ready[step.id]);

  useEffect(() => {
    if (!allReady || done) return;

    const elapsed = Date.now() - (startedAt.current ?? Date.now());
    const wait = instant.current ? 0 : Math.max(0, MIN_VISIBLE_MS - elapsed);

    const timer = window.setTimeout(() => {
      setDone(true);
      try {
        window.sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // Not being able to remember is harmless.
      }
    }, wait);

    return () => window.clearTimeout(timer);
  }, [allReady, done]);

  // Locks scrolling while the opening is up, so the hero timeline cannot be
  // scrubbed past before anyone has seen it.
  useEffect(() => {
    if (done) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [done]);

  return (
    <div className="preloader" data-done={done} aria-hidden={done} role="status" aria-live="polite">
      <div className="preloader-inner">
        <p className="preloader-name">
          <span>Harshith</span>
          <span>Gangaraju</span>
        </p>

        <ul className="preloader-steps">
          {STEPS.map((step) => (
            <li key={step.id} data-ready={Boolean(ready[step.id])}>
              <span className="preloader-step-label">{step.label}</span>
              <span className="preloader-step-rule" aria-hidden="true" />
            </li>
          ))}
        </ul>

        <p className="preloader-disciplines">Cybersecurity · AI · Infrastructure</p>
      </div>
    </div>
  );
}
