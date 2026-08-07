# Validation

How the `flowin_design_system` spec is kept correct. There are **four gates**: three
automated, one manual. Run the automated gates on every change; perform the manual gate
when a transform target is built or reviewed against the spec.

```sh
node tokens/validate.mjs && node tokens/validate-contracts.mjs
```

Gate 1 is the first script; Gates 2 and 4 are the second. Gate 3 is manual by nature — it
asserts a property of an *implementation*, not of the spec.

A gate checks an **externally observable property** of the spec (does a token resolve? does
a cited reference exist?) — never an authoring style choice.

---

## Gate 1 — Token resolution (AUTOMATED)

**What it checks:** every `*.tokens.json` parses as valid DTCG and every alias reference
`{a.b.c}` resolves to a real token, with no dangling or circular references. This is the
highest-value gate: a broken reference would silently corrupt every downstream transform.

**How to run:**

```sh
node tokens/validate.mjs
```

Exit `0` = all aliases resolve (prints the token + file count). Exit `1` = failure, with
each dangling/circular reference listed. The script is dependency-free and walks every
`*.tokens.json` under `tokens/` recursively.

**When:** on every change to `tokens/**`. Treat a non-zero exit as a blocking failure.

---

## Gate 2 — Cross-reference integrity (AUTOMATED)

**What it checks:** every token reference cited in a component contract
(`design/components/<name>.md`) exists in the token set. A contract that binds a property
to `{color.surfaceSecondary}` is only valid if that token is defined.

**How to perform:**

1. Collect every `{…}` reference in a contract's **Token bindings** table (and prose):
   `{color.*}`, `{space.*}`, `{radius.*}`, `{size.*}`, `{typography.*}`, `{shadow.*}`.
2. Confirm each key exists in the corresponding `tokens/**` file.

A quick scan that surfaces the references to check:

```sh
grep -ohE '\{[a-z][a-zA-Z0-9.]+\}' design/components/*.md | sort -u
```

Cross-check each against the token files (or, once Gate 1 is extended to parse contracts,
this becomes automated — see *Planned automation*).

**Common failure:** a contract uses a superseded role name (e.g. the pre-neutralization
`secondaryContainer` instead of `surfaceSecondary`, or `iOSSmooth` instead of
`cornerSmoothing`). The neutralized names are authoritative — see DESIGN.md §2.

**When:** when authoring or reviewing a component contract.

---

## Gate 3 — Conformance against the reference (MANUAL)

**What it checks:** the documented token bindings can be expressed as the reference
implementation's global theme slots, and **every binding is globally overridable, not
per-instance**. This operationalizes the theme-first thesis (DESIGN.md §1, §3) as a
checkable property rather than a vibe.

**How to perform:** for a given component, the reference implementation should carry a
**theme-only-styling test** — override the relevant theme slot, render the component, and
assert the rendered result reflects the override (proving the binding lives in the theme,
not hardcoded in the component). If a documented binding cannot be overridden at the theme
level, the implementation is not conformant (or the contract's *Theming directive* is
wrong about what is global vs per-call).

**The contract is the source of truth:** the *Token bindings* table says which property
binds to which token; the *Theming directive* says which bindings are global (theme) vs
per-call. A conformant transform installs the global ones on the platform's global theming
mechanism. See each contract's **Transform notes** for the reference theme-slot names.

**When:** when a transform target is built or reviewed against the spec.

---

## Gate 4 — Structural lint (MANUAL)

**What it checks:** every component contract follows the fixed template, and the spec's
indexes match the files present.

**Checklist:**

- Each `design/components/<name>.md` contains the fixed template sections (see
  `design/components/_TEMPLATE.md`): Intent · Anatomy · Variants · Sizes · States ·
  Token bindings · Behavioral notes · Theming directive · Known gaps / planned fix ·
  Transform notes. A section may be marked *n/a*, but the heading must be present.
- DESIGN.md §4 (Component index) has exactly one row per `design/components/*.md` file
  (excluding `_TEMPLATE.md`) — no orphans, no missing rows.
- Agnostic-layer purity (see DESIGN.md §2 and the spec's layering rule): `tokens/**`
  contains zero technology names; in contracts, a specific technology is named only in
  *Transform notes* and a clearly-marked illustrative *Anatomy* aside — never in Intent /
  Variants / Sizes / States / Token bindings / Theming directive / Known gaps.

A scan that surfaces index-vs-file drift:

```sh
# component files
ls design/components/*.md | grep -v _TEMPLATE | xargs -n1 basename | sed 's/.md//' | sort
# index links in DESIGN.md
grep -oE 'design/components/[a-z-]+\.md' DESIGN.md | sort -u
```

The two lists should match one-to-one.

**When:** when adding or reviewing a component contract.

---

## Planned automation

v1 automates only Gate 1. Gates 2–4 are candidates for automation (a contract-aware
linter that resolves `{…}` references against the token set, checks template-section
presence, and diffs the index against the filesystem). Tracked in the
[`flowin_pm`](https://github.com/luisburgos/flowin_pm) backlog.
