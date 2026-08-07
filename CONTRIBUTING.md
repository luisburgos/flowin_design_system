# Contributing

This repository is a **specification**, not a package. Nothing here compiles or ships;
what it produces is a contract that other repositories transform into real UI kits. That
changes what "correct" means: a change is correct when it is unambiguous to someone
implementing it on a platform you have never used.

Read [`docs/usage-guide.html`](docs/usage-guide.html) first if you have not — it is the
reader's tour of the three-layer model. This file covers the mechanics of changing things.

## Before you commit

Run both validators:

```sh
npm run validate
```

That is Gates 1, 2 and 4 from [`VALIDATION.md`](VALIDATION.md): every token alias
resolves, every `{token.reference}` cited in a contract exists, every contract carries the
fixed template sections, the component index matches the files on disk, and no technology
name has leaked into a normative section. A non-zero exit is a blocking failure, not a
warning.

Gate 3 (conformance) cannot run here — it asserts that a documented binding is overridable
on a *platform's* theme, which only that platform's test suite can prove.

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

Point 3 is what separates a release from a checkpoint. Gates 1, 2 and 4 prove the spec is
*internally* consistent — that every reference resolves and every contract is
well-formed. None of them can see whether the spec still describes something real. Only an
audit against a working implementation does that, which is why a release is cut *after* an
audit converges, not whenever main happens to look tidy.

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
