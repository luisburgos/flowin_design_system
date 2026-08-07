# Component: item-button

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A **full-width, left-aligned list-row button**: a tappable row (typically in a list or
menu) whose content hugs the leading edge. It triggers an action like a [button](button.md),
but its footprint and alignment are row-shaped rather than pill-shaped — it is **not**
expressible as a `FlowinButton`, hence a distinct component.

## Anatomy (illustrative)

A full-width row with uniform inner padding, an optional leading icon, and a label, all
aligned to the **leading (left) edge**. The reference composes the platform's tonal/filled
button primitive with a center-left alignment and full-width sizing.

> *Illustrative platform aside (non-binding):* the reference implementation builds on
> `FilledButton.tonalIcon` (and siblings for other variants) with `alignment: centerLeft`
> and a full-width minimum size. The exact ripple bounds are platform-dependent; the
> **intent** (full-width, left-aligned row) is normative.

## Variants

Emphasis is conveyed by **variant**, mirroring [button](button.md). Default is `tonal`
(the list-row idiom is most commonly tonal).

| Variant | Emphasis | Purpose |
|---|---|---|
| `tonal` | medium | Standard list-row action. `surfaceSecondary` background. **(default)** |
| `filled` | high | High-emphasis row. Solid `primary` background. |
| `outline` | medium | Bordered row, transparent fill. |
| `text` | low | Lowest-emphasis, label-only row. |
| `destructive` | high | Dangerous row action. Layers the error color role onto the filled shape. |

## Sizes

No per-call size scale. The item button is a single row footprint: full width, uniform
`{space.400}` (16) padding on all sides.

| Size | Notable dimensions |
|---|---|
| (single) | full width; min height `{size.control.md}` (56); padding `{space.400}` (16) all sides; label `{typography.baseline.labelLarge}`; leading icon `{size.icon.md}` (20); alignment center-left |

> **Note — the row icon is `md` (20), not the `md` control's paired `lg` (24).**
> [button](button.md) pairs each *control* size with an icon size, and its `md` row
> pairs to `lg` (24). The item button deliberately does **not** inherit that pairing:
> its leading icon is a quiet affordance beside a `labelLarge` label, so it binds
> directly to `{size.icon.md}`. The legacy reference rendered 24 because it routed the
> icon through the control scale rather than stating an intent; this contract states it.

## States

`default` · `hovered` · `pressed` · `focused` · `disabled`. A null activation callback
**disables** the row. State overlays are inherited from the platform's themed button.

## Token bindings (normative)

Shape, base text style, and per-variant color roles are **theme-level** (shared with
[button](button.md)'s theming where the same native primitive is used). The per-call layer
adds the full-width sizing, center-left alignment, uniform padding, and for `destructive`
the error color roles.

| Property | Variant / State | Token |
|---|---|---|
| width | all | full (stretches to the parent's width) |
| alignment | all | center-left (leading edge) |
| shape corner radius | all | `{radius.400}` — **per-call pin, not the theme's pill** |
| content padding | all | `{space.400}` (16) on all sides |
| min height | all | `{size.control.md}` (56) |
| leading icon size | all | `{size.icon.md}` (20) — **not** the `md` control's paired `lg`; see Sizes |
| label text style | all | `{typography.baseline.labelLarge}` |
| background | tonal, default | `{color.surfaceSecondary}` |
| foreground | tonal, default | `{color.onSurfaceSecondary}` |
| background | filled, default | `{color.primary}` |
| foreground | filled, default | `{color.onPrimary}` |
| background | outline, default | transparent |
| foreground | outline, default | `{color.onSurface}` |
| border side | outline, default | `{color.borderSubtle}` |
| foreground | text, default | `{color.onSurface}` |
| background | destructive, default | `{color.errorContainer}` |
| foreground | destructive, default | `{color.onErrorContainer}` |

## Behavioral notes

- A null/absent activation callback **disables** the row.
- Either a `label` (string) or arbitrary `child` content must be provided; `child` wins when
  both are present.
- An optional leading icon renders before the label at the leading edge.
- The row **stretches to full width** and aligns its content to the leading (left) edge —
  this is the defining difference from the centered, content-width [button](button.md).

## Theming directive

- **Global (theme slot):** base text style and the per-variant color roles — installed on
  the platform's global button theming mechanism and **globally overridable, not
  per-instance.**
- **Per-call (resolved by the thin widget):** variant selection, full-width sizing,
  center-left alignment, the uniform `{space.400}` padding, the destructive error-role
  overlay, and **the corner radius**. These are the concerns the theme cannot know per
  invocation.
- **The corner radius is deliberately *not* theme-global for this component.** Every other
  control in the system inherits the theme's pill shape; the item-button overrides it with
  `{radius.400}` on its own style. A full-width row reads as a *surface*, and a pill-shaped
  surface spanning the viewport looks like a mistake — the radius has to stop scaling with
  the height. This is the one documented exception to "shape comes from the theme", so a
  transform must pin it per-call here and must **not** expect a theme override to reach it.

## Known gaps / planned fix

- _None._ (New component restoring the legacy left-aligned list-row button; see Transform
  notes.)

## Transform notes

- **Reference implementation:** `FlowinItemButton` (flutter_flowin), composing
  `FilledButton.tonalIcon` (and the filled/outlined/text siblings per variant) with
  `alignment: centerLeft` and a full-width minimum size.
- **Theme slots (reference impl):** `filledButtonTheme` / `outlinedButtonTheme` /
  `textButtonTheme` (shared with [button](button.md)).
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `surfaceSecondary`, `onSurfaceSecondary`, `borderSubtle`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Legacy names (reference):** a left-aligned, full-width list-row button (all-16 padding,
  tonal default + destructive) that was dropped in the rebuild — restored here (audit H9),
  with the variant set extended to mirror `FlowinButton`.
- **Deliberate divergence from the legacy reference — icon size (2026-08-04).** The legacy
  `FDItemButton` rendered its icon at **24**: it hardcoded the *control* size `md`, and the
  legacy scale mapped that control step to icon step `lg`. This contract binds the row icon
  directly to `{size.icon.md}` (**20**) instead. The design system is the source of truth
  here, not the legacy package — the 24 was a side effect of the control-scale routing, not
  a stated intent. Scope is this component only: [button](button.md)'s per-size icon pairing
  (`xs`→16, `sm`→20, `md`→24) is unchanged.
- **Tag:** generic-primitive.
- **Conformance:** a layout test must prove the row stretches to full width and aligns its
  content center-left; a theme-only-styling test must prove the variant colors come from the
  theme, not the widget.
