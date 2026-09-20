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
const components: MDXComponents = {
  Metric,
  Decision,
  SystemDiagram,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
