'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useRef } from 'react';

import { DiagramNode } from '@/components/case/SystemDiagram';
import { DIAGRAMS, type DiagramName } from '@/content/diagrams';
import { DEPTH_LABEL, PROJECTS, type Project } from '@/content/projects';
import { DIAGRAM_H, DIAGRAM_W, layoutDiagram } from '@/lib/diagram-geometry';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, useGSAP);

/**
 * Section 02 — Selected work, as a sequence.
 *
 * The previous version was a heading, a paragraph, a stack table and a
 * fade-up, three times. However good the copy, that is the generic portfolio
 * shape, and it is what read as generated.
 *
 * Now the section pins and each project takes the whole frame in turn. The
 * name arrives character by character, and beside it the project's actual
 * system diagram draws itself as you scroll. There are no screenshots and no
 * mock devices, deliberately: the architecture is the image. For an engineer
 * that is both the honest visual and the more interesting one.
 *
 * GSAP owns this because it is a pinned, scrubbed, multi-stage sequence —
 * exactly the job the codebase reserves it for. Motion stays out of it.
 *
 * Only on wide screens with motion allowed. Everywhere else — phones,
 * reduced motion, no JavaScript — the same markup renders as a plain stacked
 * list with every diagram fully drawn, because the sequence is the
 * enhancement and the content has to stand without it.
 */

const COUNT = PROJECTS.length;
const pad = (n: number) => String(n).padStart(2, '0');

function ProjectName({ name }: { name: string }) {
  // Authored characters rather than a runtime split. SplitText rewrites the
  // DOM underneath React and breaks reconciliation; these spans are React's
  // own, so nothing has to be rewritten to animate them.
  return (
    <h3 className="project-name">
      <span className="sr-only">{name}</span>
      <span className="project-name-mask" aria-hidden="true" data-name-mask>
        {[...name].map((char, i) => (
          <span className="project-char" data-char key={`${char}-${i}`}>
            {char === ' ' ? ' ' : char}
          </span>
        ))}
      </span>
    </h3>
  );
}

function ProjectDiagram({ name }: { name: DiagramName }) {
  const { nodes, edges } = layoutDiagram(DIAGRAMS[name]);

  return (
    <svg
      className="project-diagram"
      viewBox={`0 0 ${DIAGRAM_W} ${DIAGRAM_H}`}
      role="img"
      aria-label={DIAGRAMS[name].caption}
      data-diagram
    >
      <g className="diagram-edges">
        {edges.map((edge) => (
          <path key={edge.key} d={edge.d} className="diagram-edge" data-edge />
        ))}
      </g>
      <g className="diagram-nodes">
        {nodes.map((node) => (
          <g key={node.id} data-accent={node.accent ? 'true' : 'false'} data-node>
            <DiagramNode node={node} />
          </g>
        ))}
      </g>
    </svg>
  );
}

function ProjectSlide({ project, index }: { project: Project; index: number }) {
  return (
    <article className="project-slide" data-slide={index}>
      <span className="project-numeral" aria-hidden="true" data-numeral>
        {pad(index + 1)}
      </span>

      <div className="project-text">
        <p className="project-meta" data-meta>
          <span>{pad(index + 1)}</span>
          <span>{DEPTH_LABEL[project.depth]}</span>
          <span>{project.role}</span>
        </p>

        <ProjectName name={project.name} />

        <div className="project-copy" data-copy>
          <p className="project-summary">{project.summary}</p>

          <p className="project-links">
            <Link className="project-cta" href={`/work/${project.slug}`} data-cursor="Read">
              Read the case study
              <span aria-hidden="true"> →</span>
            </Link>
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="Open"
              >
                {link.label}
                <span aria-hidden="true"> ↗</span>
              </a>
            ))}
          </p>
        </div>
      </div>

      <div className="project-visual" data-visual>
        <ProjectDiagram name={project.slug as DiagramName} />
      </div>
    </article>
  );
}

