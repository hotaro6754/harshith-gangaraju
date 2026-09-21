'use client';

import { useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { useRef, useState } from 'react';

import { Reveal } from '@/components/motion/Reveal';
import { PRINCIPLES, QUOTES, ROLES } from '@/content/profile';

/**
 * Section 03: Practice.
 *
 * The ordering is the whole opinion: correctness first, novelty last. As a
 * flat table that only registered if you read the numbers. Here the type
 * size *is* the rank, so the priority is legible before a single word is
 * read, and scrolling lights each rung in turn so reading the ladder is its
 * own small descent.
 *
 * The scroll-linked highlight reads `useScroll` against the list itself. The
 * list is deliberately not wrapped in a Reveal: Motion's scroll progress
 * ignores CSS transforms on the target and its ancestors, and a Reveal is a
 * transform, so wrapping it would silently skew which rung lights up.
 *
 * Every rung and every note is always in the DOM and always legible; the
 * highlight only shifts emphasis. Under reduced motion there is no scroll
 * coupling at all.
 */
export function Practice() {
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 65%', 'end 45%'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (reduced) return;
    const next = Math.min(PRINCIPLES.length - 1, Math.max(0, Math.floor(value * PRINCIPLES.length)));
    // Seven possible values; React only re-renders when the rung changes.
    setActive((current) => (current === next ? current : next));
  });

  return (
    <section className="section section-practice" id="practice" aria-labelledby="practice-title">
      <div className="section-head">
        <h2 className="section-title" id="practice-title">
          Practice
        </h2>
        <p className="section-note">What I optimise for, in order. The size is the rank.</p>
      </div>

      <ol className="ladder" ref={listRef} data-static={reduced ? 'true' : 'false'}>
        {PRINCIPLES.map((principle, i) => (
          <li
            key={principle.rank}
            className="rung"
            data-active={reduced || i === active ? 'true' : 'false'}
            style={{ '--rung': i } as React.CSSProperties}
            onPointerEnter={() => !reduced && setActive(i)}
          >
            <span className="rung-index">{String(i + 1).padStart(2, '0')}</span>
            <span className="rung-name">{principle.rank}</span>
            <span className="rung-note">{principle.note}</span>
          </li>
        ))}
      </ol>

      <Reveal>
        <blockquote className="practice-quote">{QUOTES.overbuilding}</blockquote>
      </Reveal>

      <div className="roles-block">
        <h3 className="roles-title">Where I have had to mean it</h3>
        <ul className="roles">
          {ROLES.map((role, i) => (
            <Reveal as="li" key={`${role.org}-${role.title}`} delay={i * 0.06}>
              <span className="role-title">{role.title}</span>
              <span className="role-org">{role.org}</span>
              <span className="role-note">{role.note}</span>
            </Reveal>
          ))}
        </ul>
        <p className="roles-quote">{QUOTES.ownership}</p>
      </div>
    </section>
  );
}
