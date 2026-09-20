import { execSync } from 'node:child_process';

import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

/**
 * Real build facts, resolved once at build time and inlined.
 *
 * The footer states these, so they have to be true. If git is unavailable —
 * a tarball build, a CI checkout without history — it says "unknown" rather
 * than inventing something, which is the same rule the case studies follow.
 */
function gitSha(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
}

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  env: {
    BUILD_SHA: gitSha(),
    BUILD_TIME: new Date().toISOString(),
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
