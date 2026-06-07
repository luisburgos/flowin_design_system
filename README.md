# Flowin Design System

The **technology-agnostic specification** of the Flowin design system.

This repo is the source of truth that AI agents transform into technology-specific
packages (Flutter first, via [`flutter_flowin`](https://github.com/luisburgos/flutter_flowin);
others — web/npm, etc. — later). The spec asserts **contracts and token values, never a
specific rendering technique**.

## Layout

| Path | Format | Audience | Role |
|---|---|---|---|
| `DESIGN.md` | Markdown | agents / transform input | thesis · theming model · transformation contract · component index |
| `tokens/` | DTCG JSON | machines / transform input | two-tier design tokens (primitive ramps + semantic aliases) |
| `design/components/<name>.md` | Markdown | agents / transform input | per-component contracts (fixed template) |
| `docs/` | HTML | humans | usage guides + rationale |

## Docs

Human-facing reference docs live in `docs/` as self-contained HTML:

- [`docs/usage-guide.html`](docs/usage-guide.html) — a reader's tour of the spec: the
  three-layer model, how to read a component contract, how the tokens resolve, and how a
  transform produces a tech-specific package.
- [`docs/rationale-theme-first.html`](docs/rationale-theme-first.html) — the long-form
  "why theme-first" rationale (legacy closed-wrapper anti-pattern vs. the theme-first
  rebuild) behind the thesis in `DESIGN.md` §1.

## Architecture: theme-first

Native widgets / platform primitives are styled **entirely by a global theming
mechanism** (Flutter `ThemeData` + component themes, CSS custom properties + classes,
etc.). Custom components exist only where a platform has no equivalent. Every token
binding must be **globally overridable, not per-instance**.

## Status

v1 in progress. Program planning lives in
[`flowin_pm`](https://github.com/luisburgos/flowin_pm).
