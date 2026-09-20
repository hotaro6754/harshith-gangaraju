/**
 * System diagrams, as data.
 *
 * These are the part of a case study that actually shows engineering: not a
 * screenshot of a dashboard, but what feeds what. Positions are fractions of
 * the diagram box, so the same renderer handles every shape.
 */

export interface DiagramNode {
  id: string;
  label: string;
  /** Small type under the label — the concrete tech, where it helps. */
  detail?: string;
  x: number;
  y: number;
  /** Emphasised nodes are where the interesting work happens. */
  accent?: boolean;
}

export interface DiagramEdge {
  from: string;
  to: string;
  /** Labels the relationship when "an arrow" is not self-explanatory. */
  label?: string;
}

export interface SystemDiagramData {
  caption: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export const DIAGRAMS = {
  'cyber-os': {
    caption:
      'Two inlets — live traffic and submitted content — converge on one evidence layer, so a case can cite where every part of it came from.',
    nodes: [
      { id: 'traffic', label: 'Network traffic', detail: 'unidirectional, read-only', x: 0.18, y: 0.07 },
      { id: 'content', label: 'URL · Email · SMS · QR', detail: 'submitted for analysis', x: 0.76, y: 0.07 },
      { id: 'zeek', label: 'Zeek', detail: 'connection telemetry', x: 0.18, y: 0.28 },
      { id: 'sandbox', label: 'Playwright sandbox', detail: 'SSRF-guarded', x: 0.76, y: 0.28 },
      { id: 'bus', label: 'Redpanda', detail: 'Kafka-compatible bus', x: 0.18, y: 0.48 },
      { id: 'features', label: 'Feature extraction', detail: 'entropy, lexical, DOM', x: 0.76, y: 0.48 },
      { id: 'models', label: 'Detection', detail: 'XGBoost · Isolation Forest', x: 0.47, y: 0.68, accent: true },
      { id: 'evidence', label: 'Evidence Fabric', detail: 'detector version + input hash', x: 0.47, y: 0.85, accent: true },
      { id: 'case', label: 'Case', detail: 'entity graph · SOC view', x: 0.47, y: 0.98 },
    ],
    edges: [
      { from: 'traffic', to: 'zeek' },
      { from: 'content', to: 'sandbox' },
      { from: 'zeek', to: 'bus' },
      { from: 'sandbox', to: 'features' },
      { from: 'bus', to: 'models' },
      { from: 'features', to: 'models' },
      { from: 'models', to: 'evidence' },
      { from: 'evidence', to: 'case' },
    ],
  },

  ideaspace: {
    caption:
      'The graph is the product. Everything else exists to keep what enters it honest.',
    nodes: [
      { id: 'people', label: 'People', x: 0.16, y: 0.08 },
      { id: 'ideas', label: 'Ideas', x: 0.5, y: 0.08 },
      { id: 'projects', label: 'Projects', x: 0.84, y: 0.08 },
      { id: 'graph', label: 'Innovation graph', detail: 'the relationships, not a feed', x: 0.5, y: 0.34, accent: true },
      { id: 'health', label: 'Health score', detail: 'completeness, 0–100', x: 0.22, y: 0.58 },
      { id: 'proof', label: 'Proof', detail: 'GitHub evidence, reviewed', x: 0.78, y: 0.58, accent: true },
      { id: 'points', label: 'Points engine', detail: 'every event logged with a reason', x: 0.5, y: 0.8 },
      { id: 'surface', label: 'Leaderboard · Archive', x: 0.5, y: 0.97 },
    ],
    edges: [
      { from: 'people', to: 'graph' },
      { from: 'ideas', to: 'graph' },
      { from: 'projects', to: 'graph' },
      { from: 'graph', to: 'health' },
      { from: 'graph', to: 'proof' },
      { from: 'health', to: 'points' },
      { from: 'proof', to: 'points' },
      { from: 'points', to: 'surface' },
    ],
  },

  qyverix: {
    caption:
      'The build is the short part. Everything below the line is what makes it somebody’s job forever.',
    nodes: [
      { id: 'brief', label: 'Client brief', x: 0.5, y: 0.06 },
      { id: 'build', label: 'Build', detail: 'site · CMS · commerce', x: 0.5, y: 0.26 },
      { id: 'deploy', label: 'Deploy', detail: 'cloud, environments', x: 0.22, y: 0.5, accent: true },
      { id: 'domains', label: 'Domains & mail', detail: 'DNS, webmail', x: 0.78, y: 0.5 },
      { id: 'access', label: 'Access', detail: 'auth · RBAC · secrets', x: 0.5, y: 0.72, accent: true },
      { id: 'ops', label: 'Operations', detail: 'logging · backups · support', x: 0.5, y: 0.95, accent: true },
    ],
    edges: [
      { from: 'brief', to: 'build' },
      { from: 'build', to: 'deploy' },
      { from: 'build', to: 'domains' },
      { from: 'deploy', to: 'access' },
      { from: 'domains', to: 'access' },
      { from: 'access', to: 'ops' },
    ],
  },
} satisfies Record<string, SystemDiagramData>;

export type DiagramName = keyof typeof DIAGRAMS;
