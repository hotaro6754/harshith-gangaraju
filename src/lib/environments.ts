/**
 * The six atmospheric environments.
 *
 * Every value here was read off the live FeralUI Gradient Builder
 * (SCENES › Mist) — https://feralui.dev/gradients — not derived or guessed.
 * Credited in the site colophon.
 *
 * Band roles for `stops`:
 *   0 sky · 1 air (light-source tint) · 2..5 range tones, far → near
 *
 * `rangeTones` is the terrain ramp as the reference renders it at 5 ranges.
 * It is NOT simply stops[2..5] — the generator darkens farther ranges and
 * applies aerial perspective *inside* each silhouette (the three-stop
 * gradient). Resampled by `sampleRangeTone` when a preset asks for a
 * different range count.
 */

export const ENVIRONMENT_IDS = [
  'morning-mist',
  'blue-hour',
  'ink-wash',
  'dusk-ember',
  'pine-wind',
  'moonlit',
] as const;

export type EnvironmentId = (typeof ENVIRONMENT_IDS)[number];

/** One range's vertical gradient: base at 0%, lift at 45%, heavy lift at 100%. */
export interface RangeTone {
  /** 0% — the silhouette's own colour */
  base: string;
  /** 45% — slight lift */
  mid: string;
  /** 100% — heavy lift toward the sky; fog pooling at the ridge base */
  foot: string;
  /** crest rim-light stroke colour */
  rim: string;
}

export interface Environment {
  id: EnvironmentId;
  /** Display name, as the reference names it. */
  name: string;
  /** Six palette stops, sky → ground. */
  stops: readonly [string, string, string, string, string, string];
  /** Number of mountain ranges. */
  ranges: number;
  /** Horizon as a fraction of scene height (0.42 = "42% sky"). */
  horizon: number;
  /** Ridge amplitude, 0–1. */
  peaks: number;
  /** Ridged-noise exponent: low = rolling, high = jagged. */
  sharp: number;
  /** Atmospheric haze, 0–1. Drives the ground wash opacity. */
  haze: number;
  /** Light-source x position as a fraction of scene width. */
  sun: number;
  /** Fog drift rate, 0–1. Drives veil duration and amplitude. */
  drift: number;
  /** Grain opacity, 0–1. */
  noise: number;
  /**
   * Sun/moon disc and halo colour. Harvested per preset — this does not
   * follow a clean formula. Moonlit's is a moon (#bec1c8 against a
   * near-black sky), not a lightened sky stop.
   */
  light: string;
  /** Terrain ramp at 5 ranges. */
  rangeTones: readonly RangeTone[];
  /**
   * Foreground text colour, taken from the palette itself.
   * `--env-ink-muted` is derived from this in CSS via color-mix.
   */
  ink: string;
}

const tone = (base: string, mid: string, foot: string, rim: string): RangeTone => ({
  base,
  mid,
  foot,
  rim,
});

