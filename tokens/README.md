# Tokens (DTCG)

Two-tier [Design Tokens Community Group](https://tr.designtokens.org/format/) JSON.

- `primitive/` — raw values, the source palette and scales:
  - `color.tokens.json` — neutral / error / warning / success 8-tier ramps, plus white
    and black. No `primary` / `secondary` / `tertiary` ramps live here — those are
    semantic roles, not raw palette.
  - `dimension.tokens.json` — spacing, corner-radius, border-width, and sizing
    (`size.control`, `size.icon`) scales.
  - `typography.tokens.json` — font families (Inter baseline, Supreme brand), weights,
    and composite type tokens for the baseline and brand scales.
  - `shadow.tokens.json` — elevation shadow tokens.
- `semantic/` — **aliases** to primitives:
  - `color.light.tokens.json` and `color.dark.tokens.json` define the per-mode role set;
    both alias the shared primitive ramps.
  - `color.fixed.tokens.json` holds mode-independent colors (same value in both modes).
  - `primary` / `secondary` / `tertiary` alias the `neutral` ramp. That is the default,
    not a missing palette: they are the accent surface a consumer re-points, and a
    transform keeps them overridable rather than resolving them to fixed values.
    See DESIGN.md §2, "Accent roles are a customization surface".
  - Semantic role keys use a platform-neutral vocabulary (e.g. `surfaceSecondary` /
    `onSurfaceSecondary`, `borderSubtle`); see DESIGN.md §2 for the role-vocabulary rationale.

Token resolution is validated automatically (`node tokens/validate.mjs`): every alias
must resolve, with no dangling or circular references.
