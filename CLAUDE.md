# flowin_design_system — agent notes

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first. It is written for everyone and covers the
validation gates, how to change a contract, when a release is warranted, and how to cut
one. This file is only the things an agent gets wrong that a human would not.

## This repository specifies; it does not implement

There is no runtime here. A change is "done" when the contract is unambiguous to someone
implementing it on a platform you cannot see, not when something passes.

That inverts the usual instinct. Reaching for the reference implementation to settle a
question is right for *fidelity* (does the spec match what ships?) and wrong for *intent*
(what should the contract say?). An implementation detail promoted into a normative
section quietly makes every other platform non-conformant.

## Do not hand-edit generated or authoritative-elsewhere files

- **`CHANGELOG.md`** is generated. Edits survive exactly until the next
  `npm run changelog`. Anything a reader needs belongs in a commit message.
- **Gaps** belong in `DESIGN.md` §5, with an issue in `flowin_pm`. Restating them in the
  changelog or the README creates copies that drift.

## Verify before asserting

The failure mode here is confident narration of unverified state. Run the gates and read
the output; do not report a push, a tag, or a passing check that you have not observed.

Two specific traps:

- `git ls-remote --tags` prints the **annotated tag object's** SHA, not the commit.
  Dereference with `^{}` before comparing against a local commit, or a correct tag will
  look wrong.
- `npm run changelog` exits 0 and writes nothing when the newest tag is already at `HEAD`.
  An empty diff is not success.

## Comments and prose

Write what the contract says, not how it came to say it. The reasoning behind a decision
belongs in the commit message, the ledger, or an issue — not stranded in the artifact.
"An earlier version did X" is history; `git log` already has it.

This applies to generated artifacts especially: a preamble explaining what a changelog
does not tell you is narration, and the sibling repositories' changelogs do not have one.

## Cross-repository work

Companion repositories, none of which version together:

- [`flutter_flowin`](https://github.com/luisburgos/flutter_flowin) — the reference
  implementation. Audits compare against it; its version is independent of this one.
- [`flowin_pm`](https://github.com/luisburgos/flowin_pm) — issues, and the audit ledgers
  under `audits/<technology>/`.

A finding that spans both a contract and an implementation is **two changes in two
repositories**. Land the spec side here and file or fix the implementation side there;
do not describe an implementation change as though this repository made it.
