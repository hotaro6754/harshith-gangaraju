'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useScroll, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The moving parts of a case study, kept out of the page so the page itself
 * stays a server component.
 */

/**
 * Reading progress: one hairline in the signal colour across the top.
 * Motion, because it is a single scroll value mapped to a transform, and a
 * spring keeps it from ticking visibly on each wheel notch.
 */
export function CaseProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 32, mass: 0.3 });
  return <motion.div className="case-progress" style={{ scaleX }} aria-hidden="true" />;
}

/**
 * The opening frame hands over to the reading.
 *
 * As the hero scrolls away the title lifts faster than the page and the
 * landscape sinks slower, the same differential the home page's hero uses,
 * so arriving on a case study feels like the same world. Transforms only.
 */
export function CaseHeroMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const el = root.current;
        if (!el) return;
        const scroll = { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.5 };
        gsap.to(el.querySelector('[data-case-scene]'), { yPercent: 18, ease: 'none', scrollTrigger: scroll });
        gsap.to(el.querySelector('[data-case-title]'), { yPercent: -28, ease: 'none', scrollTrigger: scroll });
        gsap.to(el.querySelectorAll('[data-case-fade]'), {
          opacity: 0,
          y: -24,
          ease: 'none',
          scrollTrigger: { ...scroll, end: '55% top' },
        });

        // Entrance: the summary and meta rise in after the title has landed
        // (the title itself arrives by view transition from the index).
        gsap.from(el.querySelectorAll('[data-case-rise]'), {
          yPercent: 40,
          opacity: 0,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.08,
          delay: 0.25,
        });
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div className="case-hero-motion" ref={root}>
      {children}
    </div>
  );
}

interface Chapter {
  id: string;
  label: string;
}

/**
 * The chapter index.
 *
 * Built from the headings the MDX actually rendered rather than from a
 * hand-kept list, so it cannot drift from the content. The active chapter
 * is whichever heading most recently crossed the upper third of the screen.
 * Links are ordinary anchors: Lenis intercepts them and eases the jump.
 */
export function CaseIndex() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = [...document.querySelectorAll<HTMLHeadingElement>('.case-body h2[id]')];
    // Reading the DOM the server rendered: there is no other source for it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChapters(headings.map((h) => ({ id: h.id, label: h.textContent ?? '' })));

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '0px 0px -66% 0px' },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  if (!chapters.length) return <nav className="case-index" aria-label="Chapters" />;

  return (
    <nav className="case-index" aria-label="Chapters">
      <ol>
        {chapters.map((chapter, i) => (
          <li key={chapter.id} data-active={chapter.id === active}>
            <a href={`#${chapter.id}`}>
              <span className="case-index-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="case-index-label">{chapter.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
