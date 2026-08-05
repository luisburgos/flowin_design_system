# Component: color-picker-field

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A labelled field for picking a single color, presented as an inline row of selectable
swatches: a custom-color affordance followed by a scrollable strip of predefined swatches.
Exactly one color may be selected at a time, and the selection is communicated outward as
the field's value changes. It is a **domain composition**: the field chrome (stacked label,
bordered surface) comes from the labelled-field primitive and the global theme, while the
picker row owns only the swatch layout. The call site supplies the label, the
predefined palette, an optional initial color, and a change handler — it never styles the
field chrome.

## Anatomy (illustrative)

A labelled field whose content region is a single horizontal swatch row:

```
  label                                                        ← stacked label
┌──────────────────────────────────────────────────────────┐  ← field surface (bordered)
│  ◉  ○  ○  ○  ○  ○  ○  …  ►                          (◍)  │  ← content row (scrolls →)
│  ↑                                                    ↑   │
└──────────────────────────────────────────────────────────┘
   predefined swatch strip (horizontal scroll)      custom swatch
                                                    (pinned right)
```

- **label** — themed text above the field surface. Inherited from the labelled-field
  primitive; the picker contributes none of this chrome.
- **custom swatch** — a circular swatch filled with a rainbow sweep gradient that opens a
  full-spectrum custom-color picker, **pinned to the trailing edge** of the row and
  separated from the strip. It reads as *selected* when the active color is **not** one of
  the predefined swatches.
- **predefined strip** — a horizontally-scrolling row of circular swatches, one per
  palette entry, each separated by a uniform gap. The swatch matching the active color
  reads as *selected*.
- **swatch (selected ring)** — a filled circle; when selected, a gap ring in the field
  surface color is carved out near the edge, leaving a colored outer ring around an inner
  colored disc. There is no platform swatch primitive, so this stacked-circle treatment is
  the reference structure; how the ring is rendered is platform-dependent and not binding.

The custom-color picker surface itself (the full-spectrum picker opened by the custom
swatch) is **platform-native** and outside this contract — only the affordance that opens
it is specified here.

## Variants

This component is single-variant: a labelled color-picker field. The two swatch *roles*
below are intrinsic parts of the one component, not selectable variants.

| Swatch role | Purpose |
|---|---|
| custom | Trailing rainbow-gradient swatch, pinned to the row's far edge; opens the platform custom-color picker. Reads selected when the active color is off-palette. |
| predefined | One swatch per palette entry; selecting it sets the active color to that entry. |

## Sizes

Single-size. The field exposes no `xs`/`sm`/`md` scale; its measures are fixed.

| Measure | Value |
|---|---|
| Content row height | `{space.1000}` (40) |
| Swatch diameter | `{space.700}` (28) |
| Selected ring width | `{border.extraBold}` (3) |
| Selected ring gap width | `{border.bold}` (2) |
| Minimum gap between strip and custom swatch | `{space.400}` (16) |
| Gap between predefined swatches | `{space.400}` (16) |

> The custom swatch is **pinned to the trailing edge**: the strip takes the remaining width
> and the gap grows beyond the minimum when the palette is short.

> The label gap, field padding, and field min-height are owned by the labelled-field
> primitive (see Theming directive), not re-specified per call.

## States

Two state axes apply: per-swatch **selection** and per-swatch interaction.

- **swatch: default · selected** — the active color's swatch shows the carved selection
  ring; all others render as a plain filled disc.
- **swatch: pressed/hovered** — the platform's themed pressable surface overlay on tap;
  the spec does not override it in v1.

The field as a whole has no `disabled` state in the current reference — there is no
mechanism to disable the picker. Only `default` applies at the field level.

## Token bindings (normative)

The field chrome (surface, border, label) is **theme-level**, inherited from the
labelled-field primitive. The picker row binds only the swatch dimensions and the
selection-ring gap color.

| Property | Role / State | Token |
|---|---|---|
| field surface corner radius | field chrome | `{radius.400}` |
| field border color | field chrome | `{color.borderSubtle}` |
| label → surface gap | field chrome | `{space.200}` |
| label text style | field chrome | `{typography.baseline.labelMedium}` |
| label text color | field chrome | `{color.onSurface}` |
| content row height | all swatches | `{space.1000}` |
| swatch diameter | all swatches | `{space.700}` |
| swatch fill | predefined, default | the palette entry color (caller-supplied, untokenized) |
| swatch fill | custom, default | rainbow sweep gradient (intrinsic, untokenized) |
| selection ring width | any, selected | `{border.extraBold}` |
| selection ring gap width | any, selected | `{border.bold}` |
| selection ring gap color | any, selected | `{color.surface}`, **unless** it fails to contrast with the swatch — then the accessible-colour layer's resolved foreground |
| swatch outline | any, swatch ≈ surface | the accessible-colour layer's resolved foreground; absent when the swatch already reads as distinct |
| inter-swatch gap | all swatches | `{space.400}` |

> Swatch fill colors are **data, not theme**: the predefined palette is caller-supplied and
> the custom swatch's gradient is an intrinsic affordance, so neither resolves to a semantic
> color role. The only color role the picker row binds is the selection-ring gap
> (`{color.surface}`), which must match the field surface so the carved ring reads cleanly.

## Behavioral notes

- **Single selection.** At most one color is active. A predefined swatch is selected when
  the active color equals its palette entry; the custom swatch is selected when the active
  color is non-null and **not** present in the palette.
