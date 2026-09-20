'use client';

import { useMotionValue, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/**
 * The cursor system.
 *
 * Deliberately small. A cursor earns its place by telling you what a thing
 * will do before you commit to it — not by drawing trails. It reads a
 * `data-cursor` attribute off whatever is under the pointer and shows that
 * word, which means adding a new state is a markup change, not a code change.
 *
 * It removes itself entirely on touch and under reduced motion, and it never
 * takes pointer events, so it cannot become the reason something is
 * unclickable.
 */

const SPRING = { stiffness: 380, damping: 32, mass: 0.4 };

export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  useEffect(() => {
    // A fine pointer is the requirement, not a screen width: a tablet with a
    // stylus and a laptop with a trackpad are not the same thing.
    const fine = window.matchMedia('(pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => setEnabled(fine.matches && !still.matches);
    sync();

    fine.addEventListener('change', sync);
    still.addEventListener('change', sync);
    return () => {
      fine.removeEventListener('change', sync);
      still.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);

      const target = (event.target as Element | null)?.closest?.('[data-cursor]');
      setLabel(target?.getAttribute('data-cursor') ?? null);
      setActive(Boolean(target));
    };

    const onLeave = () => {
      x.set(-100);
      y.set(-100);
      setActive(false);
      setLabel(null);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled, x, y]);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    const write = () => {
      node.style.transform = `translate3d(${sx.get()}px, ${sy.get()}px, 0)`;
    };

    write();
    const unsubX = sx.on('change', write);
    const unsubY = sy.on('change', write);
    return () => {
      unsubX();
      unsubY();
    };
  }, [enabled, sx, sy]);

  if (!enabled) return null;

  return (
    <div ref={ref} className="cursor" data-active={active} aria-hidden="true">
      <span className="cursor-dot" />
      {label && label.length > 0 && <span className="cursor-label">{label}</span>}
    </div>
  );
}