export const ENVIRONMENTS: Record<EnvironmentId, Environment> = {
  'morning-mist': {
    id: 'morning-mist',
    name: 'Morning mist',
    stops: ['#FBF2E2', '#F3DDC2', '#D9BCAE', '#B08F9B', '#7A6483', '#463A5E'],
    ranges: 5,
    horizon: 0.42,
    peaks: 0.5,
    sharp: 0.55,
    haze: 0.5,
    sun: 0.64,
    drift: 0.55,
    noise: 0.12,
    light: '#fcf7ec',
    ink: '#463A5E',
    rangeTones: [
      tone('#e4cab6', '#e6cdb8', '#f2dcc1', '#f0d9c0'),
      tone('#ccafab', '#d2b6af', '#edd6bf', '#ebd4bd'),
      tone('#a78d9a', '#b399a1', '#dfc8b8', '#e3cdba'),
      tone('#796681', '#8b788c', '#c6b2ac', '#d9c4b5'),
      tone('#463a5e', '#5f526e', '#a09095', '#cdbaae'),
    ],
  },

  'blue-hour': {
    id: 'blue-hour',
    name: 'Blue hour',
    stops: ['#EAF2F9', '#D3E3F0', '#A9C4DB', '#7FA0C2', '#54779F', '#324E78'],
    ranges: 5,
    horizon: 0.4,
    peaks: 0.6,
    sharp: 0.45,
    haze: 0.5,
    sun: 0.64,
    drift: 0.55,
    noise: 0.12,
    light: '#f1f7fb',
    ink: '#324E78',
    rangeTones: [
      tone('#bbd1e4', '#bfd4e6', '#d2e2ef', '#cedfee'),
      tone('#a0bbd5', '#a8c1d9', '#cbddec', '#c9dbeb'),
      tone('#7e9dbd', '#8ba8c5', '#bdd1e3', '#c2d5e6'),
      tone('#58789e', '#6b88ab', '#a6bcd3', '#b9cddf'),
      tone('#324e78', '#4a648b', '#879db9', '#b0c4d7'),
    ],
  },

  'ink-wash': {
    id: 'ink-wash',
    name: 'Ink wash',
    stops: ['#F8F6F0', '#EAE5D9', '#C8C2B3', '#9A9483', '#6B6558', '#3B362E'],
    ranges: 4,
    horizon: 0.44,
    peaks: 0.45,
    sharp: 0.3,
    haze: 0.62,
    sun: 0.7,
    drift: 0.45,
    noise: 0.16,
    light: '#faf9f5',
    ink: '#3B362E',
    rangeTones: [
      tone('#d6d1c3', '#d9d4c6', '#e9e4d8', '#e6e1d5'),
      tone('#bab5a6', '#c2bdae', '#e3ded1', '#e0dbcf'),
      tone('#979182', '#a49e8f', '#d5cfc2', '#d9d4c7'),
      tone('#6b655a', '#7e786d', '#bbb6aa', '#cfcabe'),
      tone('#3b362e', '#544f46', '#969187', '#c4bfb4'),
    ],
  },

  'dusk-ember': {
    id: 'dusk-ember',
    name: 'Dusk ember',
    stops: ['#FBE7CD', '#F5C8A1', '#DD9B88', '#B06E80', '#7A4B6F', '#452F56'],
    ranges: 6,
    horizon: 0.38,
    peaks: 0.62,
    sharp: 0.62,
    haze: 0.5,
    sun: 0.28,
    drift: 0.55,
    noise: 0.12,
    light: '#fdefdf',
    ink: '#452F56',
    rangeTones: [
      tone('#e7ae92', '#e9b294', '#f4c7a0', '#f2c39e'),
      tone('#cd918c', '#d39a8f', '#efc09e', '#edbd9d'),
      tone('#a87281', '#b47f86', '#e1b299', '#e5b69b'),
      tone('#79516f', '#8c6378', '#c89d91', '#dbaf98'),
      tone('#452f56', '#5e4663', '#a08081', '#cfa793'),
    ],
  },

  'pine-wind': {
    id: 'pine-wind',
    name: 'Pine wind',
    stops: ['#F2F7ED', '#DEEBD5', '#B6CFB1', '#88AB8D', '#5C8267', '#375343'],
    ranges: 5,
    horizon: 0.42,
    peaks: 0.52,
    sharp: 0.5,
    haze: 0.45,
    sun: 0.64,
    drift: 0.55,
    noise: 0.12,
    light: '#f7faf3',
    ink: '#375343',
    rangeTones: [
      tone('#c7dbc0', '#cbdec3', '#ddead4', '#d9e8d1'),
      tone('#aac5a9', '#b2cbb0', '#d6e5ce', '#d3e3cc'),
      tone('#87a78b', '#95b296', '#c8dac2', '#ccddc6'),
      tone('#608169', '#739179', '#b0c5ae', '#c4d5be'),
      tone('#375343', '#506958', '#8fa390', '#bacbb6'),
    ],
  },

  moonlit: {
    id: 'moonlit',
    name: 'Moonlit',
    // Inverted on purpose: stop 0 is the darkest (night zenith); the ramp
    // brightens toward the horizon before darkening again. Correct night-sky
    // behaviour — do not "fix" the order.
    stops: ['#101828', '#3A4A6B', '#33415F', '#26324C', '#1B2439', '#111826'],
    ranges: 5,
    horizon: 0.4,
    peaks: 0.58,
    sharp: 0.68,
    haze: 0.5,
    sun: 0.76,
    drift: 0.4,
    noise: 0.14,
    light: '#bec1c8',
    // The one dark environment: text is lit by the moon.
    ink: '#bec1c8',
    rangeTones: [
      tone('#364564', '#374665', '#3a4a6b', '#39496a'),
      tone('#2e3c59', '#303e5c', '#384868', '#384767'),
      tone('#25314a', '#28354f', '#354463', '#364564'),
      tone('#1b2539', '#202b41', '#2f3d59', '#344261'),
      tone('#111826', '#171f30', '#27324b', '#313f5c'),
    ],
  },
};

