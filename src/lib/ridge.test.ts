import { describe, expect, it } from 'vitest';

import {
  ENVIRONMENTS,
  ENVIRONMENT_IDS,
  VEIL_ALPHAS,
  groundOpacity,
  rimOpacity,
  sampleRangeTone,
  veilAmplitude,
  veilDuration,
} from './environments';
import { RIDGE_TUNING, buildRidge, hashSeed, mulberry32, rangeGeometry } from './ridge';

const W = 870;
const H = 640;

const geometryFor = (id: (typeof ENVIRONMENT_IDS)[number]) => {
  const env = ENVIRONMENTS[id];
  return rangeGeometry(env.ranges, H, env.horizon, env.peaks);
};

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = Array.from({ length: 20 }, a);
    const seqB = Array.from({ length: 20 }, b);
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = Array.from({ length: 20 }, mulberry32(1));
    const b = Array.from({ length: 20 }, mulberry32(2));
    expect(a).not.toEqual(b);
  });

  it('stays within [0, 1)', () => {
    const rand = mulberry32(999);
    for (let i = 0; i < 2000; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('hashSeed', () => {
  it('is stable across calls', () => {
    expect(hashSeed('harshith')).toBe(hashSeed('harshith'));
  });

  it('separates similar strings', () => {
    expect(hashSeed('range-0')).not.toBe(hashSeed('range-1'));
  });
});

describe('rangeGeometry', () => {
  it.each(ENVIRONMENT_IDS)('%s: tops descend monotonically', (id) => {
    const geo = geometryFor(id);
    for (let i = 1; i < geo.length; i++) {
      expect(geo[i].top).toBeGreaterThan(geo[i - 1].top);
    }
  });

  it.each(ENVIRONMENT_IDS)('%s: each band has positive height', (id) => {
    for (const g of geometryFor(id)) {
      expect(g.bottom).toBeGreaterThan(g.top);
    }
  });

  it.each(ENVIRONMENT_IDS)('%s: produces the declared number of ranges', (id) => {
    expect(geometryFor(id)).toHaveLength(ENVIRONMENTS[id].ranges);
  });

  it.each(ENVIRONMENT_IDS)('%s: nearer ranges have taller crests', (id) => {
    const geo = geometryFor(id);
    for (let i = 1; i < geo.length; i++) {
      expect(geo[i].amplitude).toBeGreaterThan(geo[i - 1].amplitude);
    }
  });

  it('keeps the farthest crest above the horizon', () => {
    const env = ENVIRONMENTS['morning-mist'];
    const geo = rangeGeometry(env.ranges, H, env.horizon, env.peaks);
    expect(geo[0].top).toBeLessThan(H * env.horizon);
  });

  it('handles a single range without dividing by zero', () => {
    const geo = rangeGeometry(1, H, 0.42, 0.5);
    expect(geo).toHaveLength(1);
    expect(Number.isFinite(geo[0].top)).toBe(true);
    expect(Number.isFinite(geo[0].bottom)).toBe(true);
  });
});

describe('buildRidge', () => {
  const env = ENVIRONMENTS['morning-mist'];
  const geo = rangeGeometry(env.ranges, H, env.horizon, env.peaks);
  const opts = { seed: 'aizen', index: 0, width: W, height: H, geometry: geo[0], sharp: env.sharp };

  it('is deterministic for the same seed', () => {
    expect(buildRidge(opts)).toEqual(buildRidge(opts));
  });

  it('differs between seeds', () => {
    expect(buildRidge(opts).crest).not.toBe(buildRidge({ ...opts, seed: 'other' }).crest);
  });

  it('differs between ranges at the same seed', () => {
    expect(buildRidge(opts).crest).not.toBe(buildRidge({ ...opts, index: 1 }).crest);
  });

  it('overhangs both edges so the rim stroke has no visible closing edges', () => {
    const { crest } = buildRidge(opts);
    const startX = parseFloat(crest.slice(1).split(',')[0]);
    const lastX = parseFloat(crest.slice(crest.lastIndexOf('C')).split(' ').pop()!.split(',')[0]);
    expect(startX).toBe(-RIDGE_TUNING.overhang);
    expect(lastX).toBe(W + RIDGE_TUNING.overhang);
  });

  it('closes the silhouette outside the viewBox on every side', () => {
    const { silhouette } = buildRidge({ ...opts, floor: H * 1.6 });
    const o = RIDGE_TUNING.overhang;
    const floor = Math.round(H * 1.6);
    expect(silhouette.endsWith(`L${W + o},${floor}L${-o},${floor}Z`)).toBe(true);
    expect(floor).toBeGreaterThan(H);
  });

  it('emits integer coordinates only', () => {
    const { crest } = buildRidge(opts);
    expect(crest).not.toMatch(/\d\.\d/);
  });

  it.each(ENVIRONMENT_IDS)('%s: every crest point stays inside the scene', (id) => {
    const e = ENVIRONMENTS[id];
    const g = rangeGeometry(e.ranges, H, e.horizon, e.peaks);
    for (let i = 0; i < g.length; i++) {
      const { crest } = buildRidge({
        seed: 'aizen',
        index: i,
        width: W,
        height: H,
        geometry: g[i],
        sharp: e.sharp,
      });
      const ys = [...crest.matchAll(/,(-?\d+)/g)]
        .map((m) => parseFloat(m[1]))
        .filter((_, idx) => idx % 2 === 0);
      for (const y of ys) {
        expect(y).toBeGreaterThan(-H);
        expect(y).toBeLessThan(H * 2);
      }
    }
  });

  it('emits no NaN', () => {
    for (const id of ENVIRONMENT_IDS) {
      const e = ENVIRONMENTS[id];
      const g = rangeGeometry(e.ranges, H, e.horizon, e.peaks);
      g.forEach((geometry, i) => {
        const r = buildRidge({ seed: id, index: i, width: W, height: H, geometry, sharp: e.sharp });
        expect(r.crest).not.toMatch(/NaN/);
        expect(r.silhouette).not.toMatch(/NaN/);
      });
    }
  });
});

describe('environment data', () => {
  it.each(ENVIRONMENT_IDS)('%s: has six palette stops as valid hex', (id) => {
    const env = ENVIRONMENTS[id];
    expect(env.stops).toHaveLength(6);
    for (const s of env.stops) expect(s).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it.each(ENVIRONMENT_IDS)('%s: stores five harvested range tones', (id) => {
    expect(ENVIRONMENTS[id].rangeTones).toHaveLength(5);
  });

  it.each(ENVIRONMENT_IDS)('%s: every tone is valid hex', (id) => {
    for (const t of ENVIRONMENTS[id].rangeTones) {
      for (const v of [t.base, t.mid, t.foot, t.rim]) {
        expect(v).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it("the nearest range's base equals the last palette stop", () => {
    // Held exactly across all six presets in the harvest.
    for (const id of ENVIRONMENT_IDS) {
      const env = ENVIRONMENTS[id];
      expect(env.rangeTones[4].base.toLowerCase()).toBe(env.stops[5].toLowerCase());
    }
  });
});

describe('sampleRangeTone', () => {
  it('returns harvested tones untouched at five ranges', () => {
    const env = ENVIRONMENTS['morning-mist'];
    for (let i = 0; i < 5; i++) {
      expect(sampleRangeTone(env, i, 5)).toEqual(env.rangeTones[i]);
    }
  });

  it('resamples to four ranges, keeping the endpoints', () => {
    const env = ENVIRONMENTS['ink-wash'];
    const tones = Array.from({ length: 4 }, (_, i) => sampleRangeTone(env, i, 4));
    expect(tones[0]).toEqual(env.rangeTones[0]);
    expect(tones[3]).toEqual(env.rangeTones[4]);
    for (const t of tones) expect(t.base).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('resamples to six ranges, keeping the endpoints', () => {
    const env = ENVIRONMENTS['dusk-ember'];
    const tones = Array.from({ length: 6 }, (_, i) => sampleRangeTone(env, i, 6));
    expect(tones[0]).toEqual(env.rangeTones[0]);
    expect(tones[5]).toEqual(env.rangeTones[4]);
  });
});

describe('derived scene formulas', () => {
  // These were solved against the harvest; the expected values are the ones
  // actually observed in the reference DOM.
  it('veil duration matches the reference at drift 0.55', () => {
    expect(veilDuration(0.55, 0)).toBeCloseTo(27.9, 1);
    expect(veilDuration(0.55, 1)).toBeCloseTo(36.3, 1);
    expect(veilDuration(0.55, 4)).toBeCloseTo(61.4, 1);
  });

  it('veil duration matches the reference at drift 0.45 and 0.40', () => {
    expect(veilDuration(0.45, 0)).toBeCloseTo(32.1, 1);
    expect(veilDuration(0.45, 1)).toBeCloseTo(41.7, 1);
    expect(veilDuration(0.4, 0)).toBeCloseTo(34.2, 1);
    expect(veilDuration(0.4, 4)).toBeCloseTo(75.2, 1);
  });

  it('veil amplitude matches the reference and alternates sign', () => {
    expect(veilAmplitude(0.55, 0)).toBeCloseTo(56, 0);
    expect(veilAmplitude(0.55, 1)).toBeCloseTo(-56, 0);
    expect(veilAmplitude(0.45, 0)).toBeCloseTo(49, 0);
    expect(veilAmplitude(0.4, 0)).toBeCloseTo(45, 0);
  });

  it('rim opacity matches the reference ramp', () => {
    const expected = [0.2, 0.255, 0.31, 0.365, 0.42];
    expected.forEach((v, i) => expect(rimOpacity(i)).toBeCloseTo(v, 6));
  });

  it('ground wash opacity matches the reference at haze 0.5', () => {
    expect(groundOpacity(0.5)).toBeCloseTo(0.26, 3);
  });

  it('veil alphas are the harvested ramp', () => {
    expect(VEIL_ALPHAS).toEqual([0.62, 0.535, 0.449, 0.364, 0.274]);
  });
});
