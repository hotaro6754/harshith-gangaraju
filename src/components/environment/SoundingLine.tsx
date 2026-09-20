'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ENVIRONMENTS, ENVIRONMENT_SEQUENCE } from '@/lib/environments';

import { ENV_MAX, environment, nearestEnvironment } from './environment-store';

/**
 * The Sounding Line — the environment control.
 *
 * Borrowed from FeralUI's PullCord, but only the principle: grab, resist,
 * detent, release. What makes a pull-cord feel mechanical rather than like a
 * drag handle is that it actuates *mid-pull*, at depth, not on release — so
 * this does the same, firing each detent as the line passes it.
 *
 * The metaphor is ours and it is load-bearing: a sounding line measures
 * depth, and depth is what this site's environments encode. Dragging down
 * descends through them.
 *
 * Accessibility is not an afterthought here — it is a slider, so it behaves
 * like one: arrow keys step, Home/End jump, and `aria-valuetext` announces
 * the environment by name rather than reading out an integer.
 */

const TRAVEL = 260; // px of drag for the full sequence

export function SoundingLine() {
  const trackRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startProgress = useRef(0);
  const lastDetent = useRef(0);

  const [label, setLabel] = useState(() => ENVIRONMENTS[ENVIRONMENT_SEQUENCE[0]].name);
  const [progress, setProgress] = useState(0);

  // Mirror the store into React state for the label and ARIA only — the knob
  // itself is positioned imperatively so a drag never waits on a render.
  useEffect(
    () =>
      environment.subscribe((value) => {
        setProgress(value);
        setLabel(ENVIRONMENTS[nearestEnvironment(value)].name);
        if (knobRef.current) {
          knobRef.current.style.transform = `translate3d(0, ${(value / ENV_MAX) * TRAVEL}px, 0)`;
        }
      }),
    [],
  );

  const commit = useCallback((value: number) => {
    environment.manual = true;
    environment.set(value);

    // Detent: fire as the line passes each mark, not when it is let go.
    const detent = Math.round(value);
    if (detent !== lastDetent.current) {
      lastDetent.current = detent;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(8);
      }
    }
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragging.current = true;
    startY.current = event.clientY;
    startProgress.current = environment.progress;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    const delta = (event.clientY - startY.current) / TRAVEL;
    commit(startProgress.current + delta * ENV_MAX);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    // Settle onto the nearest state rather than resting between two.
    commit(Math.round(environment.progress));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const current = Math.round(environment.progress);
    let next: number | null = null;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = current + 1;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = current - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = ENV_MAX;

    if (next === null) return;
    event.preventDefault();
    commit(Math.min(ENV_MAX, Math.max(0, next)));
  };

  const index = Math.round(progress);

  return (
    <div className="sounding" ref={trackRef}>
      <div className="sounding-track" aria-hidden="true">
        {ENVIRONMENT_SEQUENCE.map((id, i) => (
          <span key={id} className="sounding-mark" data-reached={i <= index ? 'true' : 'false'} />
        ))}
      </div>

      <button
        ref={knobRef}
        type="button"
        className="sounding-knob"
        role="slider"
        aria-label="Environment"
        aria-valuemin={0}
        aria-valuemax={ENV_MAX}
        aria-valuenow={index}
        aria-valuetext={label}
        aria-orientation="vertical"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <span className="sounding-knob-dot" aria-hidden="true" />
      </button>

      <p className="sounding-label" aria-hidden="true">
        {label}
      </p>
    </div>
  );
}
