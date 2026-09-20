'use client';

import { useEffect, useRef } from 'react';

import { ENVIRONMENT_SEQUENCE } from '@/lib/environments';

import { EnvironmentScene, type ScenePart } from './EnvironmentScene';
import { environment, layerOpacity, nearestEnvironment } from './environment-store';

export interface EnvironmentStackProps {
  part?: ScenePart;
  seed?: string;
  maxRanges?: number;
  maxBlurLayers?: number;
  /**
   * Only one stack should own the document's `data-env`, which drives ink
   * colour. With a split scene that is the back layer.
   */
  ownsDocumentEnv?: boolean;
}

/**
 * All six environments, stacked. At most two ever carry non-zero opacity, and
 * the rest are skipped by `content-visibility`, so the cost is two layers
 * regardless of how many states exist.
 *
 * Opacity is written imperatively from a store subscription rather than
 * through React state: this runs every frame during a scrub.
 */
export function EnvironmentStack({
  part = 'all',
  seed,
  maxRanges,
  maxBlurLayers,
  ownsDocumentEnv = false,
}: EnvironmentStackProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;

    const layers = Array.from(
      container.querySelectorAll<HTMLElement>('[data-env-layer]'),
    );

    let lastNamed = '';

    return environment.subscribe((progress) => {
      layers.forEach((layer, index) => {
        const opacity = layerOpacity(index, progress);
        layer.style.opacity = String(opacity);
        layer.dataset.active = opacity > 0 ? 'true' : 'false';
      });

      if (!ownsDocumentEnv) return;
      const named = nearestEnvironment(progress);
      if (named !== lastNamed) {
        lastNamed = named;
        document.documentElement.dataset.env = named;
      }
    });
  }, [ownsDocumentEnv]);

  return (
    <div ref={root} className="env-stack" aria-hidden="true">
      {ENVIRONMENT_SEQUENCE.map((id, index) => (
        <div
          key={id}
          data-env-layer={id}
          data-active={index === 0 ? 'true' : 'false'}
          // Inline so the first environment is painted server-side: with
          // JavaScript disabled the landscape still renders.
          style={{ opacity: index === 0 ? 1 : 0 }}
        >
          <EnvironmentScene
            id={id}
            part={part}
            seed={seed}
            maxRanges={maxRanges}
            maxBlurLayers={maxBlurLayers}
          />
        </div>
      ))}
    </div>
  );
}
