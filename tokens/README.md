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
  - `primary` / `secondary` / `tertiary` alias the `neutral` ramp and are flagged
    **placeholder** pending a chromatic brand accent.
  - Role keys use the neutralized vocabulary: `surfaceSecondary` / `onSurfaceSecondary`
    (formerly `secondaryContainer` / `onSecondaryContainer`) and `borderSubtle`
    (formerly `outlineVariant`).

Token resolution is validated automatically (`node tokens/validate.mjs`): every alias
must resolve, with no dangling or circular references.