/** Descent order: light → dark, abstract → operational. */
export const ENVIRONMENT_SEQUENCE: readonly EnvironmentId[] = ENVIRONMENT_IDS;

/**
 * Fallback for anything that needs *an* environment without caring which.
 * The site's actual choice lives in `hero-environment.ts` — one constant, so
 * the document, the hero and the footer readout cannot disagree.
 */
export const DEFAULT_ENVIRONMENT: EnvironmentId = 'moonlit';

/* ------------------------------------------------------------------ *
 * Derived scene constants
 *
 * These formulas were solved against all six harvested presets and hold
 * exactly. See the plan, §I.2.
 * ------------------------------------------------------------------ */

/** Palette stop positions, fixed by the reference generator. */
export const STOP_POSITIONS = [8.3, 25, 41.7, 58.3, 75, 91.7] as const;

/** Veil alpha per range, far → near. Identical across all six presets. */
export const VEIL_ALPHAS = [0.62, 0.535, 0.449, 0.364, 0.274] as const;

/** Rim-light opacity for range i. Linear, universal. */
export const rimOpacity = (i: number): number => 0.2 + 0.055 * i;

/** Blur σ for range i — only the three farthest ranges are blurred. */
export const BLUR_SIGMAS = [3.84, 2.15, 0.95] as const;

/** Fog veil animation duration for range i, in seconds. */
export const veilDuration = (drift: number, i: number): number => {
  const base = 27.9 - 42 * (drift - 0.55);
  return base + base * 0.3 * i;
};

/** Fog veil drift amplitude in scene units. Sign alternates by range. */
export const veilAmplitude = (drift: number, i: number): number => {
  const amp = 45 + 73.3 * (drift - 0.4);
  return i % 2 === 0 ? amp : -amp;
};

/** Ground wash peak opacity. */
export const groundOpacity = (haze: number): number => haze * 0.52;

/* ------------------------------------------------------------------ *
 * Range tone resampling
 * ------------------------------------------------------------------ */

type Rgb = [number, number, number];

const parseHex = (hex: string): Rgb => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

const toHex = ([r, g, b]: Rgb): string =>
  '#' +
  [r, g, b]
    .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0'))
    .join('');

const mixHex = (a: string, b: string, t: number): string => {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
};

/**
 * Sample the stored 5-entry terrain ramp at range `i` of `count`.
 *
 * When `count` is 5 this returns the harvested tone untouched. For any other
 * count it interpolates between neighbouring harvested tones, so Ink wash (4)
 * and Dusk ember (6) stay on their own palette rather than borrowing one.
 */
export const sampleRangeTone = (
  env: Environment,
  i: number,
  count: number = env.ranges,
): RangeTone => {
  const ramp = env.rangeTones;
  if (count === ramp.length) return ramp[i];

  const t = count === 1 ? 0 : (i / (count - 1)) * (ramp.length - 1);
  const lo = Math.floor(t);
  const hi = Math.min(ramp.length - 1, lo + 1);
  const f = t - lo;
  if (f === 0) return ramp[lo];

  return {
    base: mixHex(ramp[lo].base, ramp[hi].base, f),
    mid: mixHex(ramp[lo].mid, ramp[hi].mid, f),
    foot: mixHex(ramp[lo].foot, ramp[hi].foot, f),
    rim: mixHex(ramp[lo].rim, ramp[hi].rim, f),
  };
};

export { mixHex, parseHex, toHex };
