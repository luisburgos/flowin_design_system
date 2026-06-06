# Tokens (DTCG)

Two-tier [Design Tokens Community Group](https://tr.designtokens.org/format/) JSON.

- `primitive/` — raw ramps as **literal values** (neutral / error / warning / success
  8-tier ramps, white, black; dimension: spacing, radius, borders; typography values).
- `semantic/` — **aliases** to primitives. `color.light.tokens.json` and
  `color.dark.tokens.json` both alias shared primitives; a `color.fixed.*` group holds
  mode-independent colors. `primary` / `secondary` / `tertiary` alias `neutral` and are
  flagged **placeholder** pending a chromatic brand accent.

Token resolution is validated automatically (off-the-shelf DTCG tooling): every alias
must resolve, no dangling or circular references.
