# Flowin Design System

The **technology-agnostic specification** of the Flowin design system.

This repo is the source of truth that AI agents transform into technology-specific
packages. The spec asserts **contracts and token values, never a specific rendering
technique**.

## Layout

| Path | Format | Audience | Role |
|---|---|---|---|
| `DESIGN.md` | Markdown | agents / transform input | thesis · theming model · transformation contract · component index |
| `tokens/` | DTCG JSON | machines / transform input | two-tier design tokens (primitive ramps + semantic aliases) |
| `design/components/<name>.md` | Markdown | agents / transform input | per-component contracts (fixed template) |
| `site/` | Astro/Starlight | humans | reader's guides + tokens and contracts resolved |
| `CONTRIBUTING.md` | Markdown | contributors | how to change a contract · when to release |
| `VALIDATION.md` | Markdown | contributors | the four gates and what each checks |
| `AUDIT.md` | Markdown | contributors | checking the spec against a real implementation |

## UI kits

A UI kit is a technology-specific package produced by transforming this spec. Each one
versions independently of the spec and of every other kit.

| Kit | Technology | Status |
|---|---|---|
| [`flutter_flowin`](https://github.com/luisburgos/flutter_flowin) | Flutter | reference implementation — audits compare against it |

Others (web/npm, etc.) come later. A kit is conformant when it satisfies the
transformation contract in [`DESIGN.md`](DESIGN.md) §3.

## Site

`site/` is an Astro/Starlight app that **reads** this spec and renders it for human
review — swatches with resolved values, scales drawn to scale, each contract with its
cited tokens resolved. It is generated from `tokens/**` and `design/components/*.md` at
build time and never restates a value, so a page cannot drift from the spec; it can only
fail to build.

```sh
cd site && npm install && npm run dev
```

**The site is not part of the spec.** A transform reads `tokens/`, `DESIGN.md` and
`design/components/` directly — the JSON and Markdown are the machine-readable inputs, and
they are what a transform must consume. `site/` is a reader, and its build tooling is
deliberately confined to that directory.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to change a contract, what the validation
gates check, and when a release is warranted. Run `npm run validate` before committing.

## Status

Released as `0.2.0` — the first state audited against a stable reference implementation
(`flutter_flowin`), with every unit of the audit protocol verdicted. Open gaps are
declared in [`DESIGN.md`](DESIGN.md) §5; program planning lives in
[`flowin_pm`](https://github.com/luisburgos/flowin_pm).
