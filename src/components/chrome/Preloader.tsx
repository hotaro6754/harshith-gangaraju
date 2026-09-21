'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The opening: a box loader with a segmented bar, after the Skiper 15
 * reference. That component is Pro-licensed, so none of its code is used —
 * this is a from-scratch build of the same visual pattern: a small window
 * with a label, two indicator dots, ten blocks that fill one at a time, a
 * percentage, and an upward slide to exit.
 *
 * It runs for about two seconds: long enough to read as an opening, short
 * enough not to be a toll. (It was six; that was the single most expensive
 * thing on the site for a first-time visitor.) Three things keep it honest:
 *
 * - It cannot reach 100% before the page is genuinely ready (display face
 *   loaded, a frame painted). The pacing is authored; completion is not.
 * - It plays once per session. Coming back from a case study does not replay
 *   it.
 * - Escape or a click skips straight to the end.
 */

const SESSION_KEY = 'aizen:opened';
const BLOCKS = 10;

/**
 * Delay before each of the first nine blocks, in ms. Deliberately uneven —
 * a bar that advances at a perfectly constant rate reads as a timer, one
 * that hesitates and catches up reads as work being done. Sums to 1250.
 */
const STEPS = [110, 170, 90, 210, 80, 160, 120, 180, 130];
/** When each of the first nine blocks lands, from first paint. */
const AT = STEPS.map((_, i) => STEPS.slice(0, i + 1).reduce((a, b) => a + b, 0));
const TIMED_MS = AT[AT.length - 1];
/** Pause before the final block lands, once the page is ready. */
const FINAL_BLOCK_MS = 200;
/** How long 100% holds before the box leaves. */
const HOLD_MS = 220;
/** The exit slide. */
const EXIT_MS = 650;
/** Hard ceiling on waiting for readiness signals. */
const READY_FAILSAFE_MS = 1800;

type Phase = 'loading' | 'leaving' | 'done';

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const [ready, setReady] = useState(false);
  const skipped = useRef(false);

  // ---- Start: readiness signals and the authored pacing ----------------
  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      // Private mode or blocked storage: showing it again is harmless.
    }

    if (seen) {
      queueMicrotask(() => {
        if (!cancelled) setPhase('done');
      });
      return () => {
        cancelled = true;
      };
    }

    const markReady = () => {
      if (!cancelled) setReady(true);
    };

    // Real signals. The display face gates the hero looking right, and two
    // frames means the scene has been through layout and paint.
    let fontsReady = false;
    let painted = false;
    const check = () => {
      if (fontsReady && painted) markReady();
    };
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      fontsReady = true;
      check();
    });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        painted = true;
        check();
      }),
    );
    // A background tab never delivers a frame, so readiness cannot be
    // allowed to wait on one forever.
    timers.push(window.setTimeout(markReady, READY_FAILSAFE_MS));

    // The first nine blocks are paced by CSS from first paint (see the
    // markup below), not by timers started here. This effect only runs
    // after hydration, and hydrating this page is most of a second of main
    // thread; timer-driven blocks sat at 0% for all of it, which read as a
    // hang. Here we only note when the CSS schedule has finished, measured
    // from navigation start so it lines up with what is on screen.
    timers.push(
      window.setTimeout(
        () => {
          if (!cancelled && !skipped.current) setProgress(90);
        },
        Math.max(0, TIMED_MS - performance.now()),
      ),
    );

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // ---- Finish: last block, hold, slide away ----------------------------
  useEffect(() => {
    if (phase === 'done') return;

    let timer: number | undefined;

    if (phase === 'loading' && progress === 90 && ready) {
      timer = window.setTimeout(() => setProgress(100), FINAL_BLOCK_MS);
    } else if (phase === 'loading' && progress === 100) {
      timer = window.setTimeout(() => setPhase('leaving'), skipped.current ? 120 : HOLD_MS);
    } else if (phase === 'leaving') {
      timer = window.setTimeout(() => {
        setPhase('done');
        try {
          window.sessionStorage.setItem(SESSION_KEY, '1');
        } catch {
          // Not being able to remember is harmless.
        }
      }, EXIT_MS);
    }

    return () => window.clearTimeout(timer);
  }, [phase, progress, ready]);

  // ---- Skip ------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'loading') return;

    const skip = () => {
      skipped.current = true;
      setReady(true);
      setProgress(100);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skip();
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', skip);
    };
  }, [phase]);

  // ---- Scroll lock -----------------------------------------------------
  // Holds the page still while the loader is up, so the hero's pinned
  // timeline cannot be scrubbed past before anyone has seen it.
  useEffect(() => {
    if (phase === 'done') return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [phase]);

  if (phase === 'done') return null;

  const filled = Math.round(progress / 10);

  return (
    <div className="preloader" data-phase={phase} data-complete={progress === 100}>
      <div
        className="loader-box"
        role="progressbar"
        aria-label="Loading"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div className="loader-head">
          <span className="loader-label">Loader</span>
          <span className="loader-dots" aria-hidden="true">
            <i />
            <i />
          </span>
        </div>

        <div className="loader-track" aria-hidden="true">
          {Array.from({ length: BLOCKS }, (_, i) =>
            i < AT.length ? (
              <span
                key={i}
                className="loader-block"
                data-timed
                style={{ '--at': `${AT[i]}ms` } as React.CSSProperties}
              />
            ) : (
              <span key={i} className="loader-block" data-on={i < filled} />
            ),
          )}
        </div>

        <div className="loader-foot">
          {/* Counts on the same CSS schedule as the blocks until the last
              one, which only JS can know is earned. */}
          <span className="loader-pct" data-counting={progress < 100}>
            {progress < 100 ? null : '100%'}
          </span>
        </div>
      </div>
    </div>
  );
}
