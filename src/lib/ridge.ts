/**
 * Deterministic mountain-range generator.
 *
 * Everything here is seeded. `Math.random()` must never appear in this file:
 * the server and the client render the same markup, and a random ridge is a
 * guaranteed hydration mismatch.
 *
 * Geometry constants were solved against the reference scene at 870x640 with
 * horizon 0.42 — see the plan, §I.2. They are expressed as fractions of scene
 * height so they hold at any viewBox.
 */

/* ------------------------------------------------------------------ *
 * Seeded randomness
 * ------------------------------------------------------------------ */

/** mulberry32 — small, fast, good enough, and completely deterministic. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable string → 32-bit seed, so callers can seed with a slug. */
export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const smoothstep = (t: number): number => t * t * (3 - 2 * t);

/**
 * 1-D value noise over a seeded lattice, sampled at `x` in lattice units.
 * Wraps at `size` so a ridge can tile horizontally if we ever need it to.
 */
function makeValueNoise(seed: number, size: number): (x: number) => number {
  const rand = mulberry32(seed);
  const lattice = Array.from({ length: size }, rand);

  return (x: number): number => {
    const i = Math.floor(x);
    const f = x - i;
    const a = lattice[((i % size) + size) % size];
    const b = lattice[(((i + 1) % size) + size) % size];
    return a + (b - a) * smoothstep(f);
  };
}

/**
 * Fractal noise in [0, 1].
 *
 * `sharp` blends smooth fBm (rolling hills) into ridged noise (jagged peaks).
 * This is what separates Ink wash (0.30) from Moonlit (0.68) visually.
 */
function fbm(
  noise: (x: number) => number,
  x: number,
  octaves: number,
  sharp: number,
): number {
  let sum = 0;
  let amplitude = 1;
  let frequency = 1;
  let norm = 0;

  for (let o = 0; o < octaves; o++) {
    const n = noise(x * frequency);
    // Ridged transform: fold the noise about its midpoint to make creases.
    const ridged = 1 - Math.abs(n * 2 - 1);
    const blended = n + (ridged - n) * sharp;
    sum += blended * amplitude;
    norm += amplitude;
    // Steeper than the usual 0.5 falloff: detail octaves should texture the
    // silhouette, not compete with its overall mass.
    amplitude *= 0.38;
    frequency *= 2.07; // non-integer, so octaves don't align into visible beats
  }

  return sum / norm;
}

/* ------------------------------------------------------------------ *
 * Range geometry
 * ------------------------------------------------------------------ */

/**
 * Tuning constants, all as fractions of scene height, solved against the
 * reference at 870x640 / horizon 0.42.
 *
 *   top[0]    = horizonY - 0.022H
 *   top[i]    = top[0] + span * (i/(n-1))^1.28
 *   height[i] = linear ramp; the nearest range's foot lands at the scene floor
 */
export const RIDGE_TUNING = {
  /** How far the farthest crest sits above the horizon. */
  firstTopAboveHorizon: 0.022,
  /** Exponent shaping how range tops accelerate downward. */
  topEase: 1.28,
  /** Height of the farthest range's gradient band. */
  firstBandHeight: 0.094,
  /** Crest amplitude for the farthest range, before `peaks` is applied. */
  baseAmplitude: 0.075,
  /**
   * How much taller each successive (nearer) range's crest gets.
   * Kept low: nearer ranges that grow too fast swallow the ones behind them
   * and the scene collapses into two masses instead of reading as depth.
   */
  amplitudeGrowth: 0.2,
  /**
   * Where the nearest range's crest sits, as a fraction of the distance from
   * the horizon to the scene floor. Matches the reference's spread.
   */
  lastTopBelowHorizon: 0.49,
  /**
   * Lattice size — how many major landforms span the width.
   * Keep this low. High values read as torn paper or a heart monitor, not
   * as mountains; the silhouette needs a few big masses, not many small ones.
   */
  lattice: 7,
  /** Noise octaves. Three is enough; four is not visibly better and costs path length. */
  octaves: 3,
  /**
   * Samples across the width.
   *
   * This is the single biggest lever on document size: every sample is a
   * cubic Bézier command, and six environments' worth of ridges is most of
   * the HTML. At 128 across 1440 units each segment is ~11 units wide, which
   * is already finer than the blur that sits on top of it.
   */
  samples: 128,
  /**
   * How far the crest is sampled beyond each edge, in scene units.
   *
   * The silhouette and the rim light are the same geometry, so the rim is
   * drawn with `<use>` rather than a second copy of the path — which halves
   * the document. That only works if the path's closing edges sit outside
   * the viewBox, otherwise stroking it draws lines down the screen edges.
   */
  overhang: 12,
} as const;

