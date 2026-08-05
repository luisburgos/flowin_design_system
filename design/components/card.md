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

Because the fill may be **caller-supplied data** rather than a theme role, the card also
owns the readability of what is drawn on it: it resolves a text and icon colour against
its own fill rather than letting the content inherit one chosen for a different surface.
That is the one way a card reaches into its content slot, and it exists because nothing
else in the tree can — the theme cannot see a colour that arrives at the call site.

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
| content foreground | default | **resolved against the fill** — not a token; see below |
| corner radius (each corner) | default | `{radius.400}` |
| corner smoothing factor | all | `{radius.cornerSmoothing}` |
| border side | default | none (transparent, zero width) |

> **The content foreground binds to no token, by design.** A token would be a fixed
> answer to a question whose input is caller data. It is computed per-fill through the
> contrast layer ([DESIGN.md §2](../../DESIGN.md#2-theming-model)) at the **normal-text**
> compliance level (4.5:1) — the level for body text, which is the content a card most
> often holds.

## Behavioral notes

- A content slot is **required**; the card is a pure wrapper and contributes no content
  of its own.
- The default corner radius (`{radius.400}` on all four corners) may be overridden
  **per-corner** at the call site; the smoothing factor (`{radius.cornerSmoothing}`)
  applies to whatever radius is in effect and is not separately overridable per-call.
- The fill color may be overridden per-call; absent an override it resolves from the theme
  surface fill, falling back to the tonal surface role.
- **The content's text and icon colour is resolved against the card's fill, by default.**
  A fill may be caller-supplied data — a team colour, a user accent — and the ambient
  colour the content would otherwise inherit was chosen by the theme for a theme surface,
  not for that fill. Measured across four representative fills in both brightnesses, six
  of eight pairings fell below the 4.5:1 minimum; dark body text on a black fill is
  1.18:1. The failures **invert** between brightnesses — light themes fail on dark fills,
  dark themes on light ones — so no single inherited colour can serve a fill the theme
  cannot see. Resolution is the default rather than opt-in for that reason: a call site
  that forgets to ask gets readable content, not unreadable content.
- **A preferred foreground is a preference, not an override.** A call site may name the
  colour it wants; it is used when it meets the compliance level on that fill, and
  replaced when it does not. A card cannot promise both "your exact colour" and
  "readable", and this contract chooses readable. The layer reports the shortfall rather
  than silently downgrading the requirement (see [DESIGN.md §2](../../DESIGN.md#2-theming-model)).
- **A fully transparent fill is never resolved against.** What the content is read against
  is then whatever is behind the card, which the card cannot see. A transparent colour
  also reports zero luminance, so resolving against it returns the foreground for black —
  white text on a see-through surface. Transparent-filled cards keep the inherited colour.
- Resolution may be **turned off** per-call, for a card whose content manages its own
  colours. Doing so returns the content to the inherited colour and forfeits the
  guarantee; it is not a way to supply a colour (see the preference rule above).
- An optional border may be supplied per-call (off by default).
- Optional drop shadows may be supplied per-call (none by default); shadows are a
  caller-provided list, not a theme elevation token in v1.
- **An elevation shadow's colour resolves per brightness.** The geometry is fixed
  (`{shadow.shadow100}`), but the colour binds to the semantic `shadow` role, which is a
  light neutral in light mode and **black** in dark. A shadow is an absence of light, so
  it darkens whatever it falls on; a colour that does not vary by mode inverts that on a
  dark surface and renders a glow. Binding the colour to a fixed primitive ramp step is
  **non-conformant**, and so is a dark shadow drawn from a neutral step near the surface —
  `neutral.700` on a `neutral.800` surface is one step of separation and reads as nothing.
- Outer margin, inner padding, and an explicit width/height may be supplied per-call as
  intrinsic layout concerns.
- Clipping of the content to the smooth-corner shape is **opt-in** per-call (off by
  default); when enabled, the content is clipped to the same shape as the surface.

## Theming directive

- **Global (theme slot):** the fill color and the default corner radius. A conformant
  transform installs these on the platform's global card theming mechanism. They must be
  **globally overridable, not per-instance.**
- **Per-call (resolved by the thin widget):** the content slot, per-corner radius
  override, fill-color override, border side, margin, padding, explicit size, shadows,
  the clip-content flag, the preferred content foreground, and whether to resolve a
  foreground at all. These are the intrinsic surface concerns the theme cannot know per
  invocation — they exist because the framework has no native equivalent for a
  smooth-cornered surface, not as styling escape hatches for color/shape that the theme
  already owns.
- **Computed, not themed:** the content foreground is neither of the above. It is derived
  from the fill in effect, so a theme override changes it only by changing that fill.
  A transform must not add a theme slot for it — a themed value would be a fixed answer
  to a per-fill question, and would reintroduce exactly the mismatch this rule removes.

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
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `surfaceSecondary`, `cornerSmoothing`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Smoothing factor:** the reference foundation constant `iOSSmooth` (0.6) maps to the
  `{radius.cornerSmoothing}` token; `radius400` (16px) maps to `{radius.400}`.
- **Legacy names (reference):** `FDCard` / `FDCardBorderRadius` — the legacy `borderRadius`
  was a **required** parameter with no `.medium()` default constructor (see Known gaps).
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove the fill color and default corner
  radius come from the theme slot, not the widget — override the slot, render the card with
  no per-call overrides, assert it reflects the override.
- **Conformance (elevation):** prove the elevation shadow's colour differs between the two
  brightnesses, and that the dark one is **darker than the surface it falls on**. Asserting
  only that a shadow exists is insufficient — the light-only value was a valid `BoxShadow`
  throughout, and it rendered as a glow.
- **Conformance (content contrast):** prove the content's resolved colour clears 4.5:1
  against the fill, for fills spanning the range a caller might supply (at minimum: near
  black, near white, and a saturated mid-tone) **in both brightnesses**. Testing one
  brightness passes while the other fails — the two break on opposite fills. Additionally
  prove a transparent fill leaves the inherited colour untouched, and that a preferred
  foreground is honoured when it meets the level and replaced when it does not.
