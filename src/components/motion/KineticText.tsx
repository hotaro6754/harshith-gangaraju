'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fragment, useRef, type ComponentPropsWithoutRef, type ElementType } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Type that arrives the way it is read.
 *
 * Two behaviours, chosen by what the text is for:
 *
 * - `rise`: a heading or a closing line. Each word lifts out of its own mask
 *   once, on entry, with a slight lean that settles as it lands. It happens
 *   to you; you do not have to work for it.
 * - `fill`: a statement meant to be read slowly. Words start as a ghost and
 *   fill in with scroll, so the reading pace is the scroll pace. Scrubbed,
 *   so scrolling back un-reads it.
 *
 * Words are authored spans, not a runtime split, so React owns every node.
 * The full string is always present for assistive tech; the split copy is
 * hidden from it. Everything is set on the client inside `matchMedia`, so
 * without JS or with reduced motion the text is simply there.
 */

type Mode = 'rise' | 'fill';

type KineticTextProps<T extends ElementType> = {
  as?: T;
  /** One entry per rendered line. A plain string is a single line. */
  text: string | readonly string[];
  mode?: Mode;
  /** Seconds before a `rise` begins, for sequencing against siblings. */
  delay?: number;
} & Omit<ComponentPropsWithoutRef<T>, 'children' | 'as'>;

/** If the entry never registers, show the words anyway after this long. */
const FAILSAFE_MS = 2400;

export function KineticText<T extends ElementType = 'p'>({
  as,
  text,
  mode = 'rise',
  delay = 0,
  className,
  ...rest
}: KineticTextProps<T>) {
  const root = useRef<HTMLElement>(null);
  const lines = typeof text === 'string' ? [text] : text;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const words = gsap.utils.toArray<HTMLElement>('[data-kt-word]', el);
      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: no-preference)', () => {
        if (mode === 'fill') {
          gsap.set(words, { opacity: 0.16 });
          gsap.to(words, {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: {
              trigger: el,
              start: 'top 82%',
              end: 'bottom 48%',
              scrub: 0.6,
            },
          });
          return;
        }

        gsap.set(words, { yPercent: 115, rotate: 5, transformOrigin: '0% 100%' });
        const rise = gsap.to(words, {
          yPercent: 0,
          rotate: 0,
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.055,
          delay,
          paused: true,
        });

        const trigger = ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => rise.play(),
        });

        // Same rule as every other entrance on the site: fail visible.
        const timer = window.setTimeout(() => {
          if (rise.progress() === 0 && ScrollTrigger.isInViewport(el)) rise.play();
        }, FAILSAFE_MS);

        return () => {
          window.clearTimeout(timer);
          trigger.kill();
        };
      });

      return () => media.revert();
    },
    { scope: root, dependencies: [mode, delay] },
  );

  const full = lines.join(' ');

  const Tag = (as ?? 'p') as ElementType;

  return (
    <Tag
      {...rest}
      ref={root}
      className={['kinetic', className].filter(Boolean).join(' ')}
      data-mode={mode}
    >
      <span className="sr-only">{full}</span>
      <span className="kinetic-lines" aria-hidden="true">
        {lines.map((line, l) => (
          <span className="kinetic-line" key={`${line}-${l}`}>
            {line.split(' ').map((word, w, all) => (
              // The space sits outside the mask: trailing whitespace inside an
              // inline-block collapses and the words would touch.
              <Fragment key={`${word}-${w}`}>
                <span className="kinetic-mask">
                  <span className="kinetic-word" data-kt-word>
                    {word}
                  </span>
                </span>
                {w < all.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}
