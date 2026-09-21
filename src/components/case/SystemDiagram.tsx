'use client';

import { motion } from 'motion/react';

import { DIAGRAMS, type DiagramName } from '@/content/diagrams';
import {
  DIAGRAM_H,
  DIAGRAM_W,
  NODE_PAD_Y,
  NODE_PLATE_W,
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

export function SystemDiagram({ name }: SystemDiagramProps) {
  const diagram = DIAGRAMS[name];
  const { nodes, edges } = layoutDiagram(diagram);

  return (
    <figure className="system-diagram">
      <svg viewBox={`0 0 ${DIAGRAM_W} ${DIAGRAM_H}`} role="img" aria-label={diagram.caption}>
        <g className="diagram-edges">
          {edges.map((edge, i) => (
            <g key={edge.key}>
              <motion.path
                d={edge.d}
                className="diagram-edge"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
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

        <g className="diagram-nodes">
          {nodes.map((node, i) => (
            <motion.g
              key={node.id}
              data-accent={node.accent ? 'true' : 'false'}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
            >
              <DiagramNode node={node} />
            </motion.g>
          ))}
        </g>
      </svg>

      <figcaption>{diagram.caption}</figcaption>
    </figure>
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
      <text className="diagram-node-label" x={node.x} y={node.detail ? node.y - 4 : node.y + 1}>
        {node.label}
      </text>
      {node.detail && (
        <text className="diagram-node-detail" x={node.x} y={node.y + 10}>
          {node.detail}
        </text>
      )}
    </>
  );
}
