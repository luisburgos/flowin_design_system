# flowin_design_system — agent notes

> **This file owns nothing.** Everything here is a pointer or a failure mode; the rules
> live in [`CONTRIBUTING.md`](CONTRIBUTING.md) (workflow), [`VALIDATION.md`](VALIDATION.md)
> (gates) and [`AUDIT.md`](AUDIT.md) (audits).

Read CONTRIBUTING.md first — it is written for everyone. What follows is only the things
an agent gets wrong that a human would not.

## This repository specifies; it does not implement

There is no runtime here, so nothing "passes" to tell you a change is done. Use the test
at the top of CONTRIBUTING.md: would two teams implementing this independently arrive at
the same behaviour?

The agent-specific trap is that you can read every implementation at once. A question you
settle by opening one of them is a question the contract still does not answer — you just
had a source the next reader will not. Consulting an implementation is right for
*fidelity*, where the question is whether the spec matches what ships, and wrong for
*intent*, where it launders that implementation's decisions into a normative section and
makes every other platform non-conformant.

## Do not hand-edit generated or authoritative-elsewhere files

- **`CHANGELOG.md`** is generated. Edits survive exactly until the next
  `npm run changelog`. Anything a reader needs belongs in a commit message.
- **Gaps** belong in `DESIGN.md` §5. Restating them in the changelog or the README
  creates copies that drift.

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

Issues and audit ledgers are kept in a separate program-management repository, which is
not public. This repository does not link to it: the spec is the public artifact, and it
must not depend on something a reader cannot open.

A finding that spans both a contract and an implementation is **two changes in two
repositories**. Land the spec side here and file or fix the implementation side there;
do not describe an implementation change as though this repository made it.
