/**
 * Who this is, stated without inflation.
 *
 * The rule for every string in this file: it has to survive a technical
 * interviewer asking "show me". No seniority is implied that does not exist,
 * and what is still being learned is said plainly — which reads as more
 * credible than the alternative, not less.
 */

export const PROFILE = {
  name: 'Harshith Gangaraju',
  short: 'Harshith',
  github: 'hotaro6754',
  email: 'ceo@qyverix.in',
  location: 'Vizianagaram, Andhra Pradesh',
  /** The one-line position. Everything else on the site is evidence for it. */
  position:
    'I build software systems at the intersection of cybersecurity, AI and infrastructure.',
  links: [
    { label: 'GitHub', href: 'https://github.com/hotaro6754' },
    { label: 'Qyverix', href: 'https://qyverix.in' },
  ],
} as const;

/**
 * The stack diagram. Not a technology wall — each node is a layer, and the
 * edges are what the site is actually claiming: that these connect.
 */
export interface StackNode {
  id: string;
  label: string;
  /** Fraction of the diagram's width and height. */
  x: number;
  y: number;
  /** Emphasised nodes are the centre of the claim. */
  primary?: boolean;
}

export const STACK_NODES: StackNode[] = [
  { id: 'software', label: 'Software', x: 0.5, y: 0.1, primary: true },
  { id: 'security', label: 'Security', x: 0.16, y: 0.45, primary: true },
  { id: 'ai', label: 'AI', x: 0.5, y: 0.45, primary: true },
  { id: 'infra', label: 'Infrastructure', x: 0.84, y: 0.45, primary: true },
  { id: 'product', label: 'Product', x: 0.5, y: 0.78 },
  { id: 'interface', label: 'Interface', x: 0.5, y: 0.96 },
];

export const STACK_EDGES: Array<[string, string]> = [
  ['software', 'security'],
  ['software', 'ai'],
  ['software', 'infra'],
  ['security', 'product'],
  ['ai', 'product'],
  ['infra', 'product'],
  ['product', 'interface'],
];

/**
 * Capabilities bound to the system they were used in. Anything that cannot
 * be traced to something shipped does not appear here.
 */
export const CAPABILITIES = [
  {
    group: 'Operate',
    project: 'Qyverix',
    items: ['Cloud infrastructure', 'Deployment', 'RBAC', 'Domains & mail', 'Backups', 'Logging'],
  },
  {
    group: 'Detect',
    project: 'CYBER-OS',
    items: ['Zeek', 'Redpanda', 'XGBoost', 'Isolation Forest', 'Browser sandboxing', 'Evidence provenance'],
  },
  {
    group: 'Model',
    project: 'Ideaspace',
    items: ['Graph relationships', 'Scoring systems', 'Recommendation', 'Information architecture'],
  },
  {
    group: 'Build',
    project: 'All three',
    items: ['TypeScript', 'Python', 'FastAPI', 'Next.js', 'MongoDB', 'Redis', 'Docker'],
  },
] as const;

/**
 * Said out loud, on the site. An engineer who names the gaps is easier to
 * trust than one who implies there are none.
 */
export const LEARNING = [
  'Data structures & algorithms',
  'Operating systems',
  'Networking depth',
  'Distributed systems',
] as const;
