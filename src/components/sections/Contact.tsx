import { LocalTime } from '@/components/chrome/LocalTime';
import { EnvironmentScene } from '@/components/environment/EnvironmentScene';
import { ConvergeText } from '@/components/motion/ConvergeText';
import { KineticText } from '@/components/motion/KineticText';
import { Reveal } from '@/components/motion/Reveal';
import { RollLink } from '@/components/motion/RollLink';
import { HERO_ENVIRONMENT } from '@/lib/hero-environment';
import { PROFILE } from '@/content/profile';

/**
 * The last frame.
 *
 * Not a form and not a sign-off. The site opened inside a landscape and it
 * closes inside one: the ranges come back up from the bottom of the page, so
 * the whole thing reads as bracketed rather than as running out of sections.
 * Everything between was the descent; this is the far side of it.
 *
 * The line answers the headline. The hero says he looks for where things
 * break; this says what that is for, and the last two words assemble out of
 * depth as you arrive.
 */
export function Contact() {
  return (
    <section className="section-contact" id="contact" aria-labelledby="contact-title">
      <h2 className="sr-only" id="contact-title">
        Contact
      </h2>

      {/* Same seed as the hero, so these are the same mountains seen again,
          not a second decoration. One blur layer: it is a closing frame, not
          the showpiece, and it should cost less than the opening. */}
      <div className="contact-scene" aria-hidden="true">
        <EnvironmentScene id={HERO_ENVIRONMENT} maxBlurLayers={1} maxRanges={4} />
      </div>

      <div className="contact-inner">
        <KineticText
          className="contact-lead"
          text={['If you are building something', 'that shouldn’t break,']}
        />

        <ConvergeText className="contact-converge" text={'let’s talk.'} />

        <Reveal delay={0.1}>
          <RollLink
            className="contact-primary"
            href={`mailto:${PROFILE.email}`}
            data-cursor="Mail"
            label={PROFILE.email}
          />
          {/* Work goes to the company address; everything else here. */}
          <p className="contact-alt">
            or, personally,{' '}
            <RollLink href={`mailto:${PROFILE.emailPersonal}`} data-cursor="Mail" label={PROFILE.emailPersonal} />
          </p>
        </Reveal>
      </div>

      <footer className="site-foot">
        <span className="site-foot-name">{PROFILE.name}</span>

        <ul className="contact-links">
          {PROFILE.links.map((link) => (
            <li key={link.href}>
              <RollLink
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="Open"
                label={link.label}
                trailing={<span aria-hidden="true"> ↗</span>}
              />
            </li>
          ))}
        </ul>

        <span className="site-foot-where">
          {PROFILE.location} · <LocalTime />
        </span>

        <RollLink
          className="site-foot-top"
          href="#top"
          label="Back to the surface"
          aria-label="Back to the top of the page"
          data-cursor="Up"
        />
      </footer>
    </section>
  );
}
