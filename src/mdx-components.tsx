import type { MDXComponents } from 'mdx/types';

import { Decision } from '@/components/case/Decision';
import { Metric } from '@/components/case/Metric';
import { SystemDiagram } from '@/components/case/SystemDiagram';

/**
 * Global MDX components.
 *
 * Required by `@next/mdx` with the App Router — it will not work without this
 * file. Note the signature: in this version `useMDXComponents` takes no
 * arguments, unlike older releases that were passed the inherited components.
 *
 * Everything a case study can use is registered here, so the MDX files stay
 * pure prose and never carry imports of their own.
 */
/** A chapter's anchor, from its own words: "What I would change" → what-i-would-change. */
function slug(children: React.ReactNode) {
  const text = typeof children === 'string' ? children : String(children ?? '');
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const components: MDXComponents = {
  // Chapters get ids so the sticky index can link and track them.
  h2: ({ children }) => <h2 id={slug(children)}>{children}</h2>,
  Metric,
  Decision,
  SystemDiagram,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
