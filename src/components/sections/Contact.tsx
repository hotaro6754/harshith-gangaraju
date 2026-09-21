import { Reveal } from '@/components/motion/Reveal';
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

      <Reveal>
        <p className="contact-statement">
          If you are building something
          <br />
          that shouldn&rsquo;t break,
          <br />
          let&rsquo;s talk.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <a className="contact-primary" href={`mailto:${PROFILE.email}`} data-cursor="Mail">
          {PROFILE.email}
        </a>
      </Reveal>

      <Reveal delay={0.16}>
        <ul className="contact-links">
          {PROFILE.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noreferrer noopener" data-cursor="Open">
                {link.label}
                <span aria-hidden="true"> ↗</span>
              </a>
            </li>
          ))}
          <li>
            <span className="contact-location">{PROFILE.location}</span>
          </li>
        </ul>
      </Reveal>

      <footer className="colophon">
        <p>
          Built with Next.js, GSAP and Motion. The landscape is generated SVG — no
          images, no WebGL. Colour presets derive from the{' '}
          <a href="https://feralui.dev/gradients" target="_blank" rel="noreferrer noopener">
            FeralUI Gradient Builder
          </a>
          .
        </p>
      </footer>
    </section>
  );
}
