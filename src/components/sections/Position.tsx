import { KineticText } from '@/components/motion/KineticText';
import { Reveal } from '@/components/motion/Reveal';
import { EDUCATION, PROFILE } from '@/content/profile';

import { Intersection } from './Intersection';

/**
 * Section 01: Position.
 *
 * The previous version was the generic about block: a heading, a statement,
 * a paragraph, a pull quote and a label/value list of college and city.
 * Every portfolio template has that exact stack, and the quote repeated what
 * the manifesto had just performed.
 *
 * Now the statement is the section. Its three fields are drawn beside it as
 * rings that converge as you scroll, with the real work that lives in each
 * overlap, so "the intersection of cybersecurity, AI and infrastructure"
 * stops being a phrase and becomes a claim you can check. The field names in
 * the sentence and the rings light each other on hover.
 *
 * College and city are one sentence in his own voice rather than a form.
 */

const MARKS = { cybersecurity: 'security', ai: 'ai', infrastructure: 'infra' } as const;

export function Position() {
  return (
    <section className="section section-position" id="position" aria-labelledby="position-title">
      <div className="section-head">
        <KineticText as="h2" className="section-title" id="position-title" text="Position" />
      </div>

      <div className="position-body">
        <div className="position-claim">
          <KineticText
            className="position-statement"
            mode="fill"
            marks={MARKS}
            text={PROFILE.position}
          />

          <Reveal delay={0.08}>
            <p className="position-detail">
              Mostly I end up where those three meet. A detection pipeline is useless
              without the infrastructure to run it, and infrastructure nobody can
              operate is not finished. I like the whole path: the problem, the thing
              that stays up, and finding out what it does when someone leans on it.
            </p>
          </Reveal>
        </div>

        <div className="position-figure">
          <Intersection />
        </div>
      </div>

      <Reveal>
        <p className="position-now">
          Right now I&rsquo;m in the {EDUCATION.year.toLowerCase()} of a {EDUCATION.degree} at{' '}
          {EDUCATION.institution}, in {PROFILE.location.split(',')[0]}. Class of{' '}
          {EDUCATION.graduation}.
        </p>
      </Reveal>
    </section>
  );
}
