import Link from 'next/link';

import { Reveal } from '@/components/motion/Reveal';
import { DEPTH_LABEL, PROJECTS, type Project } from '@/content/projects';

/**
 * Section 02 — Work.
 *
 * Three identical rows is what a generated list looks like. The lead project
 * now carries real weight — full-bleed, oversized, its stack laid out — and
 * the other two sit below it as an editorial index. That difference in scale
 * is the section's hierarchy, and hierarchy is most of what separates
 * selected work from a project dump.
 *
 * Ordered by his priority rather than by depth. Depth is still the site's
 * spatial idea and every entry still carries its layer, but it survives here
 * as metadata rather than dictating which project a visitor meets first.
 *
 * Nothing is hidden behind a hover. Content that only appears on hover cannot
 * be read on a phone, skimmed, or found with ctrl-F.
 */

function FeaturedProject({ project }: { project: Project }) {
  return (
    <Reveal as="article" className="featured">
      <header className="featured-head">
        <span className="featured-index">01</span>
        <span className="featured-depth">{DEPTH_LABEL[project.depth]}</span>
      </header>

      <h3 className="featured-name">
        <Link href={`/work/${project.slug}`} data-cursor="Read">
          {project.name}
        </Link>
      </h3>

      <p className="featured-summary">{project.summary}</p>

      <div className="featured-body">
        <p className="featured-premise">{project.premise}</p>

        <dl className="featured-stack">
          {project.stack.map((layer) => (
            <div key={layer.layer}>
              <dt>{layer.layer}</dt>
              <dd>{layer.tech.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </div>

      <footer className="featured-foot">
        <span className="featured-meta">
          {project.role} · {project.period}
        </span>
        <span className="featured-links">
          <Link className="featured-cta" href={`/work/${project.slug}`} data-cursor="Read">
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
        </span>
      </footer>
    </Reveal>
  );
}

export function Work() {
  const [lead, ...rest] = PROJECTS;

  return (
    <section className="section section-work" id="work" aria-labelledby="work-title">
      <div className="section-head">
        <span className="section-index">02</span>
        <h2 className="section-title" id="work-title">
          Selected work
        </h2>
        <p className="section-note">
          Three systems. Each one carries the layer of the stack it lives at.
        </p>
      </div>

      <FeaturedProject project={lead} />

      <ol className="work-list">
        {rest.map((project, i) => (
          <Reveal as="li" key={project.slug} delay={i * 0.06} className="work-entry">
            <article>
              <header className="work-entry-head">
                <span className="work-entry-index">{String(i + 2).padStart(2, '0')}</span>
                <h3 className="work-entry-name">
                  <Link href={`/work/${project.slug}`} data-cursor="Read">
                    {project.name}
                  </Link>
                </h3>
                <span className="work-entry-depth">{DEPTH_LABEL[project.depth]}</span>
              </header>

              <p className="work-entry-summary">{project.summary}</p>

              <footer className="work-entry-foot">
                <span className="work-entry-meta">
                  {project.role} · {project.period}
                </span>
                <span className="work-entry-links">
                  <Link href={`/work/${project.slug}`} data-cursor="Read">
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
