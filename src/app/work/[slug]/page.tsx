import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ViewTransition } from 'react';

import { Nav } from '@/components/chrome/Nav';
import { Cursor } from '@/components/motion/Cursor';
import { CaseHeroMotion, CaseIndex, CaseProgress } from '@/components/case/CaseChrome';
import { EnvironmentScene } from '@/components/environment/EnvironmentScene';
import { JsonLd } from '@/components/seo/JsonLd';
import { DEPTH_LABEL, PROJECTS, PROJECT_BY_SLUG } from '@/content/projects';
import { HERO_ENVIRONMENT } from '@/lib/hero-environment';
import { PERSON_REF, SITE_URL, identityGraph } from '@/lib/site';

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

/** Direction of travel between the index and a case study. See globals.css. */
const DESCENT = { descend: 'descend', ascend: 'ascend', default: 'none' };

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

  const title = `${project.name}, a case study`;
  return {
    // The layout's template appends the name: "CYBER-OS, a case study · Harshith Gangaraju".
    title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: 'article',
      url: `/work/${project.slug}`,
      title: `${title} · Harshith Gangaraju`,
      description: project.summary,
      authors: ['Harshith Gangaraju'],
    },
    twitter: { card: 'summary_large_image', title: `${title} · Harshith Gangaraju`, description: project.summary },
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

  const index = PROJECTS.findIndex((p) => p.slug === project.slug);
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <>
      <Nav />
      <Cursor />
      <CaseProgress />
      <JsonLd
        data={{
          '@graph': [
            ...identityGraph(),
            {
              '@type': 'TechArticle',
              '@id': `${SITE_URL}/work/${project.slug}#article`,
              headline: `${project.name}: ${project.summary}`,
              description: project.summary,
              url: `${SITE_URL}/work/${project.slug}`,
              author: PERSON_REF,
              about: project.stack.flatMap((layer) => layer.tech).slice(0, 12),
              isPartOf: { '@id': `${SITE_URL}/#website` },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Harshith Gangaraju', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE_URL}/#work` },
                { '@type': 'ListItem', position: 3, name: project.name, item: `${SITE_URL}/work/${project.slug}` },
              ],
            },
          ],
        }}
      />

      <ViewTransition enter={DESCENT} exit={DESCENT} default="none">
      <main className="descent case" id="top">
        {/* The opening frame: the same night, the name at the scale of the
            landscape, and the facts along the ground line. The blog-post
            layout it replaces put a 5rem title in a 46rem column and left
            two thirds of the screen empty. */}
        <CaseHeroMotion>
          <header className="case-hero">
            <div className="case-hero-scene" data-case-scene aria-hidden="true">
              <EnvironmentScene id={HERO_ENVIRONMENT} maxBlurLayers={1} seed={project.slug} />
            </div>

            <div className="case-hero-top" data-case-fade>
              <p className="case-back">
                <Link href="/#work" data-cursor="Back" transitionTypes={['ascend']}>
                  <span aria-hidden="true">← </span>Work
                </Link>
              </p>
              <p className="case-kicker">
                {pad(index + 1)} / {pad(PROJECTS.length)} · {DEPTH_LABEL[project.depth]}
              </p>
            </div>

            {/* Paired with the name in the work sequence: the title you
                clicked travels here rather than being replaced by a copy. */}
            <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
              <h1 className="case-title" data-case-title>
                {project.name}
              </h1>
            </ViewTransition>

            <div className="case-hero-foot" data-case-fade>
              <p className="case-summary" data-case-rise>
                {project.summary}
              </p>
              <dl className="case-meta" data-case-rise>
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
            </div>
          </header>
        </CaseHeroMotion>

        <div className="case-layout">
          <aside className="case-rail">
            <CaseIndex />
          </aside>

          <article className="case-body">
            <Body />
          </article>
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
                  <a href={link.href} target="_blank" rel="noreferrer noopener" data-cursor="Open">
                    {link.label}
                    <span aria-hidden="true"> ↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </footer>

        {/* The hand-off. A case study that ends in a links table makes the
            reader go back to the index to continue; this carries them on,
            and the name they click becomes the next page's title. */}
        <Link
          className="case-next"
          href={`/work/${next.slug}`}
          transitionTypes={['descend']}
          data-cursor="Next"
        >
          <span className="case-next-label">Next project</span>
          <ViewTransition name={`project-${next.slug}`} share="morph" default="none">
            <span className="case-next-name">{next.name}</span>
          </ViewTransition>
          <span className="case-next-line">{next.summary}</span>
        </Link>
      </main>
      </ViewTransition>
    </>
  );
}
