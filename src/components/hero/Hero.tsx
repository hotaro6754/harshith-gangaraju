'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useRef } from 'react';

import { EnvironmentStack } from '@/components/environment/EnvironmentStack';
import { environment } from '@/components/environment/environment-store';
import { SoundingLine } from '@/components/environment/SoundingLine';

import { KineticBand } from './KineticBand';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/**
 * How far the environment travels across the pin. The hero covers the first
 * three states; the rest belong to the sections below it.
 */
const HERO_ENV_SPAN = 2;

/**
 * Depth speeds, as a fraction of the pin distance.
 *
 * These are the site's argument, not decoration: a range's parallax speed is
 * its abstraction layer. Near ranges — the things you operate — move fastest;
 * far ranges — the things you model — barely move at all.
 */
const parallaxSpeed = (index: number, count: number): number =>
  0.06 + (count === 1 ? 0 : index / (count - 1)) * 0.34;

const MAX_RANGES = 6;

export function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          reduced: '(prefers-reduced-motion: reduce)',
          mobile: '(prefers-reduced-motion: no-preference) and (max-width: 640px)',
          desktop: '(prefers-reduced-motion: no-preference) and (min-width: 641px)',
        },
        (context) => {
          const { reduced, mobile } = context.conditions as Record<string, boolean>;

          // Reduced motion is a designed variant, not a subtraction. The
          // environment still advances — it carries meaning — but it steps on
          // section entry instead of being dragged by the scrollbar, and
          // nothing is pinned.
          if (reduced) {
            ScrollTrigger.create({
              trigger: root.current,
              start: 'top top',
              end: 'bottom top',
              onUpdate: (self) => {
                if (environment.manual) return;
                environment.set(Math.round(self.progress * HERO_ENV_SPAN));
              },
            });
            return;
          }

          const pinDistance = mobile ? '+=160%' : '+=250%';
          const parallaxRange = mobile ? 0.55 : 1;

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: pinDistance,
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (environment.manual) return;
                environment.set(self.progress * HERO_ENV_SPAN);
              },
            },
          });

          // ---- Parallax ------------------------------------------------
          // Six CSS variables rather than thirty inline transforms: GSAP
          // writes once per depth and the browser composites every stacked
          // scene from the same value.
          const travel = (mobile ? 260 : 420) * parallaxRange;
          for (let i = 0; i < MAX_RANGES; i++) {
            timeline.fromTo(
              root.current,
              { [`--parallax-${i}`]: '0px' },
              {
                [`--parallax-${i}`]: `${-travel * parallaxSpeed(i, MAX_RANGES)}px`,
                ease: 'none',
                duration: 1,
              },
              0,
            );
          }

          // ---- Light source -------------------------------------------
          timeline.fromTo(
            root.current,
            { '--light-x': '0px', '--light-y': '0px' },
            { '--light-x': '120px', '--light-y': '70px', ease: 'none', duration: 1 },
            0,
          );

          // ---- Headline ------------------------------------------------
          const headline = root.current?.querySelector<HTMLElement>('[data-hero-headline]');
          if (headline) {
            SplitText.create(headline, {
              type: 'lines',
              linesClass: 'hero-line',
              mask: 'lines',
              autoSplit: true,
              onSplit: (split) => {
                const reveal = gsap.from(split.lines, {
                  yPercent: 120,
                  duration: 1.1,
                  ease: 'expo.out',
                  stagger: 0.08,
                  onComplete: () => {
                    // The mask exists to clip the rise, and its job is done.
                    // Leaving it on clips the horizontal drift below, which
                    // reads as broken text rather than as depth.
                    for (const line of split.lines) {
                      const wrapper = line.parentElement;
                      if (wrapper) wrapper.style.overflow = 'visible';
                    }
                  },
                });

                // The lines drift apart as the scene opens up, so the headline
                // reads as sitting in the landscape rather than on top of it.
                split.lines.forEach((line, i) => {
                  timeline.to(
                    line,
                    {
                      xPercent: i % 2 === 0 ? -5 : 5,
                      yPercent: -16 - i * 6,
                      ease: 'none',
                      duration: 1,
                    },
                    0,
                  );
                });

                return reveal;
              },
            });

            timeline.to(headline, { opacity: 0, ease: 'none', duration: 0.25 }, 0.68);
          }

          // ---- Kinetic bands -------------------------------------------
          // One row moves with the scroll, the next against it. The shear
          // between them is what makes the scroll feel physical; doing it in
          // the master timeline keeps it in step with the parallax.
          const rows = gsap.utils.toArray<HTMLElement>('[data-band-row]');
          rows.forEach((row, i) => {
            const reverse = row.dataset.direction === 'reverse';
            const distance = (mobile ? 18 : 34) + i * 4;
            timeline.fromTo(
              row.querySelector('.kinetic-track'),
              { xPercent: reverse ? -distance : distance - 33.333 },
              {
                xPercent: reverse ? distance - 33.333 : -distance,
                ease: 'none',
                duration: 1,
              },
              0,
            );
          });

          timeline.fromTo(
            '.kinetic-band',
            { opacity: 0 },
            { opacity: 1, ease: 'none', duration: 0.18 },
            0.42,
          );

          // ---- Chrome --------------------------------------------------
          timeline.to(
            root.current?.querySelector('[data-hero-cue]') ?? [],
            { opacity: 0, ease: 'none', duration: 0.15 },
            0,
          );
        },
      );

      // Whoever touched the environment last wins. Scrolling takes control
      // back from the Sounding Line.
      const release = () => {
        environment.manual = false;
      };
      window.addEventListener('wheel', release, { passive: true });
      window.addEventListener('touchmove', release, { passive: true });

      return () => {
        window.removeEventListener('wheel', release);
        window.removeEventListener('touchmove', release);
        media.revert();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="hero">
      {/* Sky, light, and every range but the nearest. */}
      <EnvironmentStack part="back" ownsDocumentEnv maxRanges={MAX_RANGES} />

      <div className="hero-content">
        <header className="hero-meta">
          <span>Harshith Gangaraju</span>
          <span>Cybersecurity · AI · Infrastructure</span>
        </header>

        <h1 className="hero-headline" data-hero-headline>
          I build systems
          <br />
          that watch,
          <br />
          decide and hold.
        </h1>
      </div>

      <KineticBand
        words={['SECURITY', 'SYSTEMS', 'INTELLIGENCE', 'SOFTWARE']}
        className="hero-band"
      />

      {/* The nearest range, its fog and the ground wash — drawn over the
          headline, so the closest mountains occlude the type. */}
      <EnvironmentStack part="front" maxRanges={MAX_RANGES} />

      <div className="grain" />

      <footer className="hero-cue" data-hero-cue>
        <span>Scroll to descend</span>
        <span aria-hidden="true">↓</span>
      </footer>

      <SoundingLine />
    </div>
  );
}
