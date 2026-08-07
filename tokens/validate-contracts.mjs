#!/usr/bin/env node
// Gate 2 + Gate 4 (see VALIDATION.md), automated.
//
// Gate 2 — every {token.reference} cited in a component contract resolves to a
//          token that actually exists.
// Gate 4 — the DESIGN.md component index matches the contract files 1:1, every
//          contract carries the fixed template sections, and technology names
//          stay out of the normative sections.
//
// Dependency-free, mirroring validate.mjs. Exit 0 = clean, 1 = failures listed.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contractsDir = join(root, 'design/components');
const failures = [];

// --- collect every defined token path -------------------------------------
const tokenPaths = new Set();
const walkTokens = (node, path = '') => {
  if (node === null || typeof node !== 'object') return;
  if ('$value' in node) tokenPaths.add(path);
  for (const [k, v] of Object.entries(node)) {
    if (!k.startsWith('$')) walkTokens(v, path ? `${path}.${k}` : k);
  }
};
const walkTokenFiles = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkTokenFiles(full);
    else if (entry.name.endsWith('.tokens.json')) {
      walkTokens(JSON.parse(readFileSync(full, 'utf8')));
    }
  }
};
walkTokenFiles(join(root, 'tokens'));

// --- the fixed contract template ------------------------------------------
const REQUIRED_SECTIONS = [
  'Intent',
  'Anatomy',
  'Variants',
  'Sizes',
  'States',
  'Token bindings',
  'Behavioral notes',
  'Theming directive',
  'Known gaps',
];

// Sections where a technology name is a layering violation. Transform notes and
// the illustrative Anatomy aside are the sanctioned places for them.
const NORMATIVE_SECTIONS = [
  'Intent',
  'Variants',
  'Sizes',
  'States',
  'Token bindings',
  'Theming directive',
  'Known gaps',
];

// Platform-specific names that must not appear in a normative section. These are
// the Material role names the spec deliberately neutralized (DESIGN.md §2) plus
// the framework itself.
const TECH_NAMES = [
  'secondaryContainer',
  'onSecondaryContainer',
  'outlineVariant',
  'iOSSmooth',
  'Flutter',
  'Material',
  'ColorScheme',
  'TextTheme',
  'ThemeExtension',
  'Widget',
];

const contractFiles = readdirSync(contractsDir)
  .filter((f) => f.endsWith('.md') && f !== '_TEMPLATE.md')
  .sort();

let refCount = 0;

for (const file of contractFiles) {
  const text = readFileSync(join(contractsDir, file), 'utf8');

  // Gate 2 — token references resolve.
  for (const m of text.matchAll(/\{([a-z][a-zA-Z0-9.]+)\}/g)) {
    refCount += 1;
    if (!tokenPaths.has(m[1])) {
      failures.push(`${file}: unresolved token reference {${m[1]}}`);
    }
  }

  // Gate 4a — required template sections are present.
  const headings = [...text.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]);
  for (const required of REQUIRED_SECTIONS) {
    if (!headings.some((h) => h.startsWith(required))) {
      failures.push(`${file}: missing required section "## ${required}"`);
    }
  }

  // Gate 4b — agnostic-layer purity in normative sections.
  const lines = text.split('\n');
  let current = null;
  lines.forEach((line, i) => {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      current = NORMATIVE_SECTIONS.find((s) => heading[1].startsWith(s)) ?? null;
      return;
    }
    if (!current) return;
    for (const tech of TECH_NAMES) {
      if (line.includes(tech)) {
        failures.push(
          `${file}:${i + 1}: technology name "${tech}" in normative section ` +
            `"${current}" — move it to Transform notes`,
        );
      }
    }
  });
}

// Gate 4c — the DESIGN.md index matches the files on disk, 1:1.
const design = readFileSync(join(root, 'DESIGN.md'), 'utf8');
const indexed = new Set(
  [...design.matchAll(/design\/components\/([a-z-]+)\.md/g)].map((m) => m[1]),
);
const onDisk = new Set(contractFiles.map((f) => basename(f, '.md')));
for (const name of onDisk) {
  if (!indexed.has(name)) {
    failures.push(`DESIGN.md: component index is missing a row for "${name}"`);
  }
}
for (const name of indexed) {
  if (!onDisk.has(name)) {
    failures.push(`DESIGN.md: index links "${name}" but no contract file exists`);
  }
}

if (failures.length > 0) {
  console.error(`✗ ${failures.length} failure(s):\n`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

console.log(
  `✓ ${contractFiles.length} contracts: ${refCount} token references resolve, ` +
    `template sections present, index matches files, no technology names in ` +
    `normative sections.`,
);
