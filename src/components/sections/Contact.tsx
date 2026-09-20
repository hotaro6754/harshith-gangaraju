import { Reveal } from '@/components/motion/Reveal';
import { PROFILE } from '@/content/profile';

/**
 * Contact. Expanded in a later phase; for now it exists so the descent has a
 * floor and the nav has somewhere to land.
 */
export function Contact() {
  return (
    <section className="section section-contact" id="contact" aria-labelledby="contact-title">
      <div className="section-head">
        <span className="section-index">03</span>
        <h2 className="section-title" id="contact-title">
          Contact
        </h2>
      </div>

      <Reveal>
        <p className="contact-line">
          Open to work on security, AI and infrastructure systems.
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <ul className="contact-links">
          <li>
            <a href={`mailto:${PROFILE.email}`} data-cursor="Mail">
              {PROFILE.email}
            </a>
          </li>
          {PROFILE.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noreferrer noopener" data-cursor="Open">
                {link.label}
                <span aria-hidden="true"> ↗</span>
              </a>
            </li>
          ))}
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
