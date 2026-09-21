'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

/**
 * The manifesto.
 *
 * Sits between the hero and the work because arriving straight at project
 * cards makes the site an index. This is the one place that says how he
 * thinks rather than what he shipped, and it is his own line — four beats,
 * each one a verb, ending where the work begins.
 *
 * Full-bleed and typographic on purpose. Every other section on this page is
 * a measured column of text; this one is deliberately not, because a page
 * where every section has the same shape reads as a template no matter how
 * good the individual sections are.
 */

const LINES = [
  { text: "Don't just use it.", indent: 0 },
  { text: 'Understand it.', indent: 1 },
  { text: 'Break it.', indent: 2 },
  { text: 'Then build it better.', indent: 1 },
];

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <section className="manifesto" ref={ref} aria-labelledby="manifesto-title">
      <h2 className="sr-only" id="manifesto-title">
        How I work
      </h2>

      <div className="manifesto-lines">
        {LINES.map((line, i) => (
          <motion.p
            key={line.text}
            className="manifesto-line"
            data-indent={line.indent}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ duration: 0.72, delay: i * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {line.text}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
