'use client';

import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { useMemo, useRef } from 'react';

import { hashSeed, mulberry32 } from '@/lib/ridge';

/**
 * The spine.
 *
 * The hero's ridge line, continued down the page — same seeded noise, turned
 * on its side — drawing itself as the visitor descends. It exists to make the
 * page feel like one continuous descent rather than a hero followed by a
 * normal website, and to give scroll progress a form that belongs to this
 * site rather than a generic progress bar.
 *
 * `useScroll` with no `target` reads the document, which also avoids its one
 * real trap: progress measured against a target silently ignores CSS
 * transforms on any ancestor, and every reveal on this page is a transform.
 */

const W = 40;
const H = 1000;
const SAMPLES = 90;

function buildSpine(seed: string): string {
  const rand = mulberry32(hashSeed(seed));
  const lattice = Array.from({ length: 12 }, rand);
  const smooth = (t: number) => t * t * (3 - 2 * t);

  const noise = (v: number) => {
    const i = Math.floor(v);
    const f = v - i;
    const a = lattice[((i % lattice.length) + lattice.length) % lattice.length];
    const b = lattice[(((i + 1) % lattice.length) + lattice.length) % lattice.length];
    return a + (b - a) * smooth(f);
  };

  const points: Array<[number, number]> = [];
  for (let s = 0; s <= SAMPLES; s++) {
    const u = s / SAMPLES;
    // Pinches toward the centre at both ends so the line starts and finishes
    // on the rail rather than drifting off it.
    const taper = Math.sin(u * Math.PI) * 0.5 + 0.5;
    // Gentle. At full amplitude this reads as a scribble pinned to the
    // edge of the page rather than as the ridge line continuing.
    const x = W / 2 + (noise(u * 4) - 0.5) * W * 0.5 * taper;
    points.push([x, u * H]);
  }

  const n = (v: number) => Math.round(v * 10) / 10;
  let d = `M${n(points[0][0])},0`;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[i + 1];
    const my = (ay + by) / 2;
    d += `C${n(ax)},${n(my)} ${n(bx)},${n(my)} ${n(bx)},${n(by)}`;
  }
  return d;
}

export function RidgeConnector() {
  const path = useMemo(() => buildSpine('aizen-spine'), []);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  // The hero owns the first screen; the spine belongs to everything after it.
  const drawn = useTransform(scrollYProgress, [0.16, 0.94], [0, 1]);
  const pathLength = useSpring(drawn, { stiffness: 120, damping: 28, mass: 0.5 });

  return (
    <div className="spine" ref={ref} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <path className="spine-track" d={path} />
        <motion.path className="spine-drawn" d={path} style={{ pathLength }} />
      </svg>
    </div>
  );
}
