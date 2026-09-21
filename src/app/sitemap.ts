import type { MetadataRoute } from 'next';

import { PROJECTS } from '@/content/projects';
import { SITE_URL } from '@/lib/site';

/** Only the pages meant to be found. The lab's reference sheets are not listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    ...PROJECTS.map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/lab`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
