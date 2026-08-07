# Audit Protocol — spec ↔ reference implementations

> **This file owns the audit**: why it exists, what it checks, and how a run converges.
> The workflow around it lives in [`CONTRIBUTING.md`](CONTRIBUTING.md); the gates in
> [`VALIDATION.md`](VALIDATION.md).

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

A specification's purpose is **convergence** — the test CONTRIBUTING.md opens with.
Nothing inside this repository can check it. The gates prove the spec is *internally*
consistent, and all of that stays true while the spec quietly stops describing anything
real.

An audit is the only check that closes the loop. It compares the contract against a
working implementation and asks, unit by unit, whether the two still say the same thing.
Where they disagree, one of them is wrong and the audit decides which; where they agree,
the contract has been shown to describe something buildable rather than merely
well-formed.

That is what makes an audited state worth building on. A transform author starting from
an unaudited spec is trusting prose that may have drifted arbitrarily far from every
implementation; starting from an audited one, they are trusting prose that was checked
against reality on a known date.

**Direction of truth (per finding, not global):**

- The spec is the agnostic source of truth for *intent* (variants, sizes, states,
  token roles, behavior).
- The implementation under audit is the source of truth for *what stable actually
  ships*.
- When they disagree, the audit does not silently pick a side. Each drift gets a
  verdict: the spec adopts the implementation's decision (**spec-stale**), or an issue
  is filed against the implementation (**impl-deviates**), or the call needs a human
  decision (**undecided**).

**Deciding which side is wrong.** Ask what a *second* implementation, built from the
contract alone, would do:

- If it would produce the implementation's behaviour, the contract is merely describing
  it badly → **spec-stale**.
- If it would produce something the implementation does not do, and the contract's
  version is what the system should be, the implementation has drifted →
  **impl-deviates**.
- If the contract does not determine the behaviour at all, the finding is not a drift but
  a **gap** — declare it rather than resolving it by copying whatever the implementation
  happens to do. Copying is how one platform's incidental decision becomes everyone's
  requirement.

The last case is the one most easily mistaken for the first. An implementation always has
*some* behaviour, so there is always something to copy, and copying always makes the
disagreement go away. That it resolves the finding is not evidence it was the right call.

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
  rows, and the automated gates green (`npm run validate`). This is the same condition
  CONTRIBUTING.md names as the bar for cutting a release, because it is the same
  question: has the contract been shown to describe something real? Tag the spec and
  record the implementation version audited against in the ledger header.
- **A finding left `undecided` blocks the baseline.** That is deliberate. An `undecided`
  is a place where the contract does not determine behaviour, so implementations built
  from it would diverge — precisely what a baseline is supposed to rule out. Resolving it
  by picking whichever answer is convenient defeats the run.
- **Re-entry trigger:** a new stable implementation release, or a merged spec change
  touching tokens or a contract. Start a **new ledger file** for the new run and
  re-audit only the affected units; prior ledgers are history, never overwritten.

## Binding a new technology

To audit an implementation on a technology the protocol has not covered before:

1. Create `audits/<technology>/<TECHNOLOGY>_AUDIT.md` in `flowin_pm`: map each of the
   five dimensions to concrete locations (component surface, theme construction, test
   suites) and list the platform-specific mechanisms dimension C must watch for.
2. Create the run's ledger from the unit list above, header recording spec version +
   implementation version.
3. Run the loop.
