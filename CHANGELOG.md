# Changelog

Generated from the commit history with `npm run changelog`. Sections follow
the conventional-commit types; `docs` leads because in a specification
repository a documentation change *is* a contract change.

**What this file does not tell you:** the open gaps. Those are conditions of
the current release rather than events in it, so they are maintained by hand
below and restated in `DESIGN.md` §5, which is authoritative.

## Open gaps (as of 0.2.0)

A transform must carry these as declared and **must not invent values** for
them:

- **No chromatic brand accent.** The `primary`, `secondary` and `tertiary`
  roles alias the neutral ramp. They are named slots awaiting a real palette;
  filling them will be a breaking change for any transform that shipped
  against the placeholders.
- **`typography.baseline.titleLarge` is declared but not bound.** No contract
  cites it and the reference implementation leaves the corresponding slot at
  the platform default.
- **The tab item's icon size is unbound.** The reference accepts an arbitrary
  icon whose size the caller sets; no token names it yet.
- **Dark-mode `onSurfaceBright` / `onSurfaceBrightVariant` are undefined.**
  The dark scheme declares the bright surface but no on-colour for it.

## [0.2.0](https://github.com/luisburgos/flowin_design_system/compare/0.1.0...0.2.0) (2026-08-07)

### Specification

* **action-sheet:** allow suppressing the card's outer margin ([1752177](https://github.com/luisburgos/flowin_design_system/commit/1752177f127b2e4b173ac79d9514bd91c5af20b6))
* **audit:** components — correct bindings, close six stale gaps ([81a52d2](https://github.com/luisburgos/flowin_design_system/commit/81a52d255320405335b18a00985f4e115d92acd0))
* **audit:** field and colour components — specify surface flag, tighten refs ([d202b86](https://github.com/luisburgos/flowin_design_system/commit/d202b860cd4f56db030c9e5323d65ccdadbc724b))
* **audit:** theme binding — spec-stale, correct 6 contract bindings ([25266ec](https://github.com/luisburgos/flowin_design_system/commit/25266ecd544ac47254ef8e6067039f737bd8c83d))
* **audit:** tokens — spec-stale, close 5 spec gaps against flutter_flowin ([df2b7a3](https://github.com/luisburgos/flowin_design_system/commit/df2b7a39f5c854fe63b8937c316cfc229687e502))
* **audit:** typography — spec-stale, add binding rules and one declared gap ([c0ab46e](https://github.com/luisburgos/flowin_design_system/commit/c0ab46e834a7c907aad8c3ff3dcad0ee0367d7bf))
* **button:** note that the base text style binds through the type scale ([50570c0](https://github.com/luisburgos/flowin_design_system/commit/50570c061d1754f7fca34b1779753e29a4740904))
* **chip-group:** specify scroll physics as a bouncing, overridable default ([0b867d2](https://github.com/luisburgos/flowin_design_system/commit/0b867d20cb8af1b1b1a3546b5e842491d0deeaba))
* **color-picker-field:** correct the swatch-visibility bindings ([ba0ca72](https://github.com/luisburgos/flowin_design_system/commit/ba0ca721b7e7f83db0a4ec979cfcf6d3676a1c83))
* **color-swatch:** bind the selection gap as carved, not painted ([eff222b](https://github.com/luisburgos/flowin_design_system/commit/eff222bae7f6decd5dbe76fcb48aac85894efbed))
* **components:** replace the sidebar input field with a stacked primitive ([5b7b719](https://github.com/luisburgos/flowin_design_system/commit/5b7b719de76a2f2b35e153155c9e0e5f0f0e0478))
* **components:** state chip-group wrap layout and the chip no-checkmark rule ([9a03e36](https://github.com/luisburgos/flowin_design_system/commit/9a03e369a1a86f21fceb3ab40da7336ab01e87db))
* **design:** record that Flowin is monochrome by design ([0712921](https://github.com/luisburgos/flowin_design_system/commit/07129217e592643ff5cbb46d930a24b3aaa8fa80))
* **design:** specify the accessible-colour layer ([d2d3553](https://github.com/luisburgos/flowin_design_system/commit/d2d35533dfdb81608cd3cd57bc2deb3aaf7f5477))
* **item-button:** bind the row icon to {size.icon.md} (20) ([19850f9](https://github.com/luisburgos/flowin_design_system/commit/19850f963acfa15ddd1295ad27df47022fff1b01))
* record the three resolved audit decisions ([c420dc7](https://github.com/luisburgos/flowin_design_system/commit/c420dc793982cf023f3621e5de03485a62f92679))

### Features

* **card:** specify the foreground-on-arbitrary-fill rule ([#20](https://github.com/luisburgos/flowin_design_system/issues/20)) ([74203d2](https://github.com/luisburgos/flowin_design_system/commit/74203d25ebefdbde47e76aae1c43a231a0cd0f37)), closes [flowin_pm#16](https://github.com/luisburgos/flowin_pm/issues/16)
* **tokens:** make the elevation shadow colour brightness-aware ([#19](https://github.com/luisburgos/flowin_design_system/issues/19)) ([43156e1](https://github.com/luisburgos/flowin_design_system/commit/43156e12e3aff6c555c02ee2162d40b99f86fd95)), closes [flowin_pm#12](https://github.com/luisburgos/flowin_pm/issues/12)
