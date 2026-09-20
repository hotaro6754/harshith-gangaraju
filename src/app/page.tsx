import { Nav } from '@/components/chrome/Nav';
import { Hero } from '@/components/hero/Hero';
import { Cursor } from '@/components/motion/Cursor';
import { RidgeConnector } from '@/components/motion/RidgeConnector';
import { Contact } from '@/components/sections/Contact';
import { Position } from '@/components/sections/Position';
import { Work } from '@/components/sections/Work';

export default function Home() {
  return (
    <>
      <Nav />
      <Cursor />

      <main id="top">
        <Hero />

        {/* Everything below the hero shares one continuous rail, so the page
            reads as a single descent rather than a hero with a website
            attached to the bottom of it. */}
        <div className="descent">
          <RidgeConnector />
          <Position />
          <Work />
          <Contact />
        </div>
      </main>
    </>
  );
}
