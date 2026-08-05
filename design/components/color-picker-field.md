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
- **swatch (selected ring)** — a filled circle; when selected, an **unpainted** gap ring is
  carved out near the edge, leaving a colored outer ring around an inner colored disc. The
  field surface shows through the gap rather than being painted into it. There is no
  platform swatch primitive; how the ring is rendered is platform-dependent and not binding,
  but that the gap reveals the background rather than covering it **is** binding (see
  [color-radial-button](color-radial-button.md)).

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
- **swatch: pressed/hovered** — **no visual overlay.** Unlike the rest of the system, a
  swatch does not take the platform's pressable tint: the swatch is the colour value itself,
  so tinting it misreports the value (see Token bindings). The tap still activates.

The field as a whole has no `disabled` state in the current reference — there is no
mechanism to disable the picker. Only `default` applies at the field level.

## Token bindings (normative)

The field chrome (surface, border, label) is **theme-level**, inherited from the
labelled-field primitive. The picker row binds only the swatch dimensions and the
separation shadow; it binds no swatch colour at all.

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
| selection ring gap fill | any, selected | **none** — unpainted; the background shows through |
| swatch separation shadow | all swatches | `shadow10` — themed against the scheme in dark mode |
| swatch interaction overlay | all swatches | **none** — splash/highlight/hover suppressed |
| inter-swatch gap | all swatches | `{space.400}` |

> Swatch fill colors are **data, not theme**: the predefined palette is caller-supplied and
> the custom swatch's gradient is an intrinsic affordance, so neither resolves to a semantic
> color role. The picker row binds **no color role at all** for the swatches — the selection
> ring's gap is unpainted (see [color-radial-button](color-radial-button.md)), so there is
> no gap colour for the picker to resolve, per-swatch or otherwise.

> **No interaction overlay on a swatch.** A swatch *is* the colour value it stands for, so a
> pressed/hover tint misreports that value — and with the gap carved out, the platform's ink
> overlay tints what shows through the gap as well. Suppressed rather than restyled;
> selection is communicated by the ring. This is a deliberate departure from the platform's
> default pressable behaviour, which the rest of the system inherits.

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
  real case, not a contrived one. Two guarantees follow, and **neither needs a colour
  resolved for it**:
  - **Unselected**, the hairline separation shadow every swatch already carries is what
    keeps it readable — a swatch matching the surface still reads as a disc because the
    shadow draws its edge. No swatch takes a border of its own; adding one on top of the
    shadow would double the treatment.
  - **Selected**, the ring gap is **unpainted**, so the ring reads against whatever is
    behind the swatch. A swatch matching the surface still shows its ring, because the
    separation comes from the background itself rather than from a colour chosen to
    contrast with the swatch.

  Both apply symmetrically in dark themes, where a near-black swatch fails the same way.

  The **custom swatch needs no exemption**: with no gap colour to resolve, there is no rule
  it could be wrongly subjected to. (An earlier revision had to exempt it, because
  resolving contrast against its *selection seed* — which is not a rendered fill — made it
  read as selected when it was not.)

  Neither guarantee requires the picker to know which swatch is which. The gap belongs
  entirely to the swatch primitive; the picker contributes only the separation shadow.
- **Affordance hint.** The custom swatch surfaces a hover/long-press hint distinguishing
  "pick a custom color" from "custom color selected"; the hint text is presentational and
  not tokenized.

## Theming directive

- **Global (theme):** the field chrome — surface corner radius, border color, label gap,
  and label text style — is installed by the **labelled-field primitive** through the global
  card / text theming. Overriding those global roles re-skins every color-picker field at
  once. The picker contributes **no dedicated theme slot** of its own, and the swatches bind
  no theme colour: their fills are caller data and the selection gap is unpainted.
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
  predefined swatches; each swatch paints an even-odd path whose hole forms the selection
  gap. This structure is illustrative only and not part of the binding contract — but that
  the gap is *carved rather than painted* **is** binding.
- **Stacked layout + trailing custom swatch (2026-08-04).** This contract previously
  specified the **sidebar** field chrome (label column · divider · content) inherited from
  the pre-2026-08-04 [input-field](input-field.md), and placed the custom swatch at the
  **leading** edge. Both now match the shipping product: the label stacks above the surface,
  and the custom swatch is pinned to the trailing edge with the predefined strip leading.
  The legacy package still renders the leading-custom sidebar variant; apps migrating onto
  flutter_flowin adopt the stacked form as part of adoption.
- **Tag:** domain/app-specific. The field is a Flowin product affordance (labelled stacked
  layout + inline swatch picker), not a reusable generic primitive.
- **Conformance:** prove the field chrome (corner radius, border, label style) reflects an
  override of the **global** theme roles rather than per-instance values. Prove the
  visibility guarantees with a swatch whose colour matches the surface: that it still reads
  as a disc when unselected (the separation shadow), that its selection ring is still
  visible when selected (the carved gap), and that selecting it leaves the custom swatch
  neither selected nor visually distinguished. Prove no gap colour is resolved anywhere —
  a transform that reintroduces one is non-conformant.
- **Conformance (rendered, not structural).** The swatch guarantees above must be proven
  against **rendered output**, not the widget tree. Two defects shipped past green
  structural suites here: an invisible selection ring (the test drove a bare swatch, not
  the composed picker) and an interaction overlay dimming the swatch (ink is painted by the
  platform's material layer, so no widget in the swatch's subtree reveals it). Both were
  found only by running the app.
