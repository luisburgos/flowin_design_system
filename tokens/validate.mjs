#!/usr/bin/env node
// DTCG token resolution gate (dependency-free).
//
// Loads every *.tokens.json under tokens/, flattens to leaf tokens, and verifies
// that every alias reference `{a.b.c}` resolves to a real token — failing on
// dangling or circular references. This is the v1 automated validation gate
// (cross-reference integrity and conformance remain documented manual gates).
//
// Usage: node tokens/validate.mjs   (exit 0 = all aliases resolve, 1 = failure)

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const tokensDir = dirname(fileURLToPath(import.meta.url));

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.tokens.json')) out.push(p);
  }
  return out;
}

// Flatten a DTCG tree into { "a.b.c": value } for every token (a node with $value).
function flatten(node, path, acc) {
  if (node && typeof node === 'object' && '$value' in node) {
    acc[path.join('.')] = node.$value;
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      flatten(v, [...path, k], acc);
    }
  }
}

const files = walk(tokensDir);
const tokens = {};
for (const f of files) {
  let json;
  try {
    json = JSON.parse(readFileSync(f, 'utf8'));
  } catch (e) {
    console.error(`✗ ${f}: invalid JSON — ${e.message}`);
    process.exit(1);
  }
  flatten(json, [], tokens);
}

const ALIAS = /^\{([^}]+)\}$/;
const aliasRef = (v) => {
  if (typeof v === 'string') {
    const m = v.match(ALIAS);
    return m ? [m[1]] : [];
  }
  // composite tokens: collect alias refs from string fields
  if (v && typeof v === 'object') {
    return Object.values(v).flatMap(aliasRef);
  }
  return [];
};

// Resolve with cycle detection.
function resolve(key, seen, errors) {
  if (!(key in tokens)) {
    errors.push(`dangling reference: {${key}} does not exist`);
    return;
  }
  if (seen.has(key)) {
    errors.push(`circular reference: ${[...seen, key].join(' → ')}`);
    return;
  }
  const refs = aliasRef(tokens[key]);
  for (const r of refs) resolve(r, new Set([...seen, key]), errors);
}

const errors = [];
for (const key of Object.keys(tokens)) {
  for (const r of aliasRef(tokens[key])) resolve(r, new Set([key]), errors);
}

if (errors.length) {
  console.error(`✗ token resolution failed (${errors.length}):`);
  for (const e of [...new Set(errors)]) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `✓ ${Object.keys(tokens).length} tokens across ${files.length} files; all aliases resolve.`
);
