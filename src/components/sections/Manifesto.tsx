'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fragment, useRef } from 'react';

import { hashSeed, mulberry32 } from '@/lib/ridge';
import { refreshWhenFontsReady } from '@/lib/scroll';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The manifesto, performed rather than displayed.
 *
 * Four lines, and the motion does what each one says. The first two are read
 * into existence, letter by letter, as you scroll. "Break it." fills in and
 * then comes apart: every character flies off on its own path. "Then build it
 * better." assembles out of the scatter. A fade-up would have treated this as
 * a quote; this treats it as a process, which is what it describes.
 *
 * GSAP, pinned and scrubbed, because the sequence is choreography over one
 * scroll distance. Characters are authored spans rather than a runtime split,
 * so React owns every node and nothing has to rewrite the DOM. Scatter paths
 * are seeded, never `Math.random()`, so the break is the same every visit.
 *
 * Reduced motion gets the four lines, full strength and still. It is the
 * content either way; the performance is the enhancement.
 */

type Role = 'read' | 'break' | 'build';

const LINES: { text: string; indent: 0 | 1 | 2; role: Role }[] = [
  { text: "Don't just use it.", indent: 0, role: 'read' },
  { text: 'Understand it.', indent: 1, role: 'read' },
  { text: 'Break it.', indent: 2, role: 'break' },
  { text: 'Then build it better.', indent: 1, role: 'build' },
];

function Line({ text, indent, role }: (typeof LINES)[number]) {
  const words = text.split(' ');
  return (
    <p className="manifesto-line" data-indent={indent} data-role={role}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <Fragment key={`${word}-${w}`}>
            <span className="manifesto-word">
              {[...word].map((char, c) => (
                <span className="manifesto-char" data-char key={`${char}-${c}`}>
                  {char}
                </span>
              ))}
            </span>
            {w < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </p>
  );
}

export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          wide: '(min-width: 861px) and (prefers-reduced-motion: no-preference)',
          narrow: '(max-width: 860px) and (prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { wide } = context.conditions as Record<string, boolean>;
          const section = root.current;
          if (!section) return;

          const lines = gsap.utils.toArray<HTMLElement>('.manifesto-line', section);
          const chars = (line: HTMLElement) => gsap.utils.toArray<HTMLElement>('[data-char]', line);
          const [useIt, understand, breakIt, build] = lines;

          // Seeded scatter: the same break on every visit, and nothing that
          // could differ between server and client.
          const rand = mulberry32(hashSeed('manifesto-break'));
          const spread = wide ? 1 : 0.55;
          const scatter = (els: HTMLElement[]) =>
            els.map(() => ({
              x: (rand() - 0.5) * 520 * spread,
              y: (rand() - 0.5) * 360 * spread,
              rotation: (rand() - 0.5) * 140,
            }));

          const unread = 0.14;
          gsap.set([...chars(useIt), ...chars(understand), ...chars(breakIt)], { opacity: unread });

          const buildScatter = scatter(chars(build));
          chars(build).forEach((el, i) => gsap.set(el, { ...buildScatter[i], opacity: 0 }));

          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section,
              start: wide ? 'top top' : 'top 70%',
              end: wide ? '+=240%' : 'bottom 40%',
              pin: wide,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // Read the first two lines into existence.
          timeline
            .to(chars(useIt), { opacity: 1, stagger: 0.04, duration: 0.4 })
            .to(chars(understand), { opacity: 1, stagger: 0.04, duration: 0.4 })
            .to(chars(breakIt), { opacity: 1, stagger: 0.04, duration: 0.3 });

          // Break it. Every character leaves on its own path.
          const breakScatter = scatter(chars(breakIt));
          timeline.to(
            chars(breakIt),
            {
              x: (i) => breakScatter[i].x,
              y: (i) => breakScatter[i].y,
              rotation: (i) => breakScatter[i].rotation,
              opacity: 0.18,
              duration: 0.7,
              ease: 'power2.in',
              stagger: { each: 0.02, from: 'center' },
            },
            '+=0.15',
          );

          // Then build it better: out of the scatter, into place.
          timeline.to(
            chars(build),
            {
              x: 0,
              y: 0,
              rotation: 0,
              opacity: 1,
              duration: 0.9,
              ease: 'power3.out',
              stagger: { each: 0.025, from: 'random' },
            },
            '-=0.3',
          );

          timeline.to({}, { duration: 0.35 });
        },
      );

      // The pin's start depends on the display face having landed.
      // Shared with every other pinned section: one refresh, not one each.
      refreshWhenFontsReady();

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section className="manifesto" ref={root} aria-labelledby="manifesto-title">
      <h2 className="sr-only" id="manifesto-title">
        How I work
      </h2>

      <div className="manifesto-lines">
        {LINES.map((line) => (
          <Line key={line.text} {...line} />
        ))}
      </div>
    </section>
  );
}
