import { Reveal } from '@/components/motion/Reveal';
import { LEARNING, PROFILE } from '@/content/profile';

import { StackDiagram } from './StackDiagram';

/**
 * Section 01 — Position.
 *
 * One claim, the diagram that supports it, and the gaps stated out loud. The
 * last part is not modesty: naming what is still being learned is what makes
 * the rest of the page believable, and it is far harder to fake than a
 * confident adjective.
 */
export function Position() {
  return (
    <section className="section section-position" id="position" aria-labelledby="position-title">
      <div className="section-head">
        <span className="section-index">01</span>
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
              Most of what I build sits where those three meet — a detection pipeline is
              useless without the infrastructure to run it, and infrastructure nobody can
              operate is not finished. I care about the whole path from a problem to a
              thing that stays up.
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="position-learning">
              <h3 className="position-learning-title">Currently going deeper on</h3>
              <ul className="position-learning-list">
                {LEARNING.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="position-diagram">
          <StackDiagram />
        </div>
      </div>
    </section>
  );
}
