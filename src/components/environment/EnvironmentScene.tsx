import {
  BLUR_SIGMAS,
  ENVIRONMENTS,
  VEIL_ALPHAS,
  groundOpacity,
  rimOpacity,
  sampleRangeTone,
  veilAmplitude,
  veilDuration,
  type EnvironmentId,
} from '@/lib/environments';
import { buildRidge, hashSeed, mulberry32, rangeGeometry } from '@/lib/ridge';

/**
 * Scene coordinate space. `preserveAspectRatio="none"` stretches this to the
 * container, and every constant in the generator is a fraction of height, so
 * the exact numbers here only set path precision.
 */
export const SCENE = { width: 1440, height: 900 } as const;

/**
 * How many of the farthest ranges carry a blur filter.
 *
 * Kept low and exported, because it is a performance budget rather than a
 * visual preference: these layers must never be scaled, or the filter is
 * re-rasterised every frame.
 */
export const BLUR_LAYERS = 2;

/** Silhouettes close below the floor so parallax can lift them without gapping. */
const FLOOR = SCENE.height * 1.6;

/**
 * Proportions solved against the reference — see the plan, §I.2.
 *
 * The sun's own radius (0.052 of height) and halo scale (3.4x) live in CSS
 * instead, on `.env-sun` / `.env-halo`, because the light source is rendered
 * outside the stretched SVG to stay circular at every aspect ratio.
 */
const SUN_ABOVE_HORIZON = 0.11;
const RIM_WIDTH = 0.0034;
const BLUR_SCALE = 0.006;
const GROUND_TOP = 0.86;
const VEIL_WIDTH = 0.62;

/**
 * Which slice of the scene to draw.
 *
 * The scene is deliberately splittable so page content can sit *inside* the
 * landscape: `back` renders the sky, light and every range but the nearest,
 * `front` renders the nearest range, its fog and the ground wash. Put the
 * headline between the two and the closest mountains occlude it — which is
 * what actually sells the depth. `all` draws the whole scene in one pass.
 */
export type ScenePart = 'all' | 'back' | 'front';

export interface EnvironmentSceneProps {
  id: EnvironmentId;
  /** Terrain seed. The same seed across all six keeps the landscape continuous. */
  seed?: string;
  part?: ScenePart;
  /**
   * Drop the farthest ranges and blur layers on small screens. The atmosphere
   * is the content; the layer count is the budget.
   */
  maxRanges?: number;
  maxBlurLayers?: number;
  className?: string;
}

