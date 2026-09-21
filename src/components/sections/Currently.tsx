'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { Reveal } from '@/components/motion/Reveal';
import { CURRENTLY } from '@/content/profile';

/**
 * Section 04: Currently.
 *
 * The one part of the site with a shelf life, and that is its job: proof the
 * thing is maintained rather than published once. Three equal columns of
 * lists undersold that completely, so it now leads with a sentence that is
 * actually moving, cycling through what is genuinely in progress.
 *
 * The cycling sentence is decoration over real content, never instead of it.
 * It is hidden from assistive tech, because an element that re-announces
 * itself every few seconds is noise, and the full ledger underneath carries
 * every item for screen readers, skimmers and anyone with motion reduced. It
 * pauses off-screen and on hover, and does not run at all under reduced
 * motion.
 */

const GROUPS = ['building', 'learning', 'exploring'] as const;

const CYCLE = GROUPS.flatMap((group) =>
  CURRENTLY[group].map((item) => ({ group, label: item.label })),
);

const INTERVAL_MS = 2600;

export function Currently() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || !inView || paused) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % CYCLE.length), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reduced, inView, paused]);

  const current = CYCLE[index];

  return (
    <section className="section section-currently" id="currently" aria-labelledby="currently-title">
      <h2 className="sr-only" id="currently-title">
        Currently
      </h2>

      <div
        className="now"
        ref={ref}
        aria-hidden="true"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        <span className="now-lead">Currently</span>
        <span className="now-line">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current.group}
              className="now-slot now-verb"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {current.group}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="now-line">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current.label}
              className="now-slot now-object"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1], delay: 0.05 }}
            >
              {current.label}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>

      <div className="ledger">
        {GROUPS.map((group, gi) => (
          <Reveal key={group} delay={gi * 0.06} className="ledger-group">
            <h3 className="ledger-title">{group}</h3>
            <ul className="ledger-list">
              {CURRENTLY[group].map((item) => (
                <li key={item.label} data-live={group === 'building' ? 'true' : 'false'}>
                  <span className="ledger-label">{item.label}</span>
                  {item.note && <span className="ledger-note">{item.note}</span>}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <p className="ledger-updated">Updated {CURRENTLY.updated}</p>
    </section>
  );
}
