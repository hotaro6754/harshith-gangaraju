/**
 * The three projects the portfolio is built on. Depth over count.
 *
 * Every fact here is verifiable from the live site or the repository it
 * describes. Nothing is estimated, rounded up, or inferred. Where a number
 * would be expected and does not exist — CYBER-OS publishes no benchmarks —
 * the absence is stated rather than filled in.
 */

/**
 * Depth is the site's navigation model: it maps a project onto the layer of
 * the stack it lives at, which is the same axis the landscape encodes.
 */
export type Depth = 'near' | 'mid' | 'far';

export const DEPTH_LABEL: Record<Depth, string> = {
  near: 'Operate',
  mid: 'Detect',
  far: 'Model',
};

/** Which range in the hero landscape a depth corresponds to. */
export const DEPTH_RANGE: Record<Depth, number> = {
  far: 0,
  mid: 2,
  near: 4,
};

export interface StackLayer {
  layer: string;
  tech: string[];
}

export interface ProjectLink {
  label: string;
  href: string;
  kind: 'repo' | 'live' | 'docs';
}

export interface Project {
  slug: string;
  name: string;
  /** Shown beside the name. Never inflated. */
  role: string;
  period: string;
  depth: Depth;
  /** One line. No adjectives that cannot be defended. */
  summary: string;
  /** The problem the system exists to solve, in the author's own terms. */
  premise: string;
  stack: StackLayer[];
  links: ProjectLink[];
  status: 'active' | 'archived';
}

export const PROJECTS: Project[] = [
  {
    slug: 'qyverix',
    name: 'Qyverix',
    role: 'CTO',
    period: '2026 —',
    depth: 'near',
    summary:
      'A web studio I am technically responsible for — the product, the infrastructure it runs on, and the operations around it.',
    premise:
      'Shipping client work on a deadline is an operations problem long before it is a coding problem. Domains, mail, authentication, roles, backups and logs all have to exist and keep existing, and someone has to own them.',
    stack: [
      { layer: 'Product', tech: ['Websites', 'CMS & admin panels', 'E-commerce', 'Automation'] },
      { layer: 'Infrastructure', tech: ['Cloud', 'Domains', 'Mail', 'Deployment'] },
      { layer: 'Access', tech: ['Authentication', 'RBAC', 'Environment management'] },
      { layer: 'Operations', tech: ['Logging', 'Backups', 'Support workflow'] },
    ],
    links: [{ label: 'qyverix.in', href: 'https://qyverix.in', kind: 'live' }],
    status: 'active',
  },
  {
    slug: 'cyber-os',
    name: 'CYBER-OS',
    role: 'Design & build',
    period: '2026 —',
    depth: 'mid',
    summary:
      'One detection and investigation system, not a verdict engine: it produces evidence a person can actually audit.',
    premise:
      'A classifier that says "malicious" and stops is not much use to whoever has to act on it. The harder problem is carrying provenance all the way through — which detector fired, on what input, at what version — and degrading honestly when a component is unavailable rather than inventing a result.',
    stack: [
      { layer: 'Detection', tech: ['Zeek', 'XGBoost', 'Isolation Forest', 'Entropy & regex heuristics'] },
      { layer: 'Pipeline', tech: ['Redpanda', 'FastAPI', 'Python 3.11'] },
      { layer: 'Investigation', tech: ['Playwright sandbox', 'Entity graph', 'Evidence Fabric'] },
      { layer: 'Storage', tech: ['MongoDB 7', 'Redis 7'] },
      { layer: 'Surface', tech: ['Next.js 14', 'Prometheus', 'Grafana'] },
    ],
    links: [
      { label: 'github.com/hotaro6754/CYBER-OS', href: 'https://github.com/hotaro6754/CYBER-OS', kind: 'repo' },
    ],
    status: 'active',
  },
  {
    slug: 'ideaspace',
    name: 'Ideaspace',
    role: 'Design & build',
    period: '2026 —',
    depth: 'far',
    summary:
      'A campus innovation platform built around proof: ideas are cheap, so the system scores evidence instead.',
    premise:
      'Student ideas live in group chats and are gone in a day, with nothing linking a claim to a thing that was actually built. The design problem is modelling people, ideas, projects and verified contribution as one graph, then making the scoring legible enough that nobody has to trust a black box.',
    stack: [
      { layer: 'Model', tech: ['Health Score', 'Points engine', 'Status pipeline'] },
      { layer: 'Proof', tech: ['GitHub verification', 'Timestamped entries', 'Faculty review'] },
      { layer: 'Platform', tech: ['Next.js 16', 'React 19', 'TypeScript strict'] },
      { layer: 'Data', tech: ['MongoDB Atlas', 'Postgres (ADR 0001)', 'Pusher'] },
    ],
    links: [
      { label: 'github.com/hotaro6754/Ideaspace', href: 'https://github.com/hotaro6754/Ideaspace', kind: 'repo' },
    ],
    status: 'active',
  },
];

/** Index order is the descent: far to near, model to operate. */
export const PROJECTS_BY_DEPTH: Project[] = ['far', 'mid', 'near']
  .map((d) => PROJECTS.find((p) => p.depth === d))
  .filter((p): p is Project => Boolean(p));
