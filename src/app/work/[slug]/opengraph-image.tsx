import { PROJECTS, PROJECT_BY_SLUG } from '@/content/projects';
import { OG_SIZE, ogCard } from '@/lib/og';

export const alt = 'A case study by Harshith Gangaraju';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECT_BY_SLUG[slug];

  return ogCard({
    kicker: 'Case study · Harshith Gangaraju',
    title: project?.name ?? 'Case study',
    line: project?.summary ?? '',
  });
}
