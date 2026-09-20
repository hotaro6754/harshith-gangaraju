'use client';

import { motion, type HTMLMotionProps } from 'motion/react';

/**
 * Scroll-triggered reveal.
 *
 * Motion rather than GSAP because nothing here is inside a pinned
 * ScrollTrigger — that is the boundary rule the whole codebase runs on — and
 * because `whileInView` uses a pooled IntersectionObserver, which is the right
 * mechanism for "did this enter the viewport" and costs nothing when it has
 * not.
 *
 * `once` is the default on purpose: content that re-animates every time it
 * scrolls back into view is irritating to read.
 */

type RevealElement = 'div' | 'section' | 'li' | 'article';

export interface RevealProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'whileInView' | 'viewport' | 'transition'> {
  /** Seconds. Used to stagger siblings without a parent orchestrator. */
  delay?: number;
  /** Vertical travel in pixels. */
  distance?: number;
  as?: RevealElement;
}

export function Reveal({
  children,
  delay = 0,
  distance = 22,
  as = 'div',
  ...rest
}: RevealProps) {
  // Motion types each intrinsic element against its own HTMLElement, so a
  // polymorphic wrapper cannot satisfy all of them at once. The props we
  // accept are the div set, which is a superset of what the others need for
  // this component's purposes.
  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.42, delay, ease: [0.2, 0.8, 0.2, 1] }}
      {...rest}
    >
      {children}
    </Component>
  );
}
