'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { BLUR_LAYERS, SCENE, EnvironmentScene } from '@/components/environment/EnvironmentScene';
import { ENVIRONMENTS } from '@/lib/environments';
import { HERO_ENVIRONMENT } from '@/lib/hero-environment';
import { refreshWhenFontsReady } from '@/lib/scroll';

import { DepthMarkers } from './DepthMarkers';
import { KineticBand } from './KineticBand';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const RANGES = ENVIRONMENTS[HERO_ENVIRONMENT].ranges;

/**
 * Depth speed for a range, as a fraction of the descent.
 *
 * This is the site's argument, not decoration: a range's speed is its
 * abstraction layer. Near ranges — the things you operate — rush past. Far
 * ranges — the things you model — barely shift.
 */
const depth = (index: number): number =>
  RANGES === 1 ? 0 : index / (RANGES - 1);

/**
 * The hero's one timing rule: the headline owns the frame, then hands it over.
 * Nothing else may appear before HANDOVER, because two display layers in the
 * same optical space is what makes type look mangled.
 */
const HEADLINE_OUT = 0.3;
const HANDOVER = HEADLINE_OUT + 0.12;

/**
 * Authored line by line, so nothing has to rewrite the DOM to animate it.
 * His own words. The second sentence is the whole portfolio in one line, and
 * it is far more his than anything written *about* him would be.
 */
