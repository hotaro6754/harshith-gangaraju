import { Reveal } from '@/components/motion/Reveal';
import { PRINCIPLES, QUOTES, ROLES } from '@/content/profile';

/**
 * Section 03 — Practice.
 *
 * How the work gets made, which is more useful to a reader than another list
 * of technologies. The ordered list is the argument: performance and novelty
 * sit at the bottom on purpose, because a fast clever system that is wrong or
 * unsafe is worse than a slow boring one that is neither.
 */
export function Practice() {
  return (
    <section className="section section-practice" id="practice" aria-labelledby="practice-title">
      <div className="section-head">
        <span className="section-index">03</span>
        <h2 className="section-title" id="practice-title">
          Practice
        </h2>
        <p className="section-note">What I optimise for, in order.</p>
      </div>

      <div className="practice-body">
        <div>
          <ol className="principles">
            {PRINCIPLES.map((principle, i) => (
              <Reveal as="li" key={principle.rank} delay={i * 0.04} className="principle">
                <span className="principle-rank">{String(i + 1).padStart(2, '0')}</span>
                <span className="principle-name">{principle.rank}</span>
                <span className="principle-note">{principle.note}</span>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.1}>
            <blockquote className="pull-quote pull-quote-wide">{QUOTES.overbuilding}</blockquote>
          </Reveal>
        </div>

        <div className="practice-side">
          <Reveal>
            <h3 className="practice-side-title">Where I have had to mean it</h3>
            <ul className="roles">
              {ROLES.map((role) => (
                <li key={`${role.org}-${role.title}`}>
                  <span className="role-title">{role.title}</span>
                  <span className="role-org">{role.org}</span>
                  <span className="role-note">{role.note}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <blockquote className="pull-quote">{QUOTES.ownership}</blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
