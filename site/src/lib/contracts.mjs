// Reads `design/components/*.md` and resolves the token references inside them.
//
// A contract's bindings table cites tokens by name (`{space.400}`), which is
// correct for the spec and unreadable for a designer reviewing whether a
// value is right. This resolves those citations so a page can show the name
// *and* what it currently evaluates to, without either being retyped.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolve } from './tokens.mjs';

const specRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const contractsDir = join(specRoot, 'design/components');

/** Contract slugs, excluding the template. */
export function slugs() {
  return readdirSync(contractsDir)
    .filter((f) => f.endsWith('.md') && f !== '_TEMPLATE.md')
    .map((f) => basename(f, '.md'))
    .sort();
}

/** Raw Markdown for one contract. */
export const source = (slug) =>
  readFileSync(join(contractsDir, `${slug}.md`), 'utf8');

/**
 * Every distinct `{token.path}` a contract cites, resolved.
 *
 * Unresolved references are returned rather than thrown on: Gate 2 already
 * fails the build for those, and a page that renders the problem is more use
 * than one that vanishes.
 */
export function citedTokens(slug) {
  const text = source(slug);
  const seen = new Map();
  for (const [, path] of text.matchAll(/\{([a-z][a-zA-Z0-9.]+)\}/g)) {
    if (seen.has(path)) continue;
    const { value, missing } = resolve(path);
    seen.set(path, { path, value, missing });
  }
  return [...seen.values()].sort((a, b) => a.path.localeCompare(b.path));
}

/** A contract's first prose paragraph, for use as a page description. */
export function intent(slug) {
  const text = source(slug);
  const section = text.split(/^## /m).find((s) => s.startsWith('Intent'));
  if (!section) return '';
  return section
    .split('\n')
    .slice(1)
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/[*`]/g, '')
    .trim();
}