const HEADLINE = ['I build systems.', 'Then I try to find', 'where they break.'];

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

          // Reduced motion is a designed variant, not a subtraction: the scene
          // is static, the headline is simply present, and nothing is pinned.
          //
          // The depth markers still have to be there. They start hidden in CSS
          // so the scroll timeline can bring them in, which means without this
          // they would silently disappear for exactly the people who cannot
          // watch them arrive — and they carry the whole point of the
          // landscape.
          if (reduced) {
            gsap.set('[data-marker]', { opacity: 1, x: 0 });
            return;
          }

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: mobile ? '+=150%' : '+=200%',
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // ---- The descent ---------------------------------------------
          // Not a parallax slide. Ranges spread *around* the horizon rather
          // than all sliding one way: everything nearer than the pivot falls,
          // everything beyond it rises, and all of it grows. That is what a
          // descent toward a horizon actually looks like, and it keeps the
          // frame populated — translating every layer in the same direction
          // just empties it.
          //
          // The scale is what makes it read as travel rather than as layers
          // moving at different speeds, which is the generic version.
          const travel = mobile ? 300 : 460;
          const PIVOT = 0.3;

          for (let i = 0; i < RANGES; i++) {
            const d = depth(i);
            const y = travel * (d - PIVOT) * 0.62;

            // Transforms are written straight onto the groups.
            //
            // The previous version animated CSS custom properties on the hero
            // root, on the theory that six variable writes beat thirty
            // transform writes. That is exactly backwards: changing a custom
            // property on an ancestor invalidates style for every descendant
            // that inherits it — the whole scene, every frame — and the
            // resulting transform is not composited. Thirty direct writes are.
            const groups = gsap.utils.toArray<SVGGElement>(`[data-range="${i}"]`);

            // The blurred ranges translate but never scale. An SVG filter is
            // re-rasterised whenever the element it applies to changes size,
            // which is the single most expensive thing this scene can do;
            // translating an already-rasterised layer is nearly free.
            const blurred = i < BLUR_LAYERS;

            timeline.fromTo(
              groups,
              { y: 0, scale: 1 },
              {
                y,
                scale: blurred ? 1 : 1 + d * (mobile ? 0.22 : 0.38),
                svgOrigin: `${SCENE.width / 2} ${SCENE.height * 0.44}`,
                ease: 'none',
                duration: 1,
              },
              0,
            );

            // Markers ride their range, so they move with the same value.
            // Not every range carries one; an empty target only earns a
            // console warning on every load.
            const riders = gsap.utils.toArray<HTMLElement>(`[data-marker-range="${i}"]`);
            if (riders.length) {
              timeline.fromTo(riders, { y: 0 }, { y, ease: 'none', duration: 1 }, 0);
            }
          }

          // The light holds near the horizon while the valley moves — the one
          // fixed thing to measure the descent against.
          timeline.fromTo(
            '.env-light',
            { x: 0, y: 0 },
            { x: -70, y: 60, ease: 'none', duration: 1 },
            0,
          );

          // ---- Depth markers -------------------------------------------
          // The concept, stated. Each marker rides its own range, so reading
          // it and watching it move are the same act. They take over the
          // frame once the headline has cleared it.
          const markers = gsap.utils.toArray<HTMLElement>('[data-marker]');
          timeline.fromTo(
            markers,
            { opacity: 0, x: -14 },
            { opacity: 1, x: 0, ease: 'power2.out', stagger: 0.05, duration: 0.14 },
            HANDOVER,
          );
          // Gone before the threshold band arrives (0.76): the band's outlined
          // words and the marker labels share the lower third of the frame,
          // and overlapping they read as a collision rather than as layers.
          timeline.to(markers, { opacity: 0, x: 10, ease: 'power1.in', duration: 0.06 }, 0.68);

          // ---- Headline ------------------------------------------------
          // The lines are authored markup, not a runtime split. SplitText
          // rewrites the DOM underneath React, and React then cannot find the
          // nodes it owns, which crashes reconciliation outright. This
          // headline has explicit line breaks, so splitting it at runtime was
          // only ever re-deriving something already known.
          //
          // Two animations touch these lines: a one-shot reveal on load and a
          // scrubbed drift tied to the scrollbar. They must not share a target
          // or a property, because a scrubbed tween re-asserts its start value
          // every frame and will hold the reveal permanently half-finished. So
          // the reveal moves the inner line; the drift moves the mask.
          const masks = gsap.utils.toArray<HTMLElement>('[data-line]');
          const inners = gsap.utils.toArray<HTMLElement>('[data-line-inner]');

          gsap.from(inners, {
            yPercent: 115,
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.08,
            onComplete: () => {
              // The mask exists to clip the rise, and its job is done.
              // Leaving it on clips the drift.
              for (const mask of masks) mask.style.overflow = 'visible';
            },
          });

          // Drift and exit must not overlap in time either: a second tween on
          // yPercent starting while the first is still running re-asserts the
          // first's value, and the headline never leaves.
          masks.forEach((mask, i) => {
            timeline.to(
              mask,
              { xPercent: i * -2.5, yPercent: -8 - i * 3, ease: 'none', duration: HEADLINE_OUT },
              0,
            );
          });

          // Out before anything else arrives. Nothing else may occupy this
          // optical space until the exit has finished.
          timeline.to(
            masks,
            { yPercent: -95, opacity: 0, ease: 'power2.in', stagger: 0.03, duration: 0.12 },
            HEADLINE_OUT,
          );

          // ---- Threshold band ------------------------------------------
          // One line, crossing once, as the hero hands over. It arrives with
          // the threshold rather than washing across the whole descent — see
          // KineticBand for why that changed.
          const BAND_IN = 0.76;

          timeline.fromTo(
            '.kinetic-band',
            { opacity: 0 },
            { opacity: 1, ease: 'none', duration: 0.08 },
            BAND_IN,
          );

          timeline.fromTo(
            '.kinetic-track',
            { xPercent: 4 },
            { xPercent: -34, ease: 'none', duration: 1 - BAND_IN },
            BAND_IN,
          );

          // ---- Chrome --------------------------------------------------
          // The name and disciplines belong to the opening frame, so they
          // leave with the headline rather than lingering over the descent.
          timeline.to(
            ['.hero-name', '[data-hero-sub]', '[data-hero-cta]'],
            { opacity: 0, y: -18, ease: 'none', duration: 0.1 },
            0,
          );

          // ---- The threshold ------------------------------------------
          // The hero does not simply run out. At the end of the descent the
          // next chapter is named, so leaving the landscape reads as crossing
          // into somewhere rather than as the animation finishing.
          timeline.fromTo(
            '[data-hero-threshold]',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, ease: 'power2.out', duration: 0.08 },
            0.9,
          );
        },
      );

      // The display face swaps in after first paint and changes the
      // headline's height, which moves the pin's start. Without this the
      // first scroll after a cold load lands on stale measurements and the
      // hero appears to slip before it catches — every scroll after it is
      // fine, which is what makes the bug easy to miss.
      // Shared with every other pinned section: one refresh, not one each.
      refreshWhenFontsReady();

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="hero" data-env={HERO_ENVIRONMENT}>
      {/* Sky, light, and every range but the nearest. */}
      <EnvironmentScene id={HERO_ENVIRONMENT} part="back" />

      <DepthMarkers environment={HERO_ENVIRONMENT} />

      <div className="hero-content">
        {/* The headline stands alone at the centre. The name and disciplines
            used to sit above it as a small tracked-caps label, which is the
            most common hero pattern there is; as credits along the bottom
            edge they read like the title card of a film instead. */}
        <div className="hero-composition">
          <h1 className="hero-headline" data-hero-headline>
            {HEADLINE.map((line) => (
              <span className="hero-line-mask" data-line key={line}>
                <span className="hero-line" data-line-inner>
                  {line}
                </span>
              </span>
            ))}
          </h1>
        </div>

        <div className="hero-credits">
          <p className="hero-name">
            <span>Harshith</span> <span>Gangaraju</span>
          </p>

          {/* A real link, not a decorative cue: keyboard reachable, and it
              goes where it says. The drawn line is the flourish. */}
          <a className="hero-cta" href="#work" data-hero-cta data-cursor="Enter">
            <span className="hero-cta-label">Enter the work</span>
            <span className="hero-cta-line" aria-hidden="true" />
          </a>

          <p className="hero-disciplines" data-hero-sub>
            Cybersecurity · AI · Infrastructure
          </p>
        </div>
      </div>

      <KineticBand
        words={['SECURITY', 'SYSTEMS', 'INTELLIGENCE', 'SOFTWARE']}
        className="hero-band"
      />

      {/* The nearest range, its fog and the ground wash — drawn over the
          headline, so the closest mountains occlude the type. */}
      <EnvironmentScene id={HERO_ENVIRONMENT} part="front" />

      {/* Dissolves the scene's floor into the colour the page continues in,
          so the hero resolves into the descent instead of being cropped. */}
      <div className="hero-seam" aria-hidden="true" />

      {/* The threshold. Announced only as the descent ends, so crossing out
          of the hero is a deliberate moment rather than the scene running out. */}
      <p className="hero-threshold" data-hero-threshold aria-hidden="true">
        How I work
      </p>
    </div>
  );
}
