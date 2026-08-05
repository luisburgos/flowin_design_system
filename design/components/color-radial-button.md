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
colored outer **ring** of fixed width separated from a colored inner disc. The gap is
**empty** — nothing is painted in it, so whatever sits behind the swatch shows through.
The reference implementation draws this as a single path with a hole in it (an even-odd
fill) inside a tappable material, rather than composing a native swatch primitive — **the
host framework has no color-swatch widget**. Whether the selected ring is produced by a
holed path, a stroked ring, a clip, or some other primitive is **platform-dependent**; the
spec fixes the *intent* (a tappable color swatch that reads as "selected" via a ringed
treatment whose gap reveals the background), not the drawing math. The custom-color
affordance replaces the flat fill with a full-spectrum sweep across the same circular
shape, clipped to the same holed geometry when selected.

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

Press/hover/focus produce **no visual overlay**. This control deliberately departs from the
platform's themed tappable surface, which the rest of the system inherits: the swatch *is*
the colour value it stands for, so any tint over it misreports that value — and with the
gap carved out, the overlay tints what shows through the gap as well. The tap still
activates; selection is communicated by the ring alone.

## Token bindings (normative)

The diameter, ring width, and gap width default from the design scale. The swatch fill
color is **caller-supplied per-call** (it is the control's payload, not a theme token); the
gradient affordance's spectrum is a fixed set of spectrum stops (see Known gaps). The gap
binds **no color at all** — see the note below the table.

| Property | Variant / State | Token |
|---|---|---|
| fill (swatch) | swatch, all | caller-supplied color (per-call payload; not a token) |
| fill (sweep) | gradient, all | fixed spectrum stops (not tokens; see Known gaps) |
| diameter | all | `{space.700}` (default; per-call overridable) |
| selected-ring width | selected | `{border.extraBold}` |
| gap width | selected | `{border.bold}` |
| gap fill | selected | **none** — the gap is unpainted; the background shows through |
| interaction overlay | pressed / hovered / focused | **none** — splash, highlight and hover suppressed |
| container fill | all | transparent (only the swatch shape paints) |

> **The gap binds no color, and must not be given one.** An earlier revision of this
> contract bound the gap to `{color.surface}`, with a fallback to the contrast layer's
> resolved foreground when the swatch failed to contrast with it. That made the gap's
> colour load-bearing: a swatch matching the surface painted surface-on-surface-on-surface
> and the selection vanished, which is what the fallback existed to patch. Leaving the gap
> **unpainted** removes the failure mode rather than compensating for it — there is nothing
> to contrast against, because the separation comes from whatever the swatch sits on. A
> transform that reintroduces a gap colour (per-call or themed) is **non-conformant**.

## Behavioral notes

- A null/absent activation callback **disables** the control; otherwise a tap fires the
  activation callback. The tap produces **no visual feedback on the swatch** (see States).
- The swatch **color is required** and is the control's payload — it is supplied per-call,
  never resolved from the theme.
- **Selection** is a per-call boolean. Unselected renders a flat filled circle; selected
  carves a concentric gap, leaving a colored ring whose width is `{border.extraBold}`
  separated from the inner disc by an **unpainted** gap of width `{border.bold}`.
- The **gap is transparent** and takes no colour, from the theme or the call site. The ring
  reads against whatever is behind the swatch, so the control stays legible on any
  background — including one that matches the swatch itself.
- Diameter, ring width, and gap width may each be overridden per-call as intrinsic layout
  concerns. The geometry must satisfy *diameter ≥ 2 × (ring width + gap width)*; a diameter
  smaller than that is invalid (the inner disc would have negative size).
- The **gradient** affordance is a distinct construction of the same control: it swaps the
  flat fill for a full-spectrum sweep and otherwise honors the same diameter, selection,
  ring/gap, and activation behavior.

## Theming directive

- **Global (theme slot):** none. The control binds no theme colour role — the swatch fill is
  caller data and the gap is unpainted, so there is nothing for the theme to resolve. A
  transform must **not** add a gap-colour slot to give the theme something to own.
- **Per-call (resolved by the thin widget):** the swatch color (required payload), the
  selected flag, the variant (swatch vs. gradient), and the optional diameter / ring-width /
  gap-width overrides. These are the concerns the theme cannot know per invocation — they
  exist because the framework has no native color-swatch equivalent, not as styling escape
  hatches for roles the theme already owns.

## Known gaps / planned fix

- **Deliberate deviation from the legacy swatch (2026-08-04): the gap is transparent.**
  The ring math (`middle = diameter − 2 × ringWidth`, `inner = middle − 2 × gapWidth`) and
  the default diameter / ring / gap measures are carried over unchanged, so the geometry is
  still faithful. The **composition is not**: the legacy swatch stacked three filled circles
  and painted the gap in the surface colour, which made a swatch matching the surface read
  as unselected. The reference now carves the gap instead of painting it. A conformance pass
  comparing against the legacy package **will** find this difference — it is intended, and
  must not be "corrected" back to the stacked-circle form.
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
  `FlowinColorRadialButton.gradient` constructor for the custom-color affordance — a
  `CustomPainter` drawing an even-odd path inside a tappable `Material` / `InkWell` (the
  framework has no native color-swatch widget). The gradient variant clips a decoration to
  the same holed path. An even-odd fill is preferred over a `BlendMode.clear` punch because
  it needs no saved layer, keeping the swatch cheap enough for a scrolling row. The
  `InkWell`'s `splashColor` / `highlightColor` / `hoverColor` are set transparent: ink is
  painted by the `Material` layer into the swatch's bounds, so with the gap carved out it
  tinted the swatch a moment after a tap.
- **Theme slot (reference impl):** none. The reference resolves **no** colour from the
  theme: the fill is caller data and the gap is unpainted.
- **Scale mapping:** the reference foundation constants `FlowinDesignSpace.space700` (28px)
  → `{space.700}`; `FlowinDesignBorders.extraBold` (3px) → `{border.extraBold}`;
  `FlowinDesignBorders.bold` (2px) → `{border.bold}`.
- **Legacy names (reference):** `FDColorRadialButton` / `FDColorRadialButton.gradient` —
  identical ring math and the same hard-coded 8-stop sweep, but a **painted** surface-coloured
  gap rather than a carved one (see Known gaps).
- **Tag:** domain/app-specific (a color-selection affordance, not a generic primitive).
- **Conformance:** prove the gap is **carved, not painted** — render a selected swatch whose
  colour equals the surrounding background and assert the ring is still distinguishable, and
  assert nothing paints over the swatch to form the gap. The test must fail if the
  stacked-circle composition is reintroduced. Additionally prove the swatch's rendered
  colour is **unchanged by a tap**, so a reintroduced ink overlay is caught.
- **Conformance caveat — structural tests are insufficient here.** Both defects this
  contract now guards against passed a green widget-level suite and were found only by
  running the app: the invisible ring (the test drove a bare swatch rather than the composed
  picker) and the tap-dimming overlay (ink is painted by the platform's material layer, so
  it appears nowhere in the swatch's widget subtree). Conformance for this component should
  compare **rendered output**, not widget structure.
</content>
</invoke>
