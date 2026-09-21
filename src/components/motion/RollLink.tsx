'use client';

import { motion, type Variants } from 'motion/react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/**
 * A link whose label turns over.
 *
 * The label is set twice, stacked. On hover or keyboard focus the top copy
 * leaves upward one letter at a time and the copy underneath arrives into its
 * place, so the word appears to roll rather than change colour. Motion, not
 * GSAP: this is pointer state, and variants propagate from the link to every
 * letter without any of them needing a handler.
 *
 * Reduced motion keeps the link and drops the roll.
 */

const EASE = [0.65, 0, 0.35, 1] as const;
const STAGGER = 0.018;

const over: Variants = {
  rest: { y: '0%' },
  hover: (i: number) => ({ y: '-100%', transition: { duration: 0.42, ease: EASE, delay: i * STAGGER } }),
};

const under: Variants = {
  rest: { y: '100%' },
  hover: (i: number) => ({ y: '0%', transition: { duration: 0.42, ease: EASE, delay: i * STAGGER } }),
};

function Row({ label, copy }: { label: string; copy: 'over' | 'under' }) {
  return (
    <span className="roll-row" data-copy={copy} aria-hidden="true">
      {[...label].map((char, i) => (
        <motion.span
          className="roll-char"
          key={`${char}-${i}`}
          custom={i}
          variants={copy === 'over' ? over : under}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

type RollLinkProps = {
  label: string;
  /** Rendered after the rolling label, outside it (an arrow, say). */
  trailing?: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof motion.a>, 'children'>;

export function RollLink({ label, trailing, ...rest }: RollLinkProps) {
  // Reduced motion is handled in CSS rather than by branching here: a
  // media-query hook reads differently on the server and would mismatch.
  return (
    <motion.a {...rest} initial="rest" animate="rest" whileHover="hover" whileFocus="hover">
      <span className="sr-only">{label}</span>
      <span className="roll">
        <Row label={label} copy="over" />
        <Row label={label} copy="under" />
      </span>
      {trailing}
      {rest.target === '_blank' && <span className="sr-only"> (opens in a new tab)</span>}
    </motion.a>
  );
}
