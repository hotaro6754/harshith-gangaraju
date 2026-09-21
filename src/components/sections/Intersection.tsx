'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The position statement, as geometry.
 *
 * "At the intersection of cybersecurity, AI and infrastructure" is a phrase
 * every second engineer's bio contains. What makes it a claim instead of a
 * tagline is saying what actually lives in each overlap. So the three fields
 * are drawn as rings that start apart and slide together as you scroll, and
 * each overlap is labelled with the real work that sits there:
 *
 * - security and AI: detection (CYBER-OS's models on network telemetry)
 * - AI and infrastructure: the ML pipeline (Zeek into Redpanda into a worker)
 * - security and infrastructure: operations (Qyverix: auth, RBAC, backups)
 * - all three: the whole path, which is where the text beside it says he
 *   ends up.
 *
 * The rings move by their `cx`/`cy` attributes, not CSS transforms, because
 * the same circles define the clip paths that cut out the shared centre, and
 * clip-path geometry follows attributes reliably everywhere. Six circles and
 * a few labels: the attribute writes are cheap.
 *
 * Server render and every no-motion path draw the converged state, so the
 * diagram is complete without the animation. The words in the statement and
 * the rings light each other on hover, done in CSS with `:has()`.
 */

const W = 600;
const H = 580;
const CX = 300;
const CY = 300;
const R = 150;
/** Centre-to-centroid distance, converged and apart. */
const NEAR = 86;
const FAR = 196;
/** How far outside its ring a field's name sits, past the centre offset. */
const LABEL_OUT = 96;

const FIELDS = [
  { id: 'security', name: 'Security', angle: -150 },
  { id: 'ai', name: 'AI', angle: -30 },
  { id: 'infra', name: 'Infrastructure', angle: 90 },
] as const;

/** Each overlap, placed in the part of the lens the third ring does not cover. */
const OVERLAPS = [
  { between: 'security ai', label: 'Detection', angle: -90 },
  { between: 'ai infra', label: 'ML pipelines', angle: 30 },
  { between: 'security infra', label: 'Operations', angle: 150 },
] as const;

const polar = (angle: number, distance: number) => {
  const a = (angle * Math.PI) / 180;
  return { x: CX + Math.cos(a) * distance, y: CY + Math.sin(a) * distance };
};

const round = (n: number) => Math.round(n * 10) / 10;

export function Intersection() {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const svg = root.current;
        if (!svg) return;

        // One value drives everything, so rings, clips and labels can never
        // drift apart from one another.
        const state = { d: FAR, reveal: 0 };

        const apply = () => {
          FIELDS.forEach((field) => {
            const c = polar(field.angle, state.d);
            svg.querySelectorAll<SVGCircleElement>(`[data-circle="${field.id}"]`).forEach((el) => {
              el.setAttribute('cx', String(round(c.x)));
              el.setAttribute('cy', String(round(c.y)));
            });
            const l = polar(field.angle, state.d + LABEL_OUT);
            const label = svg.querySelector<SVGTextElement>(`[data-field-label="${field.id}"]`);
            label?.setAttribute('x', String(round(l.x)));
            label?.setAttribute('y', String(round(l.y)));
          });
          svg.style.setProperty('--reveal', String(round(state.reveal * 100) / 100));
        };

        apply();

        gsap
          .timeline({
            scrollTrigger: {
              trigger: svg,
              start: 'top 85%',
              end: 'center 50%',
              scrub: 0.6,
            },
            onUpdate: apply,
          })
          .to(state, { d: NEAR, ease: 'power2.inOut', duration: 1 }, 0)
          .to(state, { reveal: 1, ease: 'none', duration: 0.3 }, 0.7);

        return () => {
          // Leave the converged drawing behind, as the server rendered it.
          state.d = NEAR;
          state.reveal = 1;
          apply();
          svg.style.removeProperty('--reveal');
        };
      });

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <svg
      ref={root}
      className="intersection"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-labelledby="intersection-title"
    >
      <title id="intersection-title">
        Three overlapping fields: security, AI and infrastructure. Security and AI overlap in
        detection, AI and infrastructure in ML pipelines, security and infrastructure in
        operations. All three overlap in the whole path.
      </title>

      <defs>
        {FIELDS.map((field) => {
          const c = polar(field.angle, NEAR);
          return (
            <clipPath id={`clip-${field.id}`} key={field.id}>
              <circle data-circle={field.id} cx={round(c.x)} cy={round(c.y)} r={R} />
            </clipPath>
          );
        })}
      </defs>

      {/* The shared centre: the third ring, clipped by the other two. */}
      <g clipPath="url(#clip-security)">
        <g clipPath="url(#clip-ai)">
          {(() => {
            const c = polar(FIELDS[2].angle, NEAR);
            return (
              <circle
                className="intersection-core"
                data-circle="infra"
                cx={round(c.x)}
                cy={round(c.y)}
                r={R}
              />
            );
          })()}
        </g>
      </g>

      {FIELDS.map((field) => {
        const c = polar(field.angle, NEAR);
        const l = polar(field.angle, NEAR + LABEL_OUT);
        return (
          <g key={field.id} className="intersection-field" data-ring={field.id}>
            <circle
              className="intersection-ring"
              data-circle={field.id}
              cx={round(c.x)}
              cy={round(c.y)}
              r={R}
            />
            <text
              className="intersection-name"
              data-field-label={field.id}
              x={round(l.x)}
              y={round(l.y)}
            >
              {field.name}
            </text>
          </g>
        );
      })}

      <g className="intersection-overlaps" aria-hidden="true">
        {OVERLAPS.map((overlap) => {
          const p = polar(overlap.angle, NEAR * 1.42);
          return (
            <text
              key={overlap.between}
              className="intersection-overlap"
              data-between={overlap.between}
              x={round(p.x)}
              y={round(p.y)}
            >
              {overlap.label}
            </text>
          );
        })}
        <circle className="intersection-dot" cx={CX} cy={CY - 10} r={3} />
        <text className="intersection-centre" x={CX} y={CY + 14}>
          the whole path
        </text>
      </g>
    </svg>
  );
}
