import Link from 'next/link';

import { Nav } from '@/components/chrome/Nav';
import { Cursor } from '@/components/motion/Cursor';
import { Reveal } from '@/components/motion/Reveal';
import { EXPERIMENTS, LAB_INTRO } from '@/content/lab';

export const metadata = {
  title: 'Lab',
  alternates: { canonical: '/lab' },
  description:
    'Experiments by Harshith Gangaraju, CTO of Qyverix: unfinished things, earlier sites, and the reference sheets behind this portfolio.',
  openGraph: {
    url: '/lab',
    title: 'Lab · Harshith Gangaraju',
    description: 'Experiments, earlier sites, and the reference sheets behind this portfolio.',
  },
};

/**
 * The workshop, shown deliberately.
 *
 * A portfolio that only shows three polished systems implies the person
 * arrived at them fully formed. The interesting part is the pile of things
 * built to answer one question and then abandoned — including the first
 * project, which stays on the list on purpose.
 */
export default function LabPage() {
  return (
    <>
      <Nav />
      <Cursor />

      <main className="descent" id="top">
        <section className="section section-lab" aria-labelledby="lab-title">
          <div className="section-head">
            <h1 className="section-title" id="lab-title">
              Experiments
            </h1>
            <p className="section-note">{LAB_INTRO}</p>
          </div>

          <ol className="lab-list">
            {EXPERIMENTS.map((item, i) => {
              const internal = item.href.startsWith('/');
              const Title = internal ? Link : 'a';
              const titleProps = internal
                ? { href: item.href }
                : { href: item.href, target: '_blank', rel: 'noreferrer noopener' };

              return (
                <Reveal as="li" key={item.name} delay={i * 0.04} className="lab-entry">
                  <div className="lab-entry-main">
                    <h2 className="lab-entry-name">
                      <Title {...titleProps} data-cursor={internal ? 'Open' : 'Code'}>
                        {item.name}
                        <span aria-hidden="true">{internal ? ' →' : ' ↗'}</span>
                      </Title>
                    </h2>
                    {item.note && <p className="lab-entry-note">{item.note}</p>}
                  </div>

                  <div className="lab-entry-meta">
                    <span className="lab-entry-tech">{item.tech}</span>
                    {item.live && (
                      <a
                        href={item.live.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-cursor="Live"
                      >
                        {item.live.label}
                        <span aria-hidden="true"> ↗</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </ol>

          <p className="lab-more">
            The rest is on{' '}
            <a
              href="https://github.com/hotaro6754"
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="Open"
            >
              GitHub
            </a>
            , in varying states of repair.
          </p>
        </section>

      </main>
    </>
  );
}
