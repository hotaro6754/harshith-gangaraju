'use client';

import { ENVIRONMENT_SEQUENCE, type EnvironmentId } from '@/lib/environments';

/**
 * The environment is a single number.
 *
 * `progress` is a position along the six-state sequence, so 1.4 means "40% of
 * the way from Blue hour to Ink wash". Everything that can change the
 * environment — the hero's scroll timeline, the Sounding Line, a section
 * coming into view — writes this one value, which is why they can never
 * disagree or fight each other for control.
 *
 * Deliberately not React state: this updates every frame during a scrub, and
 * re-rendering six SVG scenes at 60fps would be absurd. Subscribers write
 * styles directly.
 */

export const ENV_MAX = ENVIRONMENT_SEQUENCE.length - 1;

type Listener = (progress: number) => void;

const listeners = new Set<Listener>();

const state = {
  progress: 0,
  /**
   * True once the visitor has used the Sounding Line. Scroll stops driving
   * the environment until they scroll again — whoever touched it last wins.
   */
  manual: false,
};

export const environment = {
  get progress() {
    return state.progress;
  },

  get manual() {
    return state.manual;
  },

  set manual(value: boolean) {
    state.manual = value;
  },

  /** Clamped so a rubber-banding scroll can never run off either end. */
  set(progress: number) {
    const next = Math.min(ENV_MAX, Math.max(0, progress));
    if (next === state.progress) return;
    state.progress = next;
    for (const listener of listeners) listener(next);
  },

  /** Returns an unsubscribe function safe to hand straight to `useEffect`. */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(state.progress);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Opacity for the layer at `index` given the current progress. */
export const layerOpacity = (index: number, progress: number): number =>
  Math.min(1, Math.max(0, 1 - Math.abs(progress - index)));

/** The environment the visitor would name if asked right now. */
export const nearestEnvironment = (progress: number): EnvironmentId =>
  ENVIRONMENT_SEQUENCE[Math.round(Math.min(ENV_MAX, Math.max(0, progress)))];