export interface RangeGeometry {
  /** Index, 0 = farthest. */
  index: number;
  /** Gradient y1 — the highest point of this range. */
  top: number;
  /** Gradient y2 — where this range's fog pooling ends. */
  bottom: number;
  /** Vertical centre the crest oscillates around. */
  crestBase: number;
  /** Peak-to-trough amplitude of the crest. */
  amplitude: number;
}

export function rangeGeometry(
  count: number,
  height: number,
  horizon: number,
  peaks: number,
): RangeGeometry[] {
  const t = RIDGE_TUNING;
  const horizonY = height * horizon;
  const top0 = horizonY - height * t.firstTopAboveHorizon;

  // The nearest range's crest should sit low enough that its foot reaches the
  // scene floor, matching the reference's last band running just past the edge.
  const topLast = horizonY + (height - horizonY) * t.lastTopBelowHorizon;
  const span = topLast - top0;

  const firstBand = height * t.firstBandHeight;
  const lastBand = height - topLast;

  return Array.from({ length: count }, (_, i) => {
    const u = count === 1 ? 0 : i / (count - 1);
    const top = top0 + span * Math.pow(u, t.topEase);
    const band = firstBand + (lastBand - firstBand) * u;
    const amplitude = height * t.baseAmplitude * peaks * (1 + i * t.amplitudeGrowth);

    return {
      index: i,
      top,
      bottom: top + band,
      // The crest oscillates below its gradient top, so `top` really is the
      // highest point the silhouette reaches.
      crestBase: top + amplitude / 2,
      amplitude,
    };
  });
}

/* ------------------------------------------------------------------ *
 * Path construction
 * ------------------------------------------------------------------ */

/**
 * Catmull-Rom through the sampled crest, converted to cubic Béziers.
 * Produces the same dense `C` output the reference uses, and stays smooth
 * without the kinks a polyline would show under blur.
 */
function crestToPath(points: Array<[number, number]>): string {
  if (points.length < 2) return '';

  const at = (i: number): [number, number] =>
    points[Math.min(points.length - 1, Math.max(0, i))];

  // Integer precision. On a 1440x900 viewBox a sub-unit coordinate is far
  // below what a blurred silhouette can show, and the decimals are pure
  // document weight.
  const n = (v: number) => Math.round(v);

  let d = `M${n(points[0][0])},${n(points[0][1])}`;

  for (let i = 0; i < points.length - 1; i++) {
    const [p0x, p0y] = at(i - 1);
    const [p1x, p1y] = at(i);
    const [p2x, p2y] = at(i + 1);
    const [p3x, p3y] = at(i + 2);

    const c1x = p1x + (p2x - p0x) / 6;
    const c1y = p1y + (p2y - p0y) / 6;
    const c2x = p2x - (p3x - p1x) / 6;
    const c2y = p2y - (p3y - p1y) / 6;

    d += `C${n(c1x)},${n(c1y)} ${n(c2x)},${n(c2y)} ${n(p2x)},${n(p2y)}`;
  }

  return d;
}

export interface RidgeOptions {
  seed: string | number;
  /** Which range this is; also offsets the noise so ranges never repeat. */
  index: number;
  width: number;
  height: number;
  geometry: RangeGeometry;
  sharp: number;
  /**
   * Where the filled silhouette closes, defaulting to the scene floor.
   * Parallax lifts ranges upward, so the hero passes a floor below the
   * viewBox to stop a gap opening at the bottom of the scene.
   */
  floor?: number;
}

export interface Ridge {
  /** Open path along the crest — used for the rim-light stroke. */
  crest: string;
  /** Closed path down to the scene floor — used for the filled silhouette. */
  silhouette: string;
}

export function buildRidge({
  seed,
  index,
  width,
  height,
  geometry,
  sharp,
  floor = height,
}: RidgeOptions): Ridge {
  const t = RIDGE_TUNING;
  const numericSeed = typeof seed === 'string' ? hashSeed(seed) : seed;
  // Offset per range so neighbouring ridges never share a profile.
  const noise = makeValueNoise((numericSeed + index * 8191) >>> 0, t.lattice);

  const left = -t.overhang;
  const right = width + t.overhang;

  const points: Array<[number, number]> = [];
  for (let s = 0; s <= t.samples; s++) {
    const u = s / t.samples;
    const x = left + u * (right - left);
    // Nearer ranges get slightly lower frequency, so they read as closer.
    const frequency = t.lattice * (1 - index * 0.06);
    const n = fbm(noise, u * frequency, t.octaves, sharp);
    const y = geometry.crestBase + (0.5 - n) * geometry.amplitude;
    points.push([x, y]);
  }

  const crest = crestToPath(points);
  // Closes below the floor and beyond both edges, so every closing segment
  // lies outside the viewBox and the rim light can reuse this exact path.
  const silhouette = `${crest}L${right},${Math.round(floor)}L${left},${Math.round(floor)}Z`;

  return { crest, silhouette };
}
