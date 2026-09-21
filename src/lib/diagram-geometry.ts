import type { SystemDiagramData } from '@/content/diagrams';

/**
 * Diagram layout, shared.
 *
 * The case-study diagrams and the work sequence draw the same systems, so
 * the geometry lives in one place rather than in two components that would
 * drift apart the first time a node moves.
 */

export const DIAGRAM_W = 720;
export const DIAGRAM_H = 560;
/** Half-height of a node's knockout plate, in user units. */
export const NODE_PAD_Y = 17;
export const NODE_PLATE_W = 184;

export interface PlacedNode {
  id: string;
  label: string;
  detail?: string;
  accent: boolean;
  x: number;
  y: number;
}

export interface PlacedEdge {
  key: string;
  d: string;
}

export function layoutDiagram(diagram: SystemDiagramData): {
  nodes: PlacedNode[];
  edges: PlacedEdge[];
} {
  const nodes = diagram.nodes.map((node) => ({
    id: node.id,
    label: node.label,
    detail: node.detail,
    accent: Boolean(node.accent),
    x: node.x * DIAGRAM_W,
    y: node.y * DIAGRAM_H,
  }));

  const at = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) throw new Error(`Unknown diagram node "${id}"`);
    return node;
  };

  const edges = diagram.edges.map((edge) => {
    const a = at(edge.from);
    const b = at(edge.to);
    const dy = b.y - a.y;
    // Stop short of each node so the line never runs under its label.
    const start = a.y + Math.sign(dy) * NODE_PAD_Y;
    const end = b.y - Math.sign(dy) * NODE_PAD_Y;
    const mid = (start + end) / 2;
    // Vertical-first curve: siblings converging on one node stay legible.
    return {
      key: `${edge.from}-${edge.to}`,
      d: `M${a.x},${start}C${a.x},${mid} ${b.x},${mid} ${b.x},${end}`,
    };
  });

  return { nodes, edges };
}
