import { OG_SIZE, ogCard } from '@/lib/og';

export const alt = 'Harshith Gangaraju, CTO of Qyverix: software systems across cybersecurity, AI and infrastructure';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogCard({
    kicker: 'CTO · Qyverix',
    title: 'Harshith Gangaraju',
    line: 'I build systems. Then I try to find where they break.',
  });
}
