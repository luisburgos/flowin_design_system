# Component: color-picker-field

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A labelled field for picking a single color, presented as an inline row of selectable
swatches: a custom-color affordance followed by a scrollable strip of predefined swatches.
Exactly one color may be selected at a time, and the selection is communicated outward as
the field's value changes. It is a **domain composition**: the field chrome (label column,
divider, bordered surface) comes from the labelled-field primitive and the global theme,
while the picker row owns only the swatch layout. The call site supplies the label, the
predefined palette, an optional initial color, and a change handler — it never styles the
field chrome.

## Anatomy (illustrative)

A labelled field whose content region is a single horizontal swatch row:

```
┌──────────────────────────────────────────────────────────┐  ← field surface (bordered)
│            │                                               │
│   label    │  (◍)   ◉  ○  ○  ○  ○  ○  ○  ○  ○  …  ►        │  ← content row (scrolls →)
│            │   ↑         ↑                                  │
└──────────────────────────────────────────────────────────┘
   label col  │  custom    predefined swatch strip (horizontal scroll)
              │  swatch
            divider
```

- **label column** — a fixed-width label beside a vertical divider, on the field surface.
  Inherited from the labelled-field primitive; the picker contributes none of this chrome.
- **custom swatch** — a leading circular swatch filled with a rainbow sweep gradient that
  opens a full-spectrum custom-color picker. It reads as *selected* when the active color
  is **not** one of the predefined swatches.
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
| custom | Leading rainbow-gradient swatch; opens the platform custom-color picker. Reads selected when the active color is off-palette. |
| predefined | One swatch per palette entry; selecting it sets the active color to that entry. |

## Sizes

Single-size. The field exposes no `xs`/`sm`/`md` scale; its measures are fixed.

| Measure | Value |
|---|---|
| Content row height | `{space.1000}` (40) |
| Swatch diameter | `{space.700}` (28) |
| Selected ring width | `{border.extraBold}` (3) |
| Selected ring gap width | `{border.bold}` (2) |
| Gap between custom swatch and strip | `{space.400}` (16) |
| Gap between predefined swatches | `{space.400}` (16) |

> Label-column width, field padding, and field min-height are owned by the labelled-field
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
| divider color (label ↔ content) | field chrome | `{color.borderSubtle}` |
| label text style | field chrome | `{typography.baseline.labelMedium}` |
| label text color | field chrome | `{color.onSurface}` |
| content row height | all swatches | `{space.1000}` |
| swatch diameter | all swatches | `{space.700}` |
| swatch fill | predefined, default | the palette entry color (caller-supplied, untokenized) |
| swatch fill | custom, default | rainbow sweep gradient (intrinsic, untokenized) |
| selection ring width | any, selected | `{border.extraBold}` |
| selection ring gap width | any, selected | `{border.bold}` |
| selection ring gap color | any, selected | `{color.surface}` |
| inter-swatch gap | all swatches | `{space.400}` |

> Swatch fill colors are **data, not theme**: the predefined palette is caller-supplied and
> the custom swatch's gradient is an intrinsic affordance, so neither resolves to a semantic
> color role. The only color role the picker row binds is the selection-ring gap
> (`{color.surface}`), which must match the field surface so the carved ring reads cleanly.

## Behavioral notes

- **Single selection.** At most one color is active. A predefined swatch is selected when
  the active color equals its palette entry; the custom swatch is selected when the active
  color is non-null and **not** present in the palette.
- **Change emission.** Selecting any swatch — predefined or custom — updates the active
  color and notifies the optional change handler with the new color. Absence of a handler
  does not disable selection; the internal selection still updates.
- **Custom-color flow.** Activating the custom swatch opens a platform-native full-spectrum
  picker seeded with the current active color; color changes from that picker stream back
  through the same change path as a predefined selection.
- **Initial color.** An optional initial color seeds the selection; it may be on- or
  off-palette (an off-palette initial color selects the custom swatch).
- **Overflow.** The predefined strip scrolls horizontally when the palette exceeds the
  available width; the custom swatch stays pinned at the leading edge.
- **Affordance hint.** The custom swatch surfaces a hover/long-press hint distinguishing
  "pick a custom color" from "custom color selected"; the hint text is presentational and
  not tokenized.

## Theming directive

- **Global (theme):** the field chrome — surface corner radius, border color, label↔content
  divider color, and label text style — is installed by the **labelled-field primitive**
  through the global card / divider / text theming, and the selection-ring gap reads the
  global surface role. Overriding those global roles re-skins every color-picker field at
  once. The picker contributes **no dedicated theme slot** of its own.
- **Per-call (resolved at the call site):** the label string, the predefined palette, the
  optional initial color, the change handler, and the label-column layout (width /
  alignment). These are the only concerns the theme cannot know per invocation. Swatch
  diameters and ring widths are fixed by the component, not surfaced per call.

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
  through the labelled-field primitive's surface (`cardTheme`), `dividerTheme`, and the
  global `textTheme` label role; the custom-color picker surface is provided by a
  platform-native color-picker package outside the theme.
- **Legacy names (reference):** the legacy swatch is `FDColorRadialButton`; the legacy field
  exposed an `id` parameter (test-key hook) dropped in the modern reference — see Known gaps.
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `borderSubtle`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Illustrative anatomy aside (Flutter):** the picker row is a `SizedBox` over a `Row`
  pairing the gradient swatch with an `Expanded` horizontal `ListView.separated` of
  predefined swatches; each swatch is a `Stack` of concentric `DecoratedBox` circles that
  carves the selection ring with a surface-colored gap circle. This structure is
  illustrative only and not part of the binding contract.
- **Tag:** domain/app-specific. The field is a Flowin product affordance (labelled
  side-by-side layout + inline swatch picker), not a reusable generic primitive.
- **Conformance:** prove the field chrome (corner radius, border, divider, label style)
  reflects an override of the **global** theme roles rather than per-instance values, and
  prove the selection-ring gap tracks the **global surface** role so a surface override
  re-colors the carved ring.
