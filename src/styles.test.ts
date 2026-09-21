import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Every class a component uses must exist in a stylesheet.
 *
 * This exists because it happened twice: an edit to globals.css that
 * replaced "everything between these two section markers" silently deleted
 * whole unrelated sections that happened to sit in between — the depth
 * markers once, then the case studies, lab, footer and diagram styles. Both
 * times the build passed, the types passed and every other test passed,
 * because nothing checks that a className actually has styles behind it.
 * Unstyled SVG text defaults to a black fill, which is how the diagram
 * labels became invisible on a dark page without anything failing.
 */

const SRC = join(process.cwd(), 'src');

function walk(dir: string, match: (file: string) => boolean, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, match, out);
    else if (match(path)) out.push(path);
  }
  return out;
}

const css = walk(SRC, (f) => f.endsWith('.css'))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');

/** Classes that are deliberately unstyled hooks or come from elsewhere. */
const ALLOWED_UNSTYLED = new Set<string>([
  // Hooks read by scripts rather than styled.
  'range',
  'hero-band',
  'kinetic',
  'converge',
  'section-position',
  'section-practice',
  'section-currently',
  'case',
  'case-head',
  'case-links',
  'lab-entry-main',
  'lab-entry-tech',
  'currently-column',
  'diagram-edges',
  'diagram-nodes',
  'stack-edges',
  'stack-nodes',
  'position-claim',
  'practice-side',
  'env-layer',
  'nav-home',
  'hero-cta-label',
  'project-copy',
  'now-object',
  'ledger-group',
  'roles-block',
]);

function usedClasses(): Map<string, string> {
  const used = new Map<string, string>();
  const files = walk(SRC, (f) => /\.(tsx|mdx)$/.test(f) && !f.endsWith('.test.tsx'));

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const patterns = [
      /className="([^"]+)"/g,
      /className=\{`([^`]+)`\}/g,
      /className=\{\[([^\]]+)\]/g,
    ];
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        // Drop template expressions and quote noise; keep literal tokens.
        const literal = match[1].replace(/\$\{[^}]*\}/g, ' ').replace(/['",]/g, ' ');
        for (const token of literal.split(/\s+/)) {
          if (/^[a-z][a-z0-9-]*[a-z0-9]$/.test(token)) used.set(token, file.replace(SRC, 'src'));
        }
      }
    }
  }
  return used;
}

describe('stylesheet coverage', () => {
  it('has a rule for every class used in a component', () => {
    const missing = [...usedClasses()]
      .filter(([cls]) => !ALLOWED_UNSTYLED.has(cls))
      .filter(([cls]) => !new RegExp(`\\.${cls}(?![a-z0-9-])`).test(css))
      .map(([cls, file]) => `.${cls}  (${file})`);

    expect(missing, `Classes with no CSS rule:\n${missing.join('\n')}`).toEqual([]);
  });
});
