'use client';

import { motion, useInView, type HTMLMotionProps } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-triggered reveal.
 *
 * Driven by an explicit `useInView` + `animate` rather than `whileInView`.
 * That is not a style preference: `whileInView` did not fire for elements
 * already inside the viewport when they mounted, which meant any short page —
 * or anything above the fold — stayed at its initial state and never became
 * visible at all.
 *
 * The rule this encodes: a reveal animation is an enhancement, and an
 * enhancement that fails must fail *visible*. Content that cannot be read
 * because an observer did not fire is a content bug, not an animation bug.
 * Hence the timeout backstop — if anything goes wrong, the text shows up.
 *
 * Motion rather than GSAP because none of this is inside a pinned
 * ScrollTrigger, which is the boundary rule the codebase runs on.
 */

type RevealElement = 'div' | 'section' | 'li' | 'article';

export interface RevealProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'whileInView' | 'viewport' | 'transition'> {
  /** Seconds. Used to stagger siblings without a parent orchestrator. */
  delay?: number;
  /** Vertical travel in pixels. */
  distance?: number;
  as?: RevealElement;
}

/** Backstop. Long enough not to pre-empt a real scroll, short enough to rescue. */
const FAILSAFE_MS = 1200;

export function Reveal({
  children,
  delay = 0,
  distance = 22,
  as = 'div',
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const [failsafeElapsed, setFailsafeElapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setFailsafeElapsed(true), FAILSAFE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Derived, not stored: `useInView` already holds the latch (`once: true`),
  // so mirroring it into state would be a second source of truth for the
  // same fact.
  const shown = inView || failsafeElapsed;

  // Motion types each intrinsic element against its own HTMLElement, so a
  // polymorphic wrapper cannot satisfy all of them at once. The props we
  // accept are the div set, which covers what the others need here.
  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      ref={ref}
      initial={{ opacity: 0, y: distance }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{ duration: 0.42, delay, ease: [0.2, 0.8, 0.2, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
}
