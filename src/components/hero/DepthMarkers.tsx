import { ENVIRONMENTS, type EnvironmentId } from '@/lib/environments';

/**
 * The reason the landscape exists.
 *
 * Depth here is not decoration — it encodes the abstraction stack, and these
 * markers say so out loud. Each one rides its own range, at that range's
 * parallax speed, so what the visitor reads and what they see moving are the
 * same thing: the near ridge is what you operate, the far one is what you
 * model, and the distance between them is the point.
 *
 * Without this the hero is parallax wallpaper. With it, the motion is an
 * argument.
 */

export interface DepthMarker {
  /** Which range this rides. 0 is farthest. */
  range: number;
  label: string;
  note: string;
}

/** Positions are fractions of the scene, matching the range they belong to. */
const MARKERS: DepthMarker[] = [
  { range: 0, label: 'Model', note: 'graphs · recommendation · detection' },
  { range: 2, label: 'Detect', note: 'traffic · evidence · investigation' },
  { range: 4, label: 'Operate', note: 'infrastructure · deploy · on-call' },
];

export interface DepthMarkersProps {
  environment: EnvironmentId;
}

export function DepthMarkers({ environment }: DepthMarkersProps) {
  const env = ENVIRONMENTS[environment];
  const horizon = env.horizon;

  return (
    <div className="depth-markers" data-depth-markers>
      {MARKERS.map((marker, i) => {
        // Sit just above the range's crest, spaced down the frame the same
        // way the ranges themselves are.
        const t = MARKERS.length === 1 ? 0 : i / (MARKERS.length - 1);
        const top = (horizon + (1 - horizon) * (0.06 + t * 0.62)) * 100;

        return (
          <div
            key={marker.label}
            className="depth-marker"
            data-marker
            style={
              {
                top: `${top.toFixed(1)}%`,
                // Rides its own range, so the label and the ridge it names
                // move as one object.
                '--marker-parallax': `var(--parallax-${marker.range}, 0px)`,
                // Nearer markers sit further into the frame.
                '--marker-indent': `${(t * 16).toFixed(1)}%`,
              } as React.CSSProperties
            }
          >
            <span className="depth-marker-rule" aria-hidden="true" />
            <span className="depth-marker-label">{marker.label}</span>
            <span className="depth-marker-note">{marker.note}</span>
          </div>
        );
      })}
    </div>
  );
}
