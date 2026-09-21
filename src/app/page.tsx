import { ViewTransition } from 'react';

import { Nav } from '@/components/chrome/Nav';
import { Hero } from '@/components/hero/Hero';
import { Cursor } from '@/components/motion/Cursor';
import { JsonLd } from '@/components/seo/JsonLd';
import { Contact } from '@/components/sections/Contact';
import { Currently } from '@/components/sections/Currently';
import { Manifesto } from '@/components/sections/Manifesto';
import { Position } from '@/components/sections/Position';
import { Practice } from '@/components/sections/Practice';
import { Work } from '@/components/sections/Work';
import { PROJECTS } from '@/content/projects';
import { PERSON_REF, SITE_DESCRIPTION, SITE_TITLE, SITE_URL, identityGraph } from '@/lib/site';

/** Direction of travel between the index and a case study. See globals.css. */
const DESCENT = { descend: 'descend', ascend: 'ascend', default: 'none' };

export default function Home() {
  return (
    <>
      <Nav />
      <Cursor />

      {/* Who this is, for search engines: the person (with the names people
          actually search: surname-first, handle), the company he is CTO of,
          and the work, each linked by @id so they read as one entity. */}
      <JsonLd
        data={{
          '@graph': [
            ...identityGraph(),
            {
              '@type': 'WebSite',
              '@id': `${SITE_URL}/#website`,
              url: SITE_URL,
              name: 'Harshith Gangaraju',
              publisher: PERSON_REF,
              inLanguage: 'en',
            },
            {
              '@type': 'ProfilePage',
              '@id': `${SITE_URL}/#profile`,
              url: SITE_URL,
              name: SITE_TITLE,
              description: SITE_DESCRIPTION,
              mainEntity: PERSON_REF,
              hasPart: PROJECTS.map((project) => ({
                '@type': 'TechArticle',
                headline: project.name,
                url: `${SITE_URL}/work/${project.slug}`,
                author: PERSON_REF,
              })),
            },
          ],
        }}
      />

      <ViewTransition enter={DESCENT} exit={DESCENT} default="none">
      <main id="top">
        <Hero />

        {/* Everything below the hero shares one continuous rail, so the page
            reads as a single descent rather than a hero with a website
            attached to the bottom of it. */}
        <div className="descent">
          <Manifesto />
          <Position />
          <Work />
          <Practice />
          <Currently />
          <Contact />
        </div>
      </main>
      </ViewTransition>
    </>
  );
}
