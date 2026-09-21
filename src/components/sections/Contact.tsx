import { KineticText } from '@/components/motion/KineticText';
import { Reveal } from '@/components/motion/Reveal';
import { RollLink } from '@/components/motion/RollLink';
import { PROFILE } from '@/content/profile';

/**
 * The last frame.
 *
 * Not a form and not a sign-off. The site opened on a statement in his voice
 * and it closes on one, so the whole thing reads as bracketed rather than as
 * running out of sections. The line deliberately answers the headline: the
 * hero says he looks for where things break, this says what that is for.
 */
export function Contact() {
  return (
    <section className="section-contact" id="contact" aria-labelledby="contact-title">
      <h2 className="sr-only" id="contact-title">
        Contact
      </h2>

      <KineticText
        className="contact-statement"
        text={['If you are building something', 'that shouldn’t break,', 'let’s talk.']}
      />

      <Reveal delay={0.2}>
        <RollLink
          className="contact-primary"
          href={`mailto:${PROFILE.email}`}
          data-cursor="Mail"
          label={PROFILE.email}
        />
      </Reveal>

      <Reveal delay={0.28}>
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
          <li>
            <span className="contact-location">{PROFILE.location}</span>
          </li>
        </ul>
      </Reveal>
    </section>
  );
}
