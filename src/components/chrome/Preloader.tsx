'use client';

import { useEffect, useRef, useState } from 'react';

import { ParticleField } from './ParticleField';

/**
 * The opening frame: a system coming online inside the Moonlit world.
 *
 * The idea borrowed from the reference is a contained field that is
 * initialising — a boundary with something alive inside it. What is
 * deliberately *not* borrowed is how that reference behaves: it runs on a
 * hardcoded three-second timer and displays a percentage that counts to 100
 * while nothing is actually loading. Both are a tax on the visitor dressed as
 * craft.
 *
 * So this reports two things that are genuinely true or not yet true — has
 * the display face arrived, has the scene painted a frame — and leaves when
 * they are. On a warm cache that is a few hundred milliseconds.
 *
 * It shares the hero's palette, typeface, easing and ink colour, because the
 * point is continuity: the same world, before and after. The background is
 * the environment's own sky, so the fade resolves into the hero rather than
 * cutting to it.
 */

const SESSION_KEY = 'aizen:opened';
/** Long enough that the reveal reads as a transition, not a flash. */
const MIN_VISIBLE_MS = 620;
/** Hard ceiling. Nothing may hold the site behind this overlay for longer. */
const FAILSAFE_MS = 2200;
/** The dispersal runs while the overlay fades; they finish together. */
const EXIT_MS = 760;

interface Step {
  id: string;
  index: string;
  label: string;
}

const STEPS: Step[] = [
  { id: 'type', index: '01', label: 'Typefaces' },
  { id: 'scene', index: '02', label: 'Environment' },
];

export function Preloader() {
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  // Both written in an effect, never during render: `Date.now` is impure, and
  // a ref initialised during render would be too.
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

    // Failsafe, and not a workaround — a page opened in a background tab has
    // `requestAnimationFrame` suspended indefinitely. Without a ceiling the
    // opening would wait for a paint that never comes and hold the whole site
    // behind it. An overlay that leaves early is a far smaller bug than one
    // that can never leave.
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
    if (!allReady || leaving) return;

    const elapsed = Date.now() - (startedAt.current ?? Date.now());
    const wait = instant.current ? 0 : Math.max(0, MIN_VISIBLE_MS - elapsed);

    // The exit is two beats: the boundary opens and the field disperses,
    // then the overlay itself resolves into the hero behind it.
    const begin = window.setTimeout(() => setLeaving(true), wait);
    const finish = window.setTimeout(() => {
      setDone(true);
      try {
        window.sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // Not being able to remember is harmless.
      }
    }, wait + (instant.current ? 0 : EXIT_MS));

    return () => {
      window.clearTimeout(begin);
      window.clearTimeout(finish);
    };
  }, [allReady, leaving]);

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
    <div
      className="preloader"
      data-done={done}
      data-leaving={leaving}
      aria-hidden={done}
      role="status"
      aria-live="polite"
    >
      {/* A boundary, not a card: four corner marks and a hairline, closer to
          an instrument's viewfinder than to a panel. */}
      <div className="preloader-frame">
        <ParticleField
          className="preloader-field"
          active={!done}
          dispersing={leaving}
        />

        <span className="preloader-corner" data-corner="tl" aria-hidden="true" />
        <span className="preloader-corner" data-corner="tr" aria-hidden="true" />
        <span className="preloader-corner" data-corner="bl" aria-hidden="true" />
        <span className="preloader-corner" data-corner="br" aria-hidden="true" />

        <div className="preloader-inner">
          <p className="preloader-name">
            <span>Harshith</span>
            <span>Gangaraju</span>
          </p>

          <ul className="preloader-steps">
            {STEPS.map((step) => (
              <li key={step.id} data-ready={Boolean(ready[step.id])}>
                <span className="preloader-step-index">{step.index}</span>
                <span className="preloader-step-label">{step.label}</span>
                <span className="preloader-step-rule" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="preloader-disciplines">Cybersecurity · AI · Infrastructure</p>
    </div>
  );
}
