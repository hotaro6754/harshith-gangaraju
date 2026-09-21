import { EnvironmentScene } from '@/components/environment/EnvironmentScene';
import { ENVIRONMENTS, ENVIRONMENT_SEQUENCE } from '@/lib/environments';

export const metadata = { title: 'Scenes · Lab' };

/**
 * Static reference sheet. Every environment at full size, no motion, no
 * choreography — so the scene generator can be judged on its own before the
 * hero timeline is layered on top.
 */
export default function ScenesPage() {
  return (
    <main>
      {ENVIRONMENT_SEQUENCE.map((id, index) => {
        const env = ENVIRONMENTS[id];
        return (
          <section
            key={id}
            data-env={id}
            style={{ position: 'relative', height: '100svh', overflow: 'hidden' }}
          >
            <EnvironmentScene id={id} />

            <div
              style={{
                position: 'relative',
                height: '100%',
                padding: 'var(--gutter)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: 'var(--env-ink)',
              }}
            >
              <header
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>{env.name}</span>
              </header>

              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(3.25rem, 12vw, 11rem)',
                  fontWeight: 400,
                  lineHeight: 0.92,
                  letterSpacing: '-0.015em',
                }}
              >
                {env.name}
              </h2>

              <dl
                style={{
                  margin: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(5.5rem, 1fr))',
                  gap: '0.75rem 1.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  color: 'var(--env-ink-muted)',
                  borderTop: '1px solid var(--env-rule)',
                  paddingTop: '0.875rem',
                }}
              >
                {(
                  [
                    ['ranges', env.ranges],
                    ['horizon', `${Math.round(env.horizon * 100)}%`],
                    ['peaks', env.peaks.toFixed(2)],
                    ['sharp', env.sharp.toFixed(2)],
                    ['haze', env.haze.toFixed(2)],
                    ['sun', `${Math.round(env.sun * 100)}%`],
                    ['drift', env.drift.toFixed(2)],
                    ['noise', `${Math.round(env.noise * 100)}%`],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt style={{ opacity: 0.62, textTransform: 'uppercase' }}>{label}</dt>
                    <dd style={{ margin: 0, color: 'var(--env-ink)' }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        );
      })}
    </main>
  );
}
