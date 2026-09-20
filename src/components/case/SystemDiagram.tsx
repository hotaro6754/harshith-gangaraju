'use client';

import { motion } from 'motion/react';

import { DIAGRAMS, type DiagramName } from '@/content/diagrams';

/**
 * A system, drawn.
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

const W = 720;
const H = 560;
/** Half-height of a node's knockout box, in user units. */
const NODE_PAD_Y = 17;

export interface SystemDiagramProps {
  name: DiagramName;
}

export function SystemDiagram({ name }: SystemDiagramProps) {
  const diagram = DIAGRAMS[name];

  const at = (id: string) => {
    const node = diagram.nodes.find((n) => n.id === id);
    if (!node) throw new Error(`Unknown node "${id}" in diagram "${name}"`);
    return { x: node.x * W, y: node.y * H };
  };

  /** Stops short of each node so the line never runs under its label. */
  const edgePath = (from: string, to: string) => {
    const a = at(from);
    const b = at(to);
    const dy = b.y - a.y;
    const start = a.y + Math.sign(dy) * NODE_PAD_Y;
    const end = b.y - Math.sign(dy) * NODE_PAD_Y;
    const mid = (start + end) / 2;
    // Vertical-first curve: siblings converging on one node stay legible.
    return `M${a.x},${start}C${a.x},${mid} ${b.x},${mid} ${b.x},${end}`;
  };

  return (
    <figure className="system-diagram">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={diagram.caption}>
        <g className="diagram-edges">
          {diagram.edges.map((edge, i) => {
            const d = edgePath(edge.from, edge.to);
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <motion.path
                  d={d}
                  className="diagram-edge"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                  transition={{ duration: 0.75, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                />
                <circle
                  className="diagram-pulse"
                  r="2.5"
                  style={
                    {
                      offsetPath: `path("${d}")`,
                      animationDelay: `${i * 0.45}s`,
                    } as React.CSSProperties
                  }
                />
              </g>
            );
          })}
        </g>

        <g className="diagram-nodes">
          {diagram.nodes.map((node, i) => {
            const { x, y } = at(node.id);
            return (
              <motion.g
                key={node.id}
                data-accent={node.accent ? 'true' : 'false'}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
              >
                {/* Knocks the edge out from behind the label. */}
                <rect
                  className="diagram-node-plate"
                  x={x - 92}
                  y={y - NODE_PAD_Y}
                  width={184}
                  height={NODE_PAD_Y * 2}
                  rx={2}
                />
                <text className="diagram-node-label" x={x} y={node.detail ? y - 4 : y + 1}>
                  {node.label}
                </text>
                {node.detail && (
                  <text className="diagram-node-detail" x={x} y={y + 10}>
                    {node.detail}
                  </text>
                )}
              </motion.g>
            );
          })}
        </g>
      </svg>

      <figcaption>{diagram.caption}</figcaption>
    </figure>
  );
}
