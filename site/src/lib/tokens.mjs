// Reads the spec's DTCG token files and resolves them for rendering.
//
// The site never restates a token value. Everything on a token page is derived
// here at build time from `tokens/**`, so a page cannot drift from the spec —
// it can only fail to build. That is deliberate: a hand-written swatch table
// would be a second source of truth for values the spec already owns.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const specRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const tokensRoot = join(specRoot, 'tokens');

/** Every `*.tokens.json` under `tokens/`, deepest-first for stable ordering. */
function tokenFiles(dir = tokensRoot, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) tokenFiles(full, found);
    else if (entry.name.endsWith('.tokens.json')) found.push(full);
  }
  return found;
}

/**
 * Flattens every token file into one map of `dotted.path` → token node.
 *
 * Files are merged rather than kept separate because an alias may cross files
 * (a semantic role in one file pointing at a primitive ramp in another), and
 * resolution has to see all of them at once.
 */
function loadAll() {
  const flat = new Map();
  const origin = new Map();

  const walk = (node, path, file) => {
    if (node === null || typeof node !== 'object') return;
    if ('$value' in node) {
      flat.set(path, node);
      origin.set(path, relative(specRoot, file));
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (!key.startsWith('$')) walk(child, path ? `${path}.${key}` : key, file);
    }
  };

  for (const file of tokenFiles()) {
    walk(JSON.parse(readFileSync(file, 'utf8')), '', file);
  }
  return { flat, origin };
}

const { flat, origin } = loadAll();

/**
 * Follows `{alias.chain}` references to a literal value.
 *
 * Returns the resolved value plus the chain that produced it, because the chain
 * is the interesting part for a reviewer: seeing that three brand roles all
 * terminate in the same neutral ramp step is what makes the missing chromatic
 * accent obvious at a glance.
 */
export function resolve(path, seen = []) {
  const node = flat.get(path);
  if (!node) return { value: undefined, chain: seen, missing: true };

  const raw = node.$value;
  if (typeof raw === 'string') {
    const alias = raw.match(/^\{([^}]+)\}$/);
    if (alias) {
      if (seen.includes(alias[1])) {
        return { value: undefined, chain: [...seen, alias[1]], circular: true };
      }
      return resolve(alias[1], [...seen, path]);
    }
  }
  return { value: raw, chain: [...seen, path], node };
}

/** A token's own `$description`, if it carries one. */
export const describe = (path) => flat.get(path)?.$description;

/**
 * Tokens under `prefix`, resolved, in declaration order.
 *
 * Each entry carries its raw `$value` as well as the resolved one so a page can
 * show both — "this role aliases that ramp step, which is this colour" — rather
 * than flattening the indirection the two-tier model exists to express.
 */
export function group(prefix) {
  const out = [];
  for (const [path, node] of flat) {
    if (!path.startsWith(`${prefix}.`)) continue;
    const { value, chain, missing } = resolve(path);
    out.push({
      path,
      name: path.slice(prefix.length + 1),
      raw: node.$value,
      value,
      chain,
      missing,
      description: node.$description,
      file: origin.get(path),
      aliased: typeof node.$value === 'string' && /^\{[^}]+\}$/.test(node.$value),
    });
  }
  return out;
}

/** A dimension token's px number, for rendering a to-scale bar. */
export function px(token) {
  const v = token.value;
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object' && 'value' in v) return v.value;
  return undefined;
}

/** Groups that share a resolved value — the tell for a placeholder palette. */
export function collisions(tokens) {
  const byValue = new Map();
  for (const t of tokens) {
    if (typeof t.value !== 'string') continue;
    const key = t.value.toLowerCase();
    byValue.set(key, [...(byValue.get(key) ?? []), t.name]);
  }
  return [...byValue.entries()].filter(([, names]) => names.length > 1);
}
