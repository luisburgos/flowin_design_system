# Component: color-radial-button

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A circular color-swatch control that presents a single color as a tappable affordance and
signals whether that color is the **selected** one. It is the unit of a color-selection
surface: the caller supplies a color, and the control conveys "this is color X, and here
is whether it is currently chosen." A dedicated **gradient** affordance stands in for "pick
a custom color" — a swatch whose fill is a full-spectrum sweep rather than one color. The
swatch diameter, ring width, and gap width come from the design scale; the call site
chooses only *which color*, *whether it is selected*, and *whether it is the custom-color
affordance*.

## Anatomy (illustrative)

A filled circle. When **selected**, a concentric gap is carved out near the edge, leaving a
colored outer **ring** of fixed width separated from a colored inner disc by a gap of the
surface color. The reference implementation draws this by stacking three filled circles
(outer color disc, a surface-colored gap circle, an inner color disc) inside a tappable
material, rather than composing a native swatch primitive — **the host framework has no
color-swatch widget**. Whether the selected ring is produced by stacked filled circles,
by a stroked ring, or by some other primitive is **platform-dependent**; the spec fixes the
*intent* (a tappable color swatch that visibly reads as "selected" via a ringed treatment),
not the stacking math. The custom-color affordance replaces the flat fill with a
full-spectrum sweep across the same circular shape.

## Variants

| Variant | Purpose |
|---|---|
| `swatch` | A single solid color presented as a tappable swatch. **(default)** |
| `gradient` | The "pick a custom color" affordance — a full-spectrum sweep fill over the same circular shape. |

## Sizes

The control has **no per-call size token axis** in the size-name sense; it exposes a single
diameter measure that defaults from the design scale and may be overridden per-call as an
intrinsic layout concern (see Behavioral notes). The ring and gap widths likewise default
from the scale.

| Size | Notable dimensions |
|---|---|
| (default) | Diameter `{space.700}` (28px); selected-ring width `{border.extraBold}` (3px); gap width `{border.bold}` (2px). |

## States

`default` · `hovered` · `pressed` · `focused` · `disabled` (a null/absent activation
callback disables the control). The orthogonal **selected / unselected** distinction is a
content-driven flag, not an interaction state: in the **unselected** state the swatch is a
flat filled circle; in the **selected** state a colored ring is carved out near the edge.
Press/hover/focus overlay visuals are inherited from the platform's themed tappable
surface; the spec does not override them in v1.

## Token bindings (normative)

The diameter, ring width, gap width, and gap color default from the design scale and the
theme surface role. The swatch fill color is **caller-supplied per-call** (it is the
control's payload, not a theme token); the gradient affordance's spectrum is a fixed set of
spectrum stops (see Known gaps).

| Property | Variant / State | Token |
|---|---|---|
| fill (swatch) | swatch, all | caller-supplied color (per-call payload; not a token) |
| fill (sweep) | gradient, all | fixed spectrum stops (not tokens; see Known gaps) |
| diameter | all | `{space.700}` (default; per-call overridable) |
| selected-ring width | selected | `{border.extraBold}` |
| gap width | selected | `{border.bold}` |
| gap color | selected | `{color.surface}` (default; per-call overridable) |
| container fill | all | transparent (only the swatch circle paints) |

## Behavioral notes

- A null/absent activation callback **disables** the control; otherwise a tap fires the
  activation callback.
- The swatch **color is required** and is the control's payload — it is supplied per-call,
  never resolved from the theme.
- **Selection** is a per-call boolean. Unselected renders a flat filled circle; selected
  carves a concentric gap, leaving a colored ring whose width is `{border.extraBold}`
  separated from the inner disc by a gap of width `{border.bold}` in the gap color.
- The **gap color** defaults to the theme surface role (`{color.surface}`) and may be
  overridden per-call (e.g. when the swatch sits on a non-surface background).
- Diameter, ring width, and gap width may each be overridden per-call as intrinsic layout
  concerns. The geometry must satisfy *diameter ≥ 2 × (ring width + gap width)*; a diameter
  smaller than that is invalid (the inner disc would have negative size).
- The **gradient** affordance is a distinct construction of the same control: it swaps the
  flat fill for a full-spectrum sweep and otherwise honors the same diameter, selection,
  ring/gap, and activation behavior.

## Theming directive

- **Global (theme slot):** the gap color resolves from the global theme surface role
  (`{color.surface}`) by default. A conformant transform reads this from the platform's
  global theming mechanism so the gap tracks the ambient surface, **globally overridable,
  not per-instance**.
- **Per-call (resolved by the thin widget):** the swatch color (required payload), the
  selected flag, the variant (swatch vs. gradient), and the optional diameter / ring-width /
  gap-width / gap-color overrides. These are the concerns the theme cannot know per
  invocation — they exist because the framework has no native color-swatch equivalent, not
  as styling escape hatches for roles the theme already owns.

## Known gaps / planned fix

- **Faithful (byte-identical).** The reference is a faithful port of the legacy swatch: the
  ring math (`middle = diameter − 2 × ringWidth`, `inner = middle − 2 × gapWidth`), the
  default diameter / ring / gap measures, and the stacked-circle composition are carried
  over unchanged. No binding behavior is added or removed.
- The **gradient** affordance's fill is a **fixed 8-stop spectrum sweep** hard-coded in the
  reference (an 8-stop rainbow loop), **not** drawn from design tokens. This is a documented
  gap: the spectrum stops are not tokenized and the contract therefore cannot bind them to
  token refs. Recorded as backlog (tokenize / parameterize the custom-color spectrum), not
  specified here — link `flowin_pm`.
- Per-call overridable geometry (diameter, ring width, gap width) currently uses raw
  scale-derived defaults rather than a named size axis; a future pass may fold these into a
  size-name axis consistent with other controls. Recorded, not specified here.

## Transform notes

- **Reference implementation:** `FlowinColorRadialButton` (flutter_flowin), with a named
  `FlowinColorRadialButton.gradient` constructor for the custom-color affordance — a bespoke
  stack of filled circles inside a tappable `Material` / `InkWell` (the framework has no
  native color-swatch widget).
- **Theme slot (reference impl):** no dedicated component theme slot; the gap color reads
  from the ambient `ColorScheme.surface` (the `composition` theming surface), defaulting to
  `{color.surface}`.
- **Scale mapping:** the reference foundation constants `FlowinDesignSpace.space700` (28px)
  → `{space.700}`; `FlowinDesignBorders.extraBold` (3px) → `{border.extraBold}`;
  `FlowinDesignBorders.bold` (2px) → `{border.bold}`.
- **Legacy names (reference):** `FDColorRadialButton` / `FDColorRadialButton.gradient` —
  byte-identical ring math and the same hard-coded 8-stop sweep (see Known gaps).
- **Tag:** domain/app-specific (a color-selection affordance, not a generic primitive).
- **Conformance:** a theme-only-styling test must prove the default gap color tracks the
  theme surface role, not a widget literal — override the surface role, render a selected
  swatch with no gap-color override, assert the carved gap reflects the override.
</content>
</invoke>
