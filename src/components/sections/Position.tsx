import { Reveal } from '@/components/motion/Reveal';
import { EDUCATION, PROFILE, QUOTES } from '@/content/profile';

import { StackDiagram } from './StackDiagram';

/**
 * Section 01 — Position.
 *
 * One claim, the diagram that supports it, and the sentence that explains why
 * any of it happened. College is here but deliberately small: it is a chapter,
 * not the identity, and the work above it has to do the talking.
 */
export function Position() {
  return (
    <section className="section section-position" id="position" aria-labelledby="position-title">
      <div className="section-head">
        <h2 className="section-title" id="position-title">
          Position
        </h2>
      </div>

      <div className="position-body">
        <div className="position-claim">
          <Reveal>
            <p className="position-statement">{PROFILE.position}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="position-detail">
              Mostly I end up where those three meet. A detection pipeline is useless
              without the infrastructure to run it, and infrastructure nobody can
              operate is not finished. I like the whole path: the problem, the thing
              that stays up, and finding out what it does when someone leans on it.
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <blockquote className="pull-quote">{QUOTES.curiosity}</blockquote>
          </Reveal>

          <Reveal delay={0.22}>
            <dl className="position-facts">
              <div>
                <dt>Studying</dt>
                <dd>
                  {EDUCATION.degree}
                  <span className="position-facts-sub">
                    {EDUCATION.institution} · {EDUCATION.year}, class of {EDUCATION.graduation}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>{PROFILE.location}</dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <div className="position-diagram">
          <StackDiagram />
        </div>
      </div>
    </section>
  );
}
