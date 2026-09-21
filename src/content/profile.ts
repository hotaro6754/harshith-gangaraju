/**
 * Who this is, in his own voice.
 *
 * Two rules for every string in this file. It has to survive a technical
 * interviewer asking "show me" — no seniority is implied that does not exist.
 * And it has to sound like a person rather than a profile: first person,
 * understated, occasionally funny, never "passionate about technology".
 */

export const PROFILE = {
  name: 'Harshith Gangaraju',
  short: 'Harshith',
  github: 'hotaro6754',
  email: 'cto@qyverix.in',
  /** Broad on purpose. Precise location is not portfolio content. */
  location: 'Visakhapatnam, Andhra Pradesh',
  /** The one-line position. Everything else on the site is evidence for it. */
  position:
    'I build software systems at the intersection of cybersecurity, AI and infrastructure.',
  links: [
    { label: 'GitHub', href: 'https://github.com/hotaro6754' },
    { label: 'Qyverix', href: 'https://qyverix.in' },
  ],
} as const;

export const EDUCATION = {
  institution: 'Lendi Institute of Engineering & Technology',
  degree: 'B.Tech, Computer Science (Cybersecurity)',
  graduation: '2029',
  year: 'Second year',
} as const;

/**
 * Roles where something would actually break if nobody did the work. Titles
 * on their own are not interesting.
 */
export const ROLES = [
  { title: 'CTO', org: 'Qyverix', note: 'Architecture, infrastructure, security, the 2 a.m. pages' },
  { title: 'Founder', org: 'InfoShare', note: 'Student technology community' },
  { title: 'Marketing Head', org: 'AI Club', note: 'Outreach reaching 200+ students' },
] as const;

/**
 * The ordering is the opinion. Performance and novelty sit at the bottom
 * deliberately — a fast, clever system that is wrong or unsafe is worse than
 * a slow, boring one that is neither.
 */
export const PRINCIPLES = [
  { rank: 'Correctness', note: 'It does the thing it claims to do.' },
  { rank: 'Security', note: 'It still does that when someone is trying to break it.' },
  { rank: 'Simplicity', note: 'The smallest design that survives the real problem.' },
  { rank: 'Maintainability', note: "I can open it in six months without dread." },
  { rank: 'UX', note: 'Simple on the surface, even when it is not underneath.' },
  { rank: 'Performance', note: 'Fast, once it is right.' },
  { rank: 'Experimentation', note: 'Last, and only when the rest holds.' },
] as const;

/**
 * Deliberately easy to edit. The point of this section is that it changes
 * often enough to prove the site is maintained rather than published once.
 */
export const CURRENTLY = {
  /** Set by hand whenever this block is edited. Shown on the page. */
  updated: 'September 2026',
  building: [
    { label: 'CYBER-OS', note: 'Correlating detections into one auditable case' },
    { label: 'Qyverix Cloud', note: 'The infrastructure layer I wanted to use myself' },
    { label: 'This site', note: 'The landscape is generated, not drawn' },
  ],
  learning: [
    { label: 'Data structures & algorithms', note: '' },
    { label: 'Operating systems', note: '' },
    { label: 'Networking', note: 'Past the point where the diagrams stop' },
    { label: 'Distributed systems', note: '' },
  ],
  exploring: [
    { label: 'Offensive security', note: 'Breaking the assumptions everyone else made' },
    { label: 'Detection engineering', note: 'Noise into one useful signal' },
    { label: 'AI on real systems', note: 'Code, traffic and identity. Not chat.' },
  ],
} as const;

/**
 * Used as pull quotes. Each one is his, and each one earns its place by being
 * an actual opinion rather than a slogan.
 */
export const QUOTES = {
  curiosity:
    "I don't just want to know how something works. I want to know why it works, what breaks it, and how I could build it better.",
  craft: 'Making something work is easy. Making it work properly is the hard part.',
  overbuilding:
    'Sometimes five services and three agents should have been one good function.',
  ownership: "Real systems don't care that you're still a student.",
  detection: 'Security engineering is mostly about everything around the model.',
  deployment: '"Works on my machine" stopped being a valid engineering strategy.',
} as const;

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
