/**
 * Oversized word bands that respond to vertical scroll.
 *
 * Deliberately presentational: the rows live inside the hero's pin, and the
 * one rule that keeps this codebase sane is that GSAP owns everything inside
 * a pinned ScrollTrigger. A nested ScrollTrigger here — or a Motion
 * `useScroll` reading a transformed ancestor, which silently reports the
 * wrong progress — is the exact bug this split avoids. The hero's master
 * timeline animates `[data-band-row]`.
 *
 * Each row is rendered twice so it can travel a full width without gapping.
 */

export interface KineticBandProps {
  words: string[];
  className?: string;
}

export function KineticBand({ words, className }: KineticBandProps) {
  return (
    <div className={['kinetic-band', className].filter(Boolean).join(' ')} aria-hidden="true">
      {words.map((word, index) => (
        <div
          key={word}
          className="kinetic-row"
          data-band-row
          data-direction={index % 2 === 0 ? 'forward' : 'reverse'}
        >
          <span className="kinetic-track">
            <span>{word}</span>
            <span>{word}</span>
            <span>{word}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
