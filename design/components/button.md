# Component: button

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A control that triggers an action when activated. Emphasis is conveyed by **variant**;
footprint by **size**. The button's shape, corner radius, and base text style come from
the global theme — never from the call site. The call site chooses only *which variant*
and *which size*.

## Anatomy (illustrative)

A pill-shaped container wrapping an optional leading icon and a label. The reference
implementation composes the host platform's native button primitives (in Flutter:
`FilledButton`, `FilledButton.tonal`, `TextButton`, `OutlinedButton`) rather than drawing
a bespoke button — the theme styles the native primitive.

## Variants

| Variant | Emphasis | Purpose |
|---|---|---|
| `filled` | high | Primary action. Solid `primary` background. **(default)** |
| `tonal` | medium | Secondary action. `surfaceSecondary` background. |
| `outline` | medium | Secondary action with a border, transparent fill. |
| `text` | low | Lowest-emphasis, label-only. |
| `destructive` | high | Dangerous action. Layers the error color role onto the filled shape. |

## Sizes

Default size is `sm`.

| Size | Min height | Content padding (h × v) | Paired icon size |
|---|---|---|---|
| `xs` | `{size.control.xs}` (32px) | `space.300` × `space.200` (12 × 8) | sm (16) |
| `sm` | `{size.control.sm}` (40px) | `space.400` × `space.250` (16 × 10) | md (20) |
| `md` | `{size.control.md}` (56px) | `space.600` × `space.400` (24 × 16) | lg (24) |

## States

`default` · `hovered` · `pressed` · `focused` · `disabled`. State visuals (overlay,
opacity) are inherited from the platform's themed button; the spec does not override them
in v1.

## Token bindings (normative)

Shape, base padding, and text style are **theme-level** (apply to every button). The
per-call layer adds only size padding / min-height / icon size, and for `destructive` the
error color roles.

| Property | Variant / State | Token |
|---|---|---|
| shape corner radius | all | `{radius.400}` |
| base text style | all | `{typography.baseline.labelLarge}` |
| background | filled, default | `{color.primary}` |
| foreground | filled, default | `{color.onPrimary}` |
| background | tonal, default | `{color.surfaceSecondary}` |
| foreground | tonal, default | `{color.onSurfaceSecondary}` |
| background | outline, default | transparent |
| foreground | outline, default | `{color.onSurface}` |
| border side | outline, default | `{color.borderSubtle}` |
| foreground | text, default | `{color.onSurface}` |
| background | destructive, default | `{color.errorContainer}` |
| foreground | destructive, default | `{color.onErrorContainer}` |
| content padding | per size | `{space.*}` (see Sizes table) |
| min height | per size | `{size.control.*}` (see Sizes table) |

## Behavioral notes

- A null/absent activation callback **disables** the button.
- Either a `label` (string) or arbitrary `child` content must be provided; `child` wins
  when both are present.
- An optional leading icon renders before the label with the size's paired icon size.

## Theming directive

- **Global (theme slot):** corner radius, base padding, base text style, and the
  per-variant color roles. A conformant transform installs these on the platform's
  global button theming mechanism. They must be **globally overridable, not per-instance.**
- **Per-call (resolved by the thin widget):** variant selection, size (→ padding,
  min-height, icon size), and the destructive error-role overlay. These are the only
  concerns the theme cannot know per invocation.

## Known gaps / planned fix

- The legacy variant applied a per-size **outer padding** and a per-size **label text
  style**; the modern reference collapses to a single label style and drops the outer
  padding. Recorded as backlog (audit H6/H7), not specified here.

## Transform notes

- **Reference implementation:** `FlowinButton` (flutter_flowin). `outline` variant exists
  in the modern reference but not in legacy `FDButtonVariant` — v1 follows modern.
- **Theme slots (reference impl):** `filledButtonTheme` / `outlinedButtonTheme` /
  `textButtonTheme`.
- **Legacy names (reference):** `FDButton` outer-padding + per-size text style xs/sm/md →
  labelSmall/Medium/Large.
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `surfaceSecondary`, `onSurfaceSecondary`, `borderSubtle`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove corner radius (and other theme
  bindings) come from the theme, not the widget — override the slot, render the button,
  assert it reflects the override.
