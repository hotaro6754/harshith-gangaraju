import { Hero } from '@/components/hero/Hero';

export const metadata = { title: 'Hero · Lab' };

/**
 * Phase 1 prototype. Isolated on purpose and linked from nowhere: the hero is
 * the riskiest thing in the whole design, so it gets judged on its own before
 * anything is built on top of it.
 */
export default function HeroLabPage() {
  return (
    <>
      <Hero />

      {/* Somewhere for the pin to hand off to, so the exit can be judged too. */}
      <section className="lab-outro">
        <p>
          The hero releases here. The nearest crest becomes the rule the work index
          sits on.
        </p>
      </section>
    </>
  );
}