export function EnvironmentScene({
  id,
  seed = 'aizen',
  part = 'all',
  maxRanges,
  maxBlurLayers = BLUR_LAYERS,
  className,
}: EnvironmentSceneProps) {
  const env = ENVIRONMENTS[id];
  const { width: W, height: H } = SCENE;

  const count = Math.max(2, Math.min(env.ranges, maxRanges ?? env.ranges));
  const geometry = rangeGeometry(count, H, env.horizon, env.peaks);

  // Veil placement is seeded, not random, so server and client agree. The
  // sequence is consumed in range order, so a split scene must draw the same
  // values as a whole one — hence pre-computing all of them up front.
  const veilRand = mulberry32(hashSeed(`${seed}:${id}:veil`));
  const veils = geometry.map(() => ({
    cx: veilRand() * W,
    ry: H * (0.055 + veilRand() * 0.04),
  }));

  const nearest = count - 1;
  const drawsBack = part !== 'front';
  const drawsFront = part !== 'back';
  const rangeIndices = geometry
    .map((_, i) => i)
    .filter((i) => (i === nearest ? drawsFront : drawsBack));

  const uid = (suffix: string) => `${id}-${part}-${suffix}`;

  return (
    <div
      className={['env-layer', className].filter(Boolean).join(' ')}
      data-env={id}
      data-part={part}
    >
      {drawsBack && <div className="env-surface" />}

      {/* The light source lives outside the SVG on purpose. The scene uses
          `preserveAspectRatio="none"` so the ranges stretch to any viewport,
          which would squash a circle into an oval at phone aspect ratios.
          Sized from the container's height with `aspect-ratio: 1`, the sun
          stays round everywhere. */}
      {drawsBack && (
        <div
          className="env-light"
          style={
            {
              '--sun-x': `${(env.sun * 100).toFixed(1)}%`,
              '--sun-y': `${((env.horizon - SUN_ABOVE_HORIZON) * 100).toFixed(1)}%`,
              '--sun-color': env.light,
            } as React.CSSProperties
          }
        >
          <span className="env-halo" />
          <span className="env-sun" />
        </div>
      )}

      <svg
        className="env-scene"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* Fog veil body — always the air stop, at the reference's opacities */}
          <radialGradient id={uid('veil')}>
            <stop offset="0%" stopColor={env.stops[1]} stopOpacity="0.9" />
            <stop offset="55%" stopColor={env.stops[1]} stopOpacity="0.42" />
            <stop offset="100%" stopColor={env.stops[1]} stopOpacity="0" />
          </radialGradient>

          {drawsFront && (
            <linearGradient id={uid('ground')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={env.stops[1]} stopOpacity="0" />
              <stop
                offset="100%"
                stopColor={env.stops[1]}
                stopOpacity={groundOpacity(env.haze).toFixed(3)}
              />
            </linearGradient>
          )}

          {rangeIndices.map((i) => {
            const g = geometry[i];
            const tone = sampleRangeTone(env, i, count);
            return (
              <linearGradient
                key={`grad-${i}`}
                id={uid(`range-${i}`)}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={g.top.toFixed(1)}
                x2="0"
                y2={g.bottom.toFixed(1)}
              >
                {/* Aerial perspective inside the silhouette: fog pools at its foot. */}
                <stop offset="0%" stopColor={tone.base} />
                <stop offset="45%" stopColor={tone.mid} />
                <stop offset="100%" stopColor={tone.foot} />
              </linearGradient>
            );
          })}

          {rangeIndices
            .filter((i) => i < maxBlurLayers)
            .map((i) => (
              <filter
                key={`blur-${i}`}
                id={uid(`blur-${i}`)}
                // Tight region keeps the filter raster small. Widening this is
                // the fastest way to make the scene expensive.
                x="-4%"
                y="-30%"
                width="108%"
                height="160%"
              >
                <feGaussianBlur stdDeviation={(BLUR_SIGMAS[i] * BLUR_SCALE * H).toFixed(2)} />
              </filter>
            ))}
        </defs>

        {rangeIndices.map((i) => {
          const g = geometry[i];
          const tone = sampleRangeTone(env, i, count);
          const ridge = buildRidge({
            seed,
            index: i,
            width: W,
            height: H,
            geometry: g,
            sharp: env.sharp,
            floor: FLOOR,
          });

          const blur = i < maxBlurLayers ? `url(#${uid(`blur-${i}`)})` : undefined;
          const alpha = VEIL_ALPHAS[Math.min(VEIL_ALPHAS.length - 1, i)];

          return (
            <g
              key={`range-${i}`}
              data-layer="range"
              data-range={i}
              data-blurred={blur ? 'true' : 'false'}
              className={`range range-${i}`}
            >
              <path
                id={uid(`ridge-${i}`)}
                d={ridge.silhouette}
                fill={`url(#${uid(`range-${i}`)})`}
                filter={blur}
              />
              {/* The rim light is the same geometry, so it reuses the path
                  rather than shipping a second copy of it — which is most of
                  this document's weight. The silhouette closes outside the
                  viewBox precisely so this stroke has no edges to draw. */}
              <use
                href={`#${uid(`ridge-${i}`)}`}
                fill="none"
                stroke={tone.rim}
                strokeWidth={(H * RIM_WIDTH).toFixed(2)}
                strokeLinecap="round"
                opacity={rimOpacity(i).toFixed(3)}
                filter={blur}
              />
              <g
                className="fog-veil"
                style={
                  {
                    '--fog-dur': `${veilDuration(env.drift, i).toFixed(1)}s`,
                    '--fog-amp': `${(veilAmplitude(env.drift, i) * (W / 870)).toFixed(0)}px`,
                    '--fog-alpha': alpha.toFixed(3),
                  } as React.CSSProperties
                }
              >
                <ellipse
                  cx={veils[i].cx.toFixed(1)}
                  cy={g.bottom.toFixed(1)}
                  rx={(W * VEIL_WIDTH).toFixed(1)}
                  ry={veils[i].ry.toFixed(1)}
                  fill={`url(#${uid('veil')})`}
                />
              </g>
            </g>
          );
        })}

        {drawsFront && (
          <rect
            x="0"
            y={(H * GROUND_TOP).toFixed(1)}
            width={W}
            height={(H * (1 - GROUND_TOP)).toFixed(1)}
            fill={`url(#${uid('ground')})`}
            data-layer="ground"
          />
        )}
      </svg>
    </div>
  );
}
