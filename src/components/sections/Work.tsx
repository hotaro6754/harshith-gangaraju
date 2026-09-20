import Link from 'next/link';

import { Reveal } from '@/components/motion/Reveal';
import { DEPTH_LABEL, PROJECTS_BY_DEPTH } from '@/content/projects';

/**
 * Section 02 — Work.
 *
 * Three entries, ordered by depth: model, detect, operate. The same axis the
 * landscape encodes, so the index is a continuation of the hero rather than a
 * separate idea.
 *
 * Not a card grid. Each project is a full-width editorial row, and everything
 * is legible without interacting — hover only shifts emphasis. Content that
 * hides behind a hover cannot be read on a phone, skimmed, or found with
 * ctrl-F, and a portfolio that a hiring manager cannot skim is a portfolio
 * that does not get read.
 */
export function Work() {
  return (
    <section className="section section-work" id="work" aria-labelledby="work-title">
      <div className="section-head">
        <span className="section-index">02</span>
        <h2 className="section-title" id="work-title">
          Work
        </h2>
        <p className="section-note">
          Ordered by depth — what I model, what I detect with, what I operate.
        </p>
      </div>

      <ol className="work-list">
        {PROJECTS_BY_DEPTH.map((project, i) => (
          <Reveal as="li" key={project.slug} delay={i * 0.06} className="work-entry">
            <article>
              <header className="work-entry-head">
                <span className="work-entry-index">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="work-entry-name">{project.name}</h3>
                <span className="work-entry-depth">{DEPTH_LABEL[project.depth]}</span>
              </header>

              <p className="work-entry-summary">{project.summary}</p>

              <div className="work-entry-detail">
                <p className="work-entry-premise">{project.premise}</p>

                <dl className="work-entry-stack">
                  {project.stack.map((layer) => (
                    <div key={layer.layer} className="work-entry-layer">
                      <dt>{layer.layer}</dt>
                      <dd>{layer.tech.join(' · ')}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <footer className="work-entry-foot">
                <span className="work-entry-meta">
                  {project.role} · {project.period}
                </span>
                <span className="work-entry-links">
                  <Link
                    className="work-entry-case"
                    href={`/work/${project.slug}`}
                    data-cursor="Read"
                  >
                    Case study
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
                </span>
              </footer>
            </article>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
