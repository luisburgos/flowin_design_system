# Audit Protocol — spec ↔ reference implementations

> **Status: active. Technology-agnostic.** This file defines the reusable audit protocol
> for converging this spec with any SDK that implements it. It complements
> `VALIDATION.md`: validation gates check the spec's internal correctness; the audit
> protocol checks the spec against an implementation, unit by unit, until every unit is
> verdicted.
>
> This file contains **no technology names and no repository paths**. Each SDK binds the
> protocol in its own audit binding document, and each audit run keeps its state in a
> ledger. Both live in the `flowin_pm` repository under `audits/<technology>/` — the
> binding (`<TECHNOLOGY>_AUDIT.md`) plus one ledger file per run, so audit history is
> preserved across versions.

## Why this protocol exists

The spec must reflect the latest decisions of whatever reference implementation has
reached stability, so that (a) team members can iterate on the spec with confidence, and
(b) new transforms (a React SDK, any future UI kit) can be built from the spec alone.
An audit run converges the spec and one implementation onto a trusted baseline; after
that, changes flow through the normal issue-driven process instead of ad-hoc drift.

**Direction of truth (per finding, not global):**

- The spec is the agnostic source of truth for *intent* (variants, sizes, states,
  token roles, behavior).
- The implementation under audit is the source of truth for *what stable actually
  ships*.
- When they disagree, the audit does not silently pick a side. Each drift gets a
  verdict: the spec adopts the implementation's decision (**spec-stale**), or an issue
  is filed against the implementation (**impl-deviates**), or the call needs a human
  decision (**undecided**).

## Audit units

One iteration of the loop audits exactly one unit. Units, in audit order:

1. **Cross-cutting: tokens.** The spec's primitive + semantic token set vs the
   implementation's token/foundation layer. Every token value and role key, both
   directions.
2. **Cross-cutting: theme binding.** DESIGN.md §3 mechanism mapping + role-name mapping
   vs the implementation's global theme construction. Every theme slot the
   implementation installs must be traceable to a contract's Theming directive, and
   vice versa.
3. **Cross-cutting: typography rules.** DESIGN.md §4 conversion rule (letterSpacing px,
   lineHeight ratio) vs the implementation's type scale.
4. **Each component**, one per iteration, in DESIGN.md §4 index order.

**A spec component with no dedicated implementation widget is not automatically a
gap.** The theme-first thesis says a themed native widget *is* the component. The audit
checks the *binding*, not the existence of a wrapper.

## Per-unit checklist (the five dimensions)

For a component unit, compare `design/components/<name>.md` against the
implementation's component surface, its theme slot, and its tests (the binding document
says where those live).

**A. API parity (1:1 surface).**
- Every Variant / Size row in the spec exists in the implementation's public API, and
  every public variant / size / parameter in the implementation is either in the spec
  or explicitly Transform-notes-only.
- Behavioral notes match actual behavior (e.g. absent-callback disables, content
  precedence rules).
- Defaults match (default variant, default size).

**B. Token fidelity (values).**
- Every Token bindings row resolves (Gate 2) *and* the implementation's value equals
  the token's value (dimensions, color values, radii, type styles).
- Implementation constants with no corresponding spec token are flagged (leak or
  missing token).

**C. Platform-specific considerations.**
- Everything platform-specific in the implementation (native state visuals, rendering
  mechanisms, layout geometry artifacts, gesture/scroll behavior) is captured in the
  contract's **Transform notes** — precisely enough that a transform on a *different*
  technology knows what is normative intent vs platform mechanism.
- Technology names appear **only** in Transform notes / illustrative Anatomy (Gate 4
  purity rule).
- Anything the spec states as normative that is actually a platform artifact gets
  reclassified.

**D. Conformance (Gate 3).**
- A theme-only-styling test exists for each global binding in the Theming directive:
  override the theme slot, render the component unchanged, assert the override.
  Missing test → `conformance` finding.

**E. Structural (Gates 2 + 4).**
- Contract has all template sections; index row exists; token references resolve; no
  stale role names (pre-neutralization names are drift).

For the cross-cutting units, apply B, C, and E to the token/theme/typography artifacts.

## Verdicts and findings

Each unit ends with exactly one verdict in the run's ledger:

| Verdict | Meaning | Action |
|---|---|---|
| `in-sync` | All five dimensions pass. | Ledger only. |
| `spec-stale` | Implementation decision is right; spec lags. | Update the contract in the same iteration, then re-verdict `in-sync`. |
| `impl-deviates` | Spec intent is right; implementation drifts. | File a `flowin_pm` issue, link it in the contract's Known gaps. Verdict stays until fixed. |
| `undecided` | Direction of truth unclear. | File a `flowin_pm` issue with `needs-decision`. |

**Issue convention (`flowin_pm`):** title `fix:`/`chore:` per the ticketing standard;
domain label `fidelity` (B), `api-parity` (A), `conformance` (C/D), `needs-spec`
(missing contract coverage), plus `needs-decision` when undecided. One issue per
finding, not per unit. Every non-`in-sync` ledger row must link at least one issue or
one spec commit.

## Loop mechanics

- **One unit per iteration.** Finish the checklist, record the verdict, update the
  run's ledger, commit spec edits (if any) with `docs(audit): <unit> — <verdict>`.
- **Order:** cross-cutting units first (they are load-bearing for every component),
  then components in index order. A component audit that hits an unresolved
  cross-cutting question pauses and escalates rather than guessing.
- **Stop condition (baseline reached):** every ledger row verdicted, zero `undecided`
  rows, and Gate 1 (`node tokens/validate.mjs`) green. Tag the spec and record the
  implementation version audited against in the ledger header.
- **Re-entry trigger:** a new stable implementation release, or a merged spec change
  touching tokens or a contract. Start a **new ledger file** for the new run and
  re-audit only the affected units; prior ledgers are history, never overwritten.

## Binding a new technology

To audit a new SDK (e.g. a React UI kit):

1. Create `audits/<technology>/<TECHNOLOGY>_AUDIT.md` in `flowin_pm`: map each of the
   five dimensions to concrete locations (component surface, theme construction, test
   suites) and list the platform-specific mechanisms dimension C must watch for.
2. Create the run's ledger from the unit list above, header recording spec version +
   implementation version.
3. Run the loop.