export function Work() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        '(min-width: 861px) and (prefers-reduced-motion: no-preference)',
        () => {
          const section = root.current;
          if (!section) return;

          // The stacked-list layout is the default; the sequence is opted
          // into here, so anything that stops this code running still gets
          // readable content.
          section.dataset.mode = 'sequence';

          const slides = gsap.utils.toArray<HTMLElement>('[data-slide]', section);
          const q = (slide: HTMLElement, selector: string) =>
            gsap.utils.toArray<Element>(selector, slide);

          // Everything after the first project starts out of frame.
          slides.slice(1).forEach((slide) => {
            gsap.set(slide, { autoAlpha: 0 });
            gsap.set(q(slide, '[data-char]'), { yPercent: 115 });
            gsap.set(q(slide, '[data-edge]'), { drawSVG: '0%' });
            gsap.set(q(slide, '[data-node]'), { autoAlpha: 0 });
          });

          // ---- First project: arrives on entry, not on the scrub -------
          // Separate one-shot trigger on *different targets* from anything
          // the scrubbed timeline touches — the mask, not the characters —
          // so the two can never fight over one property.
          const first = slides[0];
          const entrance = gsap.timeline({
            scrollTrigger: { trigger: section, start: 'top 72%', once: true },
          });
          entrance
            .from(q(first, '[data-name-mask]'), { yPercent: 105, duration: 1, ease: 'expo.out' })
            .from(q(first, '[data-meta]'), { autoAlpha: 0, y: 12, duration: 0.6 }, 0.1)
            .from(q(first, '[data-copy]'), { autoAlpha: 0, y: 18, duration: 0.7 }, 0.2)
            .fromTo(
              q(first, '[data-edge]'),
              { drawSVG: '0%' },
              { drawSVG: '100%', duration: 0.9, stagger: 0.06, ease: 'power2.inOut' },
              0.2,
            )
            .from(q(first, '[data-node]'), { autoAlpha: 0, duration: 0.4, stagger: 0.04 }, 0.35);

          // ---- The sequence -------------------------------------------
          const TRANSITION = 1; // one unit of scroll per handover
          const total = (COUNT - 1) * TRANSITION + 0.4;

          const counter = section.querySelector<HTMLElement>('[data-counter]');
          let shown = 0;

          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${Math.round(window.innerHeight * 0.95 * total)}`,
              pin: '[data-pin]',
              scrub: 0.7,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              // Rest on a project rather than halfway between two.
              snap: {
                snapTo: 'labels',
                duration: { min: 0.25, max: 0.7 },
                ease: 'power2.inOut',
                delay: 0.06,
              },
              onUpdate: () => {
                // The counter flips at the moment the next name starts to
                // rise, read straight from the timeline's position. Written
                // only when it changes: one text write per project, not one
                // per frame.
                const time = timeline.time();
                let active = 0;
                for (let i = 1; i < COUNT; i++) {
                  if (time >= (i - 1) * TRANSITION + 0.36) active = i;
                }
                if (active !== shown && counter) {
                  shown = active;
                  counter.textContent = pad(active + 1);
                }
              },
            },
          });

          timeline.addLabel('p0', 0);
          timeline.fromTo('[data-rail-fill]', { scaleX: 1 / COUNT }, { scaleX: 1, duration: total }, 0);

          for (let i = 1; i < COUNT; i++) {
            const at = (i - 1) * TRANSITION + 0.2;
            const prev = slides[i - 1];
            const next = slides[i];

            // Out: the name lifts away letter by letter, everything else
            // steps back.
            timeline
              .to(q(prev, '[data-char]'), { yPercent: -115, stagger: 0.012, duration: 0.28, ease: 'power2.in' }, at)
              .to(q(prev, '[data-meta], [data-copy]'), { autoAlpha: 0, y: -18, duration: 0.2 }, at)
              .to(q(prev, '[data-visual]'), { autoAlpha: 0, scale: 0.96, duration: 0.26 }, at)
              .to(q(prev, '[data-numeral]'), { yPercent: -35, autoAlpha: 0, duration: 0.34 }, at)
              .set(prev, { autoAlpha: 0 }, at + 0.34);

            // In: the frame hands over, the name rises, then the system it
            // describes draws itself.
            timeline
              .set(next, { autoAlpha: 1 }, at + 0.1)
              .fromTo(q(next, '[data-numeral]'), { yPercent: 35, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.36, ease: 'power2.out' }, at + 0.1)
              .fromTo(q(next, '[data-char]'), { yPercent: 115 }, { yPercent: 0, stagger: 0.014, duration: 0.32, ease: 'power3.out' }, at + 0.18)
              .fromTo(q(next, '[data-meta], [data-copy]'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out' }, at + 0.3)
              .fromTo(q(next, '[data-visual]'), { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, at + 0.2)
              .fromTo(q(next, '[data-edge]'), { drawSVG: '0%' }, { drawSVG: '100%', stagger: 0.04, duration: 0.4, ease: 'power1.inOut' }, at + 0.34)
              .fromTo(q(next, '[data-node]'), { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.025, duration: 0.18 }, at + 0.4);

            timeline.addLabel(`p${i}`, at + 0.8);
          }

          return () => {
            delete section.dataset.mode;
          };
        },
      );

      // Every position in this section depends on the display face: the
      // project names are set in it, and its arrival changes their height
      // and therefore where the pin starts and ends. Measuring before it
      // lands gives a sequence that starts in the wrong place — so measure
      // again once it has.
      let cancelled = false;
      document.fonts?.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });

      return () => {
        cancelled = true;
        media.revert();
      };
    },
    { scope: root },
  );

  return (
    <section className="projects" id="work" ref={root} aria-labelledby="work-title">
      <div className="projects-pin" data-pin>
        <header className="projects-head">
          <span className="section-index">02</span>
          <h2 className="section-title" id="work-title">
            Selected work
          </h2>
          <p className="projects-counter" aria-hidden="true">
            <span data-counter>01</span> / {pad(COUNT)}
          </p>
          <span className="projects-rail" aria-hidden="true">
            <span className="projects-rail-fill" data-rail-fill />
          </span>
        </header>

        <div className="projects-stage">
          {PROJECTS.map((project, i) => (
            <ProjectSlide key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>

      {/* The sequence shows one project at a time, which is the point of it
          but is poor for skimming and for keyboard users, who cannot tab to
          a slide that is not on screen. This index is always present and
          always reachable. */}
      <nav className="projects-index" aria-label="All projects">
        {PROJECTS.map((project, i) => (
          <Link key={project.slug} href={`/work/${project.slug}`} data-cursor="Read">
            <span>{pad(i + 1)}</span>
            <span className="projects-index-name">{project.name}</span>
            <span>{DEPTH_LABEL[project.depth]}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
