/**
 * One band, at the threshold.
 *
 * This started as four full-width rows drifting behind the whole hero, and
 * that was the weakest thing on the site: giant ghost words washed across a
 * landscape is the most common effect on the web, it competed with the
 * scene for every pixel, and at the opacity needed to stop it competing it
 * was just noise. Turning it down did not fix it — the problem was that it
 * had no job.
 *
 * So it has one now. A single line crossing once, at the moment the hero
 * hands over to the work, as the transition itself rather than decoration
 * laid on top of one. The scroll-linked opposing-direction principle is
 * still what drives it; it is simply pointed at something.
 *
 * Presentational on purpose: this lives inside the hero's pin, and GSAP owns
 * everything inside a pinned ScrollTrigger. A nested ScrollTrigger here — or
 * a Motion `useScroll` reading a transformed ancestor, which silently
 * reports the wrong progress — is the bug this split avoids.
 */

export interface KineticBandProps {
  words: string[];
  className?: string;
}

export function KineticBand({ words, className }: KineticBandProps) {
  // Doubled so the line can travel a full width without running out of text.
  const sequence = [...words, ...words];

  return (
    <div className={['kinetic-band', className].filter(Boolean).join(' ')} aria-hidden="true">
      <div className="kinetic-row" data-band-row>
        <span className="kinetic-track">
          {sequence.map((word, i) => (
            <span key={`${word}-${i}`}>{word}</span>
          ))}
        </span>
      </div>
    </div>
  );
}
