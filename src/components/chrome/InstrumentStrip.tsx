import { ENVIRONMENTS } from '@/lib/environments';
import { HERO_ENVIRONMENT } from '@/lib/hero-environment';

/**
 * A readout of what this page actually is.
 *
 * Every value is real and resolved at build time. There is no counter here
 * that goes up on its own, no "systems monitored", no uptime percentage for
 * a static site — the whole point is that a strip of genuine build facts is
 * more convincing than a dashboard of invented ones, and it costs nothing to
 * be honest about a commit hash.
 *
 * If git was unavailable at build, the SHA says "unknown" rather than
 * fabricating one.
 */
export function InstrumentStrip() {
  const env = ENVIRONMENTS[HERO_ENVIRONMENT];
  const sha = process.env.BUILD_SHA ?? 'unknown';
  const builtAt = process.env.BUILD_TIME;

  const built = builtAt
    ? new Date(builtAt).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
    : 'unknown';

  const readout = [
    { label: 'Build', value: sha },
    { label: 'Built', value: built },
    { label: 'Environment', value: env.name },
    { label: 'Ranges', value: String(env.ranges) },
    { label: 'Renderer', value: 'SVG · no WebGL' },
  ];

  return (
    <aside className="instrument" aria-label="Build information">
      <dl>
        {readout.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
