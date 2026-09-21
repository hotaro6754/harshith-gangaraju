'use client';

import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';

/**
 * Letters that arrive from depth and converge into a word.
 *
 * Derived from Skiper 31 (skiper-ui.com/v1/skiper31), which offsets each
 * character by its distance from the centre (`x` and `rotateX`, both
 * `distance * 50`) and eases that to zero over the first half of the scroll.
 * Understood, then changed:
 *
 * - The original spreads letters on one plane and tilts them all the same
 *   way, so the word opens like a fan. Here each letter also sits back in `z`
 *   by its distance and turns on `rotateY` toward the centre, so the word
 *   assembles out of depth, which is the site's whole spatial idea.
 * - Offsets are in `em`, not pixels, so the spread scales with the type
 *   instead of being tuned for one font size.
 * - The distance is measured across the whole phrase, spaces included, so a
 *   two-word line converges as one object rather than as two.
 * - No Lenis. The original ships a smooth-scroll library to make the scrub
 *   feel weighted; a spring on the progress gets the same weight for none of
 *   the cost, and leaves native scrolling alone.
 *
 * Motion, not GSAP: it is one scroll value mapped to transforms, with no
 * pinning or sequencing. The target is the untransformed wrapper, because
 * Motion's scroll progress ignores transforms on the target and ancestors.
 *
 * Without JS the letters render at their scattered start but fully legible;
 * under reduced motion CSS pins them in place.
 */

interface ConvergeTextProps {
  text: string;
  className?: string;
  /** Scroll progress over which the letters converge. */
  range?: [number, number];
}

function Letter({
  char,
  distance,
  progress,
  range,
}: {
  char: string;
  distance: number;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const spread = Math.abs(distance);
  const x = useTransform(progress, range, [`${distance * 0.55}em`, '0em']);
  const z = useTransform(progress, range, [`${-spread * 0.9}em`, '0em']);
  // Clamped short of edge-on: past 90° the outer letters show their backs,
  // and a long phrase would put them there.
  const tilt = Math.max(-72, Math.min(72, distance * 26));
  const rotateX = useTransform(progress, range, [tilt, 0]);
  const rotateY = useTransform(progress, range, [distance * -9, 0]);
  const opacity = useTransform(progress, range, [Math.max(0.18, 1 - spread * 0.12), 1]);

  return (
    <motion.span
      className="converge-char"
      style={{ x, z, rotateX, rotateY, opacity }}
      data-space={char === ' ' ? 'true' : undefined}
    >
      {char === ' ' ? ' ' : char}
    </motion.span>
  );
}

export function ConvergeText({ text, className, range = [0, 1] }: ConvergeTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    // From entering near the bottom of the viewport to crossing its upper
    // third: the whole convergence happens where it can be read.
    offset: ['start 95%', 'start 30%'],
  });
  // The weight Skiper gets from Lenis, applied to one value instead of to
  // the whole page's scrolling.
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.35 });

  const chars = [...text];
  const centre = (chars.length - 1) / 2;

  return (
    <div className={['converge', className].filter(Boolean).join(' ')} ref={ref}>
      <span className="sr-only">{text}</span>
      <span className="converge-word" aria-hidden="true">
        {chars.map((char, i) => (
          <Letter
            key={`${char}-${i}`}
            char={char}
            distance={i - centre}
            progress={progress}
            range={range}
          />
        ))}
      </span>
    </div>
  );
}
