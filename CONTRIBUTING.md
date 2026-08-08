# Contributing

> **This file owns the workflow**: how to make a change, and when to release. The gates
> live in [`VALIDATION.md`](VALIDATION.md); the audit protocol in [`AUDIT.md`](AUDIT.md).

This repository is a **specification**, not a package. Nothing here compiles or ships;
what it produces is a contract that other repositories transform into real UI kits.

## The test

> If two teams implemented this independently, on different platforms, would they arrive
> at the same behaviour?

That is what a specification is for. Not that a change is buildable — a vague contract is
buildable, just differently by each reader — but that everyone who builds it converges.
Anything a reader has to decide for themselves is a place where implementations diverge,
and divergence is the failure this repository exists to prevent.

The corollary is that the spec has to be **self-sufficient**. A question answered by
looking at an existing implementation is a question the text did not answer; the reader
who had that implementation to hand simply did not notice. Someone without it guesses, and
the guesses differ.

Three ways a change fails the test:

- **A value that holds on one platform and not another.** Binding a button's corner radius
  to a fixed `{radius.400}` is precise and unambiguous. It is also wrong: the button is a
  pill whose radius is half its rendered height, so a fixed 16 is right at one size and a
  rounded rectangle at the next. Implementers converge on the number and diverge on the
  shape. The fix was not more precision — it was saying *pill*, and stating the
  `height / 2` rule.
- **A reference that resolves to nothing.** "the tabs paired icon size" reads fine until
  you look for the token and there is none. Every reader now picks their own.
- **A claim contradicted by what ships.** "Scroll physics are platform-default", when the
  reference pins one physics unconditionally. Implement the sentence faithfully and you do
  not match the system you are supposed to be joining.

The first two are perfectly unambiguous and still fail. Clarity is necessary and not
sufficient: a contract also has to be *complete* — leaving nothing to the reader's
judgement — and *true*.

Read the site's guides first if you have not —
[Reading a component contract](https://luisburgos.github.io/flowin_design_system/guides/reading-a-contract/)
and [How the spec becomes a UI kit](https://luisburgos.github.io/flowin_design_system/guides/transforms/)
are the reader's tour, and they render the tokens and contracts resolved. The rest of this
file covers mechanics.

## Before you commit

```sh
npm run validate
```

A non-zero exit is a blocking failure. [`VALIDATION.md`](VALIDATION.md) says what each
gate checks.

## Changing a component contract

The **binding contract** — Intent, States, Token bindings, Behavioral notes — is
normative. **Anatomy is illustrative**: a platform that renders the component differently
is still conformant as long as the bindings hold. Keep that line sharp; describing a
rendering as though it were required is the most common way a spec change goes wrong.

Two rules that are easy to break by accident:

- **Cite tokens, never literals.** `{space.400}` in a bindings table, not `16`. A literal
  cannot be traced when a token moves, and Gate 2 cannot check it.
- **Keep technology names out of normative sections.** They belong in *Transform notes*
  and in a clearly-marked illustrative *Anatomy* aside. Gate 4 enforces this, but it can
  only catch names it knows about.

If a value genuinely has no token, say so and mark it a gap (below) rather than inventing
one.

## Gaps

A **gap** is something the spec deliberately does not answer yet: a role with no real
value, a token bound by nothing, a capability not carried across. Gaps are declared in
[`DESIGN.md`](DESIGN.md) §5 and tracked as issues in
[`flowin_pm`](https://github.com/luisburgos/flowin_pm).

Declaring a gap is not an admission of incompleteness — it is the instruction that stops a
transform inventing a value and silently diverging from every other transform. If you find
yourself guessing, you have found a gap; write it down.

DESIGN.md §5 is authoritative. The backlog tracks the work, and the changelog does not
mention gaps at all: they are conditions of a release rather than events in it.

## Commits

Conventional Commits, matching the surrounding history:

```
docs(button): specify the per-size outer padding
feat(tokens): add the status colour roles
fix(chip): correct the unselected border role
```

`docs` is the primary type here — in a specification repository a documentation change
*is* a contract change, which is why it leads the changelog's section order.

Avoid writing a bare `#RRGGBB` colour in a commit body: the changelog generator parses it
as an issue reference and emits a link to an issue that does not exist.

## Releasing

### When a release is warranted

Cut a release when the spec has reached a state a transform author can build against with
confidence. Concretely, all of:

1. **`npm run validate` passes.**
2. **No contract cites a token that does not exist**, and no gap is undeclared — anything
   unresolved is written down in §5 with an issue behind it, rather than left implicit.
3. **The spec agrees with at least one reference implementation.** This is the real gate,
   and the one that takes work: an audit run against a stable implementation, every unit
   verdicted, nothing left undecided. The protocol is [`AUDIT.md`](AUDIT.md) and the run's
   state lives in a ledger under `flowin_pm/audits/<technology>/`.

Point 3 is what separates a release from a checkpoint: the gates prove the spec is
internally consistent, and only an audit shows it still describes something real.
[`AUDIT.md`](AUDIT.md) explains why.

If you are unsure whether the spec has drifted from the implementations, it has. Run an
audit.

### Cutting the release

Order matters — the generator reads the range between the newest tag and `HEAD`:

```sh
npm run changelog     # generate first
git add CHANGELOG.md && git commit -m "build: changelog for <version>"
git tag -a <version> -m "<what this release is>"
git push origin main --follow-tags
```

Tagging before generating produces an empty changelog, because there is then no range
between the tag and `HEAD` to walk. If that happens, `npx conventional-changelog -n
./changelog.config.js -o CHANGELOG.md -r 2` rebuilds the last two releases.

**Do not hand-edit `CHANGELOG.md`.** It is generated, and the next run overwrites edits.
Anything you want a reader to know belongs in a commit message, where the generator will
pick it up.

### Version numbers

Semver, against the **contract** rather than any implementation. This repository's version
is deliberately independent of `flutter_flowin`'s or any future SDK's: a clarification
that changes no downstream code still bumps the spec, and a downstream refactor with no
contract change does not.

- **Patch** — a correction that leaves every binding as it was: wording, a fixed typo, a
  clarified rationale.
- **Minor** — new tokens, new contracts, newly specified behaviour. Existing bindings keep
  their meaning.
- **Major** — a binding changes meaning or disappears. Re-pointing a role, renaming a
  token, removing a variant.

The spec stays `0.x` while DESIGN.md §5 carries gaps that will move existing bindings when
they close. Filling the chromatic brand accent, for instance, re-points `primary`,
`secondary` and `tertiary` — breaking for any transform built against the placeholder
neutrals. Declaring `1.0.0` before that lands would promise a stability the spec does not
have.
