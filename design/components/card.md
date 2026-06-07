# Component: card

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A passive surface that groups arbitrary content on a single tonal background with
**smooth (continuous) corners** — the one shape the host framework's native card cannot
draw. The card's fill color and corner radius come from the global theme; the call site
supplies the content and, where the framework has no equivalent, the intrinsic surface
concerns (per-corner radius, optional border, margin, padding, explicit size, shadows,
and whether to clip the content to the smooth corners). It carries no emphasis axis and
no interaction of its own.

## Anatomy (illustrative)

A single smooth-cornered rectangular container wrapping one arbitrary content slot. The
reference implementation draws a bespoke surface (a shaped, filled box) rather than
composing a native card primitive, **because the smooth/continuous corner shape is
precisely what the framework's native card cannot render**. Whether the corner is drawn
as a true continuous (squircle) curve or approximated is **platform-dependent**; the spec
fixes the *intent* (a tonal surface with smoothed corners and a single content slot), not
the curve math. When clipping is requested, the content slot is clipped to the same
smooth-corner shape as the surface.

## Variants

The card has **no variant axis**. It is a single generic surface; emphasis and meaning
come from the content placed inside it, not from a card variant.

| Variant | Purpose |
|---|---|
| (single) | A tonal surface with smooth corners wrapping arbitrary content. |

## Sizes

The card has **no per-call size token axis**. By default it shrink-wraps its content. An
explicit width and/or height may be supplied per-call as an intrinsic layout concern (see
Behavioral notes); these are caller-provided measures, not entries on the sizing scale.

| Size | Notable dimensions |
|---|---|
| (intrinsic) | Shrink-wraps content unless an explicit width/height is supplied per-call. |

## States

The card has **no interactive states**. It exposes no activation callback and renders the
same in every interaction context (`default` only). It is not focusable, hoverable, or
pressable as a primitive; any interactivity belongs to the content placed inside it.

## Token bindings (normative)

The fill color and the default corner radius are **theme-level** (apply to every card).
The per-call layer adds only the intrinsic surface concerns the theme cannot know per
invocation (per-corner radius override, border side, margin, padding, explicit size,
shadows, clip).

| Property | Variant / State | Token |
|---|---|---|
| background | default | `{color.surfaceSecondary}` |
| corner radius (each corner) | default | `{radius.400}` |
| corner smoothing factor | all | `{radius.cornerSmoothing}` |
| border side | default | none (transparent, zero width) |

## Behavioral notes

- A content slot is **required**; the card is a pure wrapper and contributes no content
  of its own.
- The default corner radius (`{radius.400}` on all four corners) may be overridden
  **per-corner** at the call site; the smoothing factor (`{radius.cornerSmoothing}`)
  applies to whatever radius is in effect and is not separately overridable per-call.
- The fill color may be overridden per-call; absent an override it resolves from the theme
  surface fill, falling back to the tonal surface role.
- An optional border may be supplied per-call (off by default).
- Optional drop shadows may be supplied per-call (none by default); shadows are a
  caller-provided list, not a theme elevation token in v1.
- Outer margin, inner padding, and an explicit width/height may be supplied per-call as
  intrinsic layout concerns.
- Clipping of the content to the smooth-corner shape is **opt-in** per-call (off by
  default); when enabled, the content is clipped to the same shape as the surface.

## Theming directive

- **Global (theme slot):** the fill color and the default corner radius. A conformant
  transform installs these on the platform's global card theming mechanism. They must be
  **globally overridable, not per-instance.**
- **Per-call (resolved by the thin widget):** the content slot, per-corner radius
  override, fill-color override, border side, margin, padding, explicit size, shadows, and
  the clip-content flag. These are the intrinsic surface concerns the theme cannot know per
  invocation — they exist because the framework has no native equivalent for a
  smooth-cornered surface, not as styling escape hatches for color/shape that the theme
  already owns.

## Known gaps / planned fix

- **Faithful (strict superset).** The reference is a faithful superset of the legacy
  surface: it adds a named default-radius constructor and makes the default
  corner radius (`{radius.400}` on every corner) implicit, whereas the legacy variant
  **required** an explicit per-corner radius at every call site. No binding behavior is
  removed; the addition is purely ergonomic. Recorded as an accepted superset, not a
  deviation to remediate.
- The default fill resolves through the theme surface fill with a fallback to the tonal
  surface role (`{color.surfaceSecondary}`); the table specifies that resolved default.
  Shadows remain a per-call caller-provided list rather than a theme elevation token —
  recorded for a future elevation-token pass, not specified here.

## Transform notes

- **Reference implementation:** `FlowinCard` (flutter_flowin) — a bespoke smooth-cornered
  surface (the framework's native `Card` cannot draw continuous corners). The per-corner
  radius value object is `FlowinCardBorderRadius` with an `.all(radius)` constructor and a
  `.medium()` default-radius constructor.
- **Theme slot (reference impl):** `cardTheme` (`color` + `shape`).
- **Color-role neutralization:** the reference slot binds the platform's
  `secondaryContainer` role for the fill; this contract refers to it by its neutralized
  name `surfaceSecondary`.
- **Smoothing factor:** the reference foundation constant `iOSSmooth` (0.6) maps to the
  `{radius.cornerSmoothing}` token; `radius400` (16px) maps to `{radius.400}`.
- **Legacy names (reference):** `FDCard` / `FDCardBorderRadius` — the legacy `borderRadius`
  was a **required** parameter with no `.medium()` default constructor (see Known gaps).
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove the fill color and default corner
  radius come from the theme slot, not the widget — override the slot, render the card with
  no per-call overrides, assert it reflects the override.
