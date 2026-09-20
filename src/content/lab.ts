/**
 * The workshop.
 *
 * Deliberately thin on description. Most of these repositories carry no
 * README worth quoting, and writing marketing copy for them here would be
 * inventing a claim the repository itself does not make — which is the one
 * thing this site does not do. Where the author's own words exist, they are
 * used verbatim. Where they do not, the entry says what it is built in and
 * links to the code, and lets the reader decide.
 */

export interface Experiment {
  name: string;
  /** Verified from the repository. */
  tech: string;
  /** Only where it can be sourced. Left out rather than guessed. */
  note?: string;
  href: string;
  live?: { label: string; href: string };
  year?: string;
}

export const EXPERIMENTS: Experiment[] = [
  {
    name: 'Environment reference sheet',
    tech: 'Generated SVG',
    note: 'Six atmospheric states this site can render, and the parameters behind each one. The landscape here is generated, not drawn.',
    href: '/lab/scenes',
    year: '2026',
  },
  {
    name: '3D',
    tech: 'React · Vite · TypeScript',
    note: 'An interactive scene — walking up to a door and through it.',
    href: 'https://github.com/hotaro6754/3D',
    live: { label: 'sahithi-district.vercel.app', href: 'https://sahithi-district.vercel.app' },
  },
  {
    name: 'OffSec-AI-Mentor',
    tech: 'JavaScript',
    note: 'Preparation tooling for offensive security certification.',
    href: 'https://github.com/hotaro6754/OffSec-AI-Mentor',
  },
  {
    name: 'ZeroSlop',
    tech: 'HTML',
    href: 'https://github.com/hotaro6754/ZeroSlop',
  },
  {
    name: 'Kali-Guru-CLI',
    tech: 'Python',
    href: 'https://github.com/hotaro6754/Kali-Guru-CLI',
  },
  {
    name: 'Medical-Report-Simplifier-AI',
    tech: 'TypeScript',
    href: 'https://github.com/hotaro6754/Medical-Report-Simplifier-AI',
  },
  {
    name: 'Phising-project',
    tech: 'TypeScript',
    // The repository's own description, verbatim. It stays because it is
    // true and because a portfolio that only shows the good parts is less
    // convincing than one that shows the starting line.
    note: '"This is my first project."',
    href: 'https://github.com/hotaro6754/Phising-project',
  },
  {
    name: 'Portfolio',
    tech: 'HTML · Canvas',
    note: 'The previous version of this site. Kept because replacing it was the point.',
    href: 'https://github.com/hotaro6754/Portfolio',
    live: { label: 'hotaro6754.github.io/Portfolio', href: 'https://hotaro6754.github.io/Portfolio/' },
  },
];

export const LAB_INTRO =
  'Things I built to find out something specific. Most are unfinished on purpose — once the question is answered the repository usually stops being interesting, and pretending otherwise would be dishonest.';
