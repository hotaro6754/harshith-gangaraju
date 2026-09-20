'use client';

import { motion } from 'motion/react';

import { STACK_EDGES, STACK_NODES } from '@/content/profile';

/**
 * The claim, drawn.
 *
 * A list of technologies says what someone has touched. This says what they
 * think connects — which is the actual argument the site is making, and the
 * one thing a wall of logos can never express.
 *
 * Scroll-*triggered*, not scroll-linked: the edges draw once when the diagram
 * enters view. That also sidesteps Motion's `useScroll` caveat, where progress
 * silently ignores CSS transforms on any ancestor — and every reveal on this
 * page is a transform.
 */

const W = 620;
const H = 420;

const at = (id: string) => {
  const node = STACK_NODES.find((n) => n.id === id);
  if (!node) throw new Error(`Unknown stack node: ${id}`);
  return { x: node.x * W, y: node.y * H };
};

export function StackDiagram() {
  return (
    <svg
      className="stack-diagram"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Software sits above security, AI and infrastructure, which meet at product, which resolves into the interface."
    >
      <g className="stack-edges">
        {STACK_EDGES.map(([from, to], i) => {
          const a = at(from);
          const b = at(to);
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: '0px 0px -20% 0px' }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
            />
          );
        })}
      </g>

      <g className="stack-nodes">
        {STACK_NODES.map((node, i) => {
          const { x, y } = at(node.id);
          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '0px 0px -20% 0px' }}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
              data-primary={node.primary ? 'true' : 'false'}
            >
              {/* Knocks the edge out from behind the label so lines never run
                  through the type. Hidden from assistive tech — it is the same
                  string as the visible label, and without this every node is
                  announced twice. */}
              <text x={x} y={y} className="stack-node-knockout" aria-hidden="true">
                {node.label}
              </text>
              <text x={x} y={y} className="stack-node">
                {node.label}
              </text>
            </motion.g>
          );
        })}
      </g>
    </svg>
  );
}
