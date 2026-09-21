import { Cursor } from '@/components/motion/Cursor';
import { Contact } from '@/components/sections/Contact';
import { Currently } from '@/components/sections/Currently';
import { Manifesto } from '@/components/sections/Manifesto';
import { Position } from '@/components/sections/Position';
import { Practice } from '@/components/sections/Practice';
import { Work } from '@/components/sections/Work';

export const metadata = { title: 'Sections · Lab', robots: { index: false, follow: false } };

/**
 * The descent without the hero above it.
 *
 * Useful on its own — the sections have to hold up as a document, not just as
 * a payoff to a scroll sequence — and it makes each one reachable without
 * driving through a pinned timeline to get there.
 */
export default function SectionsLabPage() {
  return (
    <>
      <Cursor />
      <main className="descent">
        <Manifesto />
        <Position />
        <Work />
        <Practice />
        <Currently />
        <Contact />
      </main>
    </>
  );
}
