'use client';

import { motion, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { DIAGRAMS, type DiagramName } from '@/content/diagrams';
import {
  DIAGRAM_H,
  DIAGRAM_W,
  NODE_PAD_Y,
  NODE_PLATE_W,
  diagramRows,
  layoutDiagram,
} from '@/lib/diagram-geometry';

/**
 * A system, drawn — the case-study version.
 *
 * Edges draw themselves when the diagram enters view, then a pulse runs along
 * each one so direction is readable without arrowheads cluttering the type.
 * The pulse uses CSS `offset-path`, which animates `offset-distance` — a
 * composited property — rather than animating `stroke-dashoffset`, which
 * repaints the whole path every frame.
 *
 * Scroll-triggered rather than scroll-linked, so it never fights the reveals
 * wrapping it, and so Motion's `useScroll` transform caveat cannot apply.
 */

export interface SystemDiagramProps {
  name: DiagramName;
}

/** If the observer never fires, the lines draw anyway after this long. */
const FAILSAFE_MS = 1600;

export function SystemDiagram({ name }: SystemDiagramProps) {
  const diagram = DIAGRAMS[name];
  const { nodes, edges } = layoutDiagram(diagram);

  // Same rule as Reveal: the drawing is an enhancement, so it must fail
  // visible. Driven by an explicit observer plus a timeout rather than
  // `whileInView`, which could leave the lines undrawn for good.
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [failsafe, setFailsafe] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setFailsafe(true), FAILSAFE_MS);
    return () => window.clearTimeout(timer);
  }, []);
  const drawn = inView || failsafe;

  return (
    <figure className="system-diagram" ref={ref}>
      <svg viewBox={`0 0 ${DIAGRAM_W} ${DIAGRAM_H}`} aria-hidden="true" focusable="false">
        <g className="diagram-edges">
          {edges.map((edge, i) => (
            <g key={edge.key}>
              <motion.path
                d={edge.d}
                className="diagram-edge"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={drawn ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.75, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
              />
              <circle
                className="diagram-pulse"
                r="2.5"
                style={
                  {
                    offsetPath: `path("${edge.d}")`,
                    animationDelay: `${i * 0.45}s`,
                  } as React.CSSProperties
                }
              />
            </g>
          ))}
        </g>

        {/* Nodes are content, so they are never hidden behind an entrance
            animation. They used to fade in on `whileInView`, and when the
            observer did not fire the labels simply stayed invisible. Only the
            connecting lines draw in; if that fails, you still get the
            labels. */}
        <g className="diagram-nodes">
          {nodes.map((node) => (
            <g key={node.id} data-accent={node.accent ? 'true' : 'false'}>
              <DiagramNode node={node} />
            </g>
          ))}
        </g>
      </svg>

      <DiagramList name={name} />

      <figcaption>{diagram.caption}</figcaption>
    </figure>
  );
}

/**
 * The diagram as a list.
 *
 * On a phone the SVG scales to about half size, which put its smallest text
 * at roughly 6px: technically present, practically unreadable. Below the
 * breakpoint this list replaces it, with the same nodes in the same order and
 * parallel inlets kept side by side.
 *
 * It is also the diagram's accessible form at every size. The SVG is marked
 * decorative; a screen reader gets these rows, which carry the actual
 * content, instead of a one-sentence caption.
 */
export function DiagramList({ name }: { name: DiagramName }) {
  const rows = diagramRows(DIAGRAMS[name]);

  return (
    <ol className="diagram-list">
      {rows.map((row) => (
        <li key={row.map((n) => n.id).join('+')} className="diagram-list-row">
          {row.map((node) => (
            <span
              key={node.id}
              className="diagram-list-node"
              data-accent={node.accent ? 'true' : 'false'}
            >
              <span className="diagram-list-label">{node.label}</span>
              {node.detail && <span className="diagram-list-detail">{node.detail}</span>}
            </span>
          ))}
        </li>
      ))}
    </ol>
  );
}

/** Shared by both diagram renderers so a node looks the same everywhere. */
export function DiagramNode({ node }: { node: ReturnType<typeof layoutDiagram>['nodes'][number] }) {
  return (
    <>
      {/* Knocks the edge out from behind the label. */}
      <rect
        className="diagram-node-plate"
        x={node.x - NODE_PLATE_W / 2}
        y={node.y - NODE_PAD_Y}
        width={NODE_PLATE_W}
        height={NODE_PAD_Y * 2}
        rx={2}
      />
      <text className="diagram-node-label" x={node.x} y={node.detail ? node.y - 5 : node.y + 1}>
        {node.label}
      </text>
      {node.detail && (
        <text className="diagram-node-detail" x={node.x} y={node.y + 12}>
          {node.detail}
        </text>
      )}
    </>
  );
}
