import { Nav } from '@/components/chrome/Nav';
import { Hero } from '@/components/hero/Hero';
import { Cursor } from '@/components/motion/Cursor';
import { Contact } from '@/components/sections/Contact';
import { Currently } from '@/components/sections/Currently';
import { Manifesto } from '@/components/sections/Manifesto';
import { Position } from '@/components/sections/Position';
import { Practice } from '@/components/sections/Practice';
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
          <Manifesto />
          <Position />
          <Work />
          <Practice />
          <Currently />
          <Contact />
        </div>
      </main>
    </>
  );
}
