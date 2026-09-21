import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Nav } from '@/components/chrome/Nav';
import { Cursor } from '@/components/motion/Cursor';
import { DEPTH_LABEL, PROJECTS, PROJECT_BY_SLUG } from '@/content/projects';

import CyberOs from './bodies/cyber-os.mdx';
import Ideaspace from './bodies/ideaspace.mdx';
import Qyverix from './bodies/qyverix.mdx';

/**
 * A static map rather than a dynamic import.
 *
 * `import()` with a template literal forces the bundler to build a context of
 * every file that might match, and silently degrades to a runtime lookup that
 * can fail in production but not in dev. Three explicit imports cost nothing
 * and fail at compile time if a body goes missing.
 */
const BODIES = {
  qyverix: Qyverix,
  'cyber-os': CyberOs,
  ideaspace: Ideaspace,
} as const;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECT_BY_SLUG[slug];
  if (!project) return {};

  return {
    title: `${project.name} · Harshith Gangaraju`,
    description: project.summary,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECT_BY_SLUG[slug];
  const Body = BODIES[slug as keyof typeof BODIES];

  if (!project || !Body) notFound();

  return (
    <>
      <Nav />
      <Cursor />

      <main className="descent case" id="top">
        <article className="case-article">
          <header className="case-head">
            <p className="case-back">
              <Link href="/#work" data-cursor="Back">
                <span aria-hidden="true">← </span>Work
              </Link>
            </p>

            <h1 className="case-title">{project.name}</h1>
            <p className="case-summary">{project.summary}</p>

            <dl className="case-meta">
              <div>
                <dt>Role</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>Period</dt>
                <dd>{project.period}</dd>
              </div>
              <div>
                <dt>Layer</dt>
                <dd>{DEPTH_LABEL[project.depth]}</dd>
              </div>
            </dl>
          </header>

          <div className="case-body">
            <Body />
          </div>

          <footer className="case-foot">
            <div className="case-stack">
              <h2>Stack</h2>
              <dl>
                {project.stack.map((layer) => (
                  <div key={layer.layer}>
                    <dt>{layer.layer}</dt>
                    <dd>{layer.tech.join(' · ')}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="case-links">
              <h2>Links</h2>
              <ul>
                {project.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="Open"
                    >
                      {link.label}
                      <span aria-hidden="true"> ↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </footer>
        </article>
      </main>
    </>
  );
}
