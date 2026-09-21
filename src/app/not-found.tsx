import { Fracture } from '@/components/chrome/Fracture';
import { EnvironmentScene } from '@/components/environment/EnvironmentScene';
import { RollLink } from '@/components/motion/RollLink';
import { HERO_ENVIRONMENT } from '@/lib/hero-environment';

export const metadata = { title: 'Not found' };

/**
 * The page that exists because something broke.
 *
 * Previously this was Next's default: a white screen with "404 | This page
 * could not be found." on a site that is otherwise entirely night. That is
 * the one page guaranteed to be seen by someone following a stale link, so it
 * gets the same landscape and the same voice as everything else.
 */
export default function NotFound() {
  return (
    <main className="lost" id="top">
      <div className="lost-scene" aria-hidden="true">
        <EnvironmentScene id={HERO_ENVIRONMENT} maxBlurLayers={1} />
      </div>

      <div className="lost-inner">
        <p className="lost-eyebrow">Page not found</p>
        <h1 className="lost-code">
          <Fracture text="404" />
        </h1>
        <p className="lost-line">
          Nothing lives at this address. It moved, or it never existed.
          <br />
          Either way, you found where it breaks.
        </p>
        <nav className="lost-links" aria-label="Recover">
          <RollLink href="/" label="Back to the surface" data-cursor="Home" />
          <RollLink href="/#work" label="See the work" data-cursor="Read" />
        </nav>
      </div>
    </main>
  );
}
