import { EDUCATION, PROFILE } from '@/content/profile';

/**
 * Who this site is about, stated once for every machine that reads it:
 * page metadata, Open Graph cards, the sitemap and the structured data.
 *
 * The canonical origin comes from the environment so the domain decision
 * can change without a code change. Until it is set, it defaults to the
 * recommended home (see README): a subdomain of the company he is CTO of.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://harshith.qyverix.in').replace(
  /\/$/,
  '',
);

export const COMPANY = {
  name: 'Qyverix',
  url: 'https://qyverix.in',
} as const;

export const ROLE = 'CTO';

/** How people actually search for him: surname-first (common in Andhra Pradesh), and his two handles (GitHub hotaro6754, email harshith6754). */
export const ALTERNATE_NAMES = ['Gangaraju Harshith', 'Harshith', 'hotaro6754', 'harshith6754'] as const;

/** 50-60 characters: long enough to say what he does, short enough not to be cut. */
export const SITE_TITLE = `${PROFILE.name}, ${ROLE} of ${COMPANY.name} · Cybersecurity & AI`;

/** Under 160 characters so Google shows it whole. */
export const SITE_DESCRIPTION = `${PROFILE.name}, ${ROLE} of ${COMPANY.name}, builds software across cybersecurity, AI and infrastructure. Case studies: CYBER-OS, Ideaspace, Qyverix.`;

export const KNOWS_ABOUT = [
  'Cybersecurity',
  'Detection engineering',
  'Machine learning',
  'Cloud infrastructure',
  'Software architecture',
  'Next.js',
  'Python',
  'FastAPI',
] as const;

const PERSON_ID = `${SITE_URL}/#person`;
const ORG_ID = `${SITE_URL}/#qyverix`;

/** The person and the company, as schema.org entities other pages can reference by @id. */
export function identityGraph() {
  return [
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: PROFILE.name,
      alternateName: [...ALTERNATE_NAMES],
      givenName: 'Harshith',
      familyName: 'Gangaraju',
      url: SITE_URL,
      email: `mailto:${PROFILE.email}`,
      contactPoint: [
        { '@type': 'ContactPoint', contactType: 'work', email: PROFILE.email },
        { '@type': 'ContactPoint', contactType: 'personal', email: PROFILE.emailPersonal },
      ],
      jobTitle: 'Chief Technology Officer',
      worksFor: { '@id': ORG_ID },
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: EDUCATION.institution,
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Visakhapatnam',
        addressRegion: 'Andhra Pradesh',
        addressCountry: 'IN',
      },
      knowsAbout: [...KNOWS_ABOUT],
      sameAs: PROFILE.links.filter((l) => !l.href.includes('qyverix.in')).map((l) => l.href),
    },
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: COMPANY.name,
      url: COMPANY.url,
      employee: { '@id': PERSON_ID },
    },
  ];
}

/** When this build was made: the honest 'last updated' for every page it serves. */
export const BUILT_AT = new Date().toISOString();

export const PERSON_REF = { '@id': PERSON_ID } as const;
