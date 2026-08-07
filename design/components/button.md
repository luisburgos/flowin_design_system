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

| Size | Min height | Content padding (h × v) | Outer padding | Label text style | Paired icon size |
|---|---|---|---|---|---|
| `xs` | `{size.control.xs}` (32px) | `space.300` × `space.200` (12 × 8) | `space.200` (8) | `{typography.baseline.labelSmall}` | sm (16) |
| `sm` | `{size.control.sm}` (40px) | `space.400` × `space.250` (16 × 10) | `space.100` (4) | `{typography.baseline.labelMedium}` | md (20) |
| `md` | `{size.control.md}` (56px) | `space.600` × `space.400` (24 × 16) | `space.0` (0) | `{typography.baseline.labelLarge}` | lg (24) |

- **Content padding** is the padding *inside* the button (between its edge and the
  label/icon). The theme also carries a **base** content padding of `space.400` × `space.300`
  (16 × 12), which is what a *bare platform-native button* renders with when no Flowin size
  is resolved. It sits between `sm` and `md` and is deliberately not equal to any size row:
  a call site that picks a size always overrides it. It exists so the theme-first promise
  holds — a native button with no wrapper already looks like Flowin.
- **Outer padding** is applied *around* the button by the thin widget, so adjacent
  buttons of the same size share consistent spacing without the call site adding it.
- **Label text style** is per-size: it overrides the theme's base text style for `xs`
  and `sm` (the base style equals the `md` style — `labelLarge`).

## States

`default` · `hovered` · `pressed` · `focused` · `disabled`. State visuals (overlay,
opacity) are inherited from the platform's themed button; the spec does not override them
in v1.

## Token bindings (normative)

Shape and the per-variant color roles are **theme-level** (apply to every button). The
base text style is the theme default and equals the `md` label style; `xs`/`sm` override
it per size. The per-call layer adds size padding / outer padding / per-size label text
style / min-height / icon size, and for `destructive` the error color roles.

**The button is a pill at every size.** Its corner radius resolves to *half the rendered
height*, so the ends stay perfectly semicircular whether the button is 32, 40, or 56 tall.
This is why the binding is `{radius.full}` (the pill sentinel) and not a fixed step: a
fixed `{radius.400}` (16px) is exactly half of the `xs` height but only a rounded rectangle
at `md`, so the shape would drift between sizes. A transform whose platform has a native
pill/stadium shape should use it; one without should compute `height / 2` rather than
substituting a fixed radius.

| Property | Variant / State | Token |
|---|---|---|
| shape corner radius | all | `{radius.full}` (pill — see note below) |
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
| content padding | theme base (no size resolved) | `space.400` × `space.300` (16 × 12) |
| content padding | per size | `{space.*}` (see Sizes table) |
| outer padding | per size | `{space.*}` (see Sizes table) |
| label text style | per size | `{typography.baseline.label*}` (see Sizes table) |
| min height | per size | `{size.control.*}` (see Sizes table) |

## Behavioral notes

- A null/absent activation callback **disables** the button.
- Either a `label` (string) or arbitrary `child` content must be provided; `child` wins
  when both are present.
- An optional leading icon renders before the label with the size's paired icon size.

## Theming directive

- **Global (theme slot):** corner radius, base text style (= the `md` label style), and
  the per-variant color roles. A conformant transform installs these on the platform's
  global button theming mechanism. They must be **globally overridable, not per-instance.**
- **Per-call (resolved by the thin widget):** variant selection, size (→ content padding,
  outer padding, per-size label text style, min-height, icon size), and the destructive
  error-role overlay. These are the only concerns the theme cannot know per invocation.

## Known gaps / planned fix

- _None._ (The legacy per-size **outer padding** and per-size **label text style** —
  audit H6/H7 — are now **specified** above: see the Sizes table and Token bindings.)

## Transform notes

- **Reference implementation:** `FlowinButton` (flutter_flowin). `outline` variant exists
  in the modern reference but not in legacy `FDButtonVariant` — v1 follows modern.
- **Theme slots (reference impl):** `filledButtonTheme` / `outlinedButtonTheme` /
  `textButtonTheme`.
- **Pill shape is inherited, not set.** The reference implementation deliberately sets
  *no* shape on the button theme slots, because Material's own default for these slots is
  already `StadiumBorder` — the pill the contract requires. Inheriting it is therefore the
  binding, and it is what production renders. Two consequences for a reviewer: an absent
  `shape:` in the button theme is **conformant, not a gap**, and the theme-overridability
  test still holds (overriding the slot's shape changes the rendered button). A transform
  onto a platform whose default is *not* a pill must set the shape explicitly.
- **`item-button` is the documented exception:** it pins `{radius.400}` on its own style,
  because a full-width row reads as a surface rather than a pill.
- **Legacy names (reference):** `FDButton` outer-padding + per-size text style xs/sm/md →
  labelSmall/Medium/Large — now adopted in v1 (above), restoring legacy parity.
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `surfaceSecondary`, `onSurfaceSecondary`, `borderSubtle`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove corner radius (and other theme
  bindings) come from the theme, not the widget — override the slot, render the button,
  assert it reflects the override.