- **Selection compares canonical color values, not color objects.** A color returned by a
  platform picker may carry a wide-gamut color space (e.g. Display P3) while the palette
  entry it came from is sRGB. An identity comparison treats those as different, so every
  predefined color would read as *custom* once it had round-tripped through the picker or
  through storage. Comparison is therefore on the **canonical packed value**, not on the
  color object.
- **Change emission.** Selecting any swatch — predefined or custom — updates the active
  color and notifies the optional change handler with the new color. Absence of a handler
  does not disable selection; the internal selection still updates.
- **Custom-color flow.** Activating the custom swatch opens a platform-native full-spectrum
  picker seeded with the current active color; color changes from that picker stream back
  through the same change path as a predefined selection.
- **Initial color.** An optional initial color seeds the selection; it may be on- or
  off-palette (an off-palette initial color selects the custom swatch).
- **Re-seeding on a new subject.** When the caller supplies a different initial color — for
  example switching to another entity being edited — the selection re-seeds from it.
  The comparison uses the canonical value rule above, so a color that merely round-tripped
  through storage is not treated as a change and does not clobber a color the user is
  actively picking.
- **Overflow.** The predefined strip scrolls horizontally when the palette exceeds the
  available width; the custom swatch stays pinned at the **trailing** edge and never
  scrolls out of reach.
- **A swatch stays visible whatever colour it carries.** The palette is caller-supplied
  data, so an entry may match the field surface — a white swatch on a white surface is a
  real case, not a contrived one. Two guarantees follow, both resolved through the
  contrast layer (see [DESIGN.md §2](../../DESIGN.md#2-theming-model)):
  - **Unselected**, a swatch too close in luminance to the surface carries an outline, so
    it reads as an option rather than a gap in the row.
  - **Selected**, the ring gap must contrast with the swatch. Carving the ring in the
    surface colour alone would paint surface-on-surface-on-surface for such a swatch and
    the selection would be invisible.

  Both apply symmetrically in dark themes, where a near-black swatch fails the same way.
- **Affordance hint.** The custom swatch surfaces a hover/long-press hint distinguishing
  "pick a custom color" from "custom color selected"; the hint text is presentational and
  not tokenized.

## Theming directive

- **Global (theme):** the field chrome — surface corner radius, border color, label gap,
  and label text style — is installed by the **labelled-field primitive** through the global
  card / text theming, and the selection-ring gap reads the global surface role. Overriding
  those global roles re-skins every color-picker field at once. The picker contributes **no dedicated theme slot** of its own.
- **Per-call (resolved at the call site):** the label string, the predefined palette, the
  optional initial color, and the change handler. These are the only concerns the theme
  cannot know per invocation. Swatch diameters and ring widths are fixed by the component,
  not surfaced per call.

## Known gaps / planned fix

- **Near-faithful to the reference.** The contract matches the reference implementation as
  validated, with a single recorded loss: the legacy field exposed an **`id` parameter**
  used purely as a test-key hook (a stable handle for locating the field in tests). The
  modern reference drops it, so there is no caller-supplied test handle on the field.
  Recorded as backlog (`flowin_pm`); not specified here because it carries no visual or
  behavioral binding.
- **No field-level disabled state.** The current reference has no mechanism to disable the
  whole field; only `default` is specified at the field level. Noted as a future enhancement
  rather than a deviation from the reference.

## Transform notes

- **Reference implementation:** `FlowinColorPickerField` (flutter_flowin), composing the
  labelled-field primitive `FlowinInputField` around the inline picker row
  `FlowinInlineColorPicker`; each swatch is a `FlowinColorRadialButton` (with
  `FlowinColorRadialButton.gradient` for the custom-color affordance).
- **Theme slots (reference impl):** none dedicated to the picker. Field chrome resolves
  through the labelled-field primitive's surface (`cardTheme`) and the global `textTheme`
  label role; the custom-color picker surface is provided by a
  platform-native color-picker package outside the theme.
- **Legacy names (reference):** the legacy swatch is `FDColorRadialButton`; the legacy field
  exposed an `id` parameter (test-key hook) dropped in the modern reference — see Known gaps.
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `borderSubtle`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Illustrative anatomy aside (Flutter):** the picker row is a `SizedBox` over a `Row`
  pairing the gradient swatch with an `Expanded` horizontal `ListView.separated` of
  predefined swatches; each swatch is a `Stack` of concentric `DecoratedBox` circles that
  carves the selection ring with a surface-colored gap circle. This structure is
  illustrative only and not part of the binding contract.
- **Stacked layout + trailing custom swatch (2026-08-04).** This contract previously
  specified the **sidebar** field chrome (label column · divider · content) inherited from
  the pre-2026-08-04 [input-field](input-field.md), and placed the custom swatch at the
  **leading** edge. Both now match the shipping product: the label stacks above the surface,
  and the custom swatch is pinned to the trailing edge with the predefined strip leading.
  The legacy package still renders the leading-custom sidebar variant; apps migrating onto
  flutter_flowin adopt the stacked form as part of adoption.
- **Tag:** domain/app-specific. The field is a Flowin product affordance (labelled stacked
  layout + inline swatch picker), not a reusable generic primitive.
- **Conformance:** prove the field chrome (corner radius, border, label style)
  reflects an override of the **global** theme roles rather than per-instance values, and
  prove the selection-ring gap tracks the **global surface** role so a surface override
  re-colors the carved ring. Additionally prove the two visibility guarantees with a
  swatch whose colour matches the surface: that it is outlined when unselected, and that
  its selection ring gap contrasts with it when selected.
