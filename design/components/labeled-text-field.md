# Component: labeled-text-field

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A **convenience composition** that pairs a label with a [text-field](text-field.md): the
label sits **above** the field in a vertical stack. It is an opt-in shorthand for the common
labeled-input pattern; callers who need a different arrangement compose the parts directly.

## Anatomy (illustrative)

A vertical column: a label on top, the text field beneath it, separated by a small fixed
gap. The field itself is the standard [text-field](text-field.md); this component adds only
the label and the stacking.

> *Design note (intentional divergence):* the legacy reference bundled the label as a
> **leading sidebar** (label beside the field). v1 deliberately adopts a **stacked**
> (label-above) layout — the conventional form arrangement — rather than the legacy sidebar.
> The sidebar look is not carried forward.

## Variants

No emphasis variants. The single composition is label-above-field.

| Variant | Purpose |
|---|---|
| (single) | Label stacked above a text field. **(only form)** |

## Sizes

No per-call size scale. The field carries its own [text-field](text-field.md) dimensions;
this component adds only the label text style and the inter-element gap.

| Size | Notable dimensions |
|---|---|
| (single) | label `{typography.baseline.labelMedium}`; label→field gap `{space.200}` (8); field per [text-field](text-field.md) |

## States

The component itself has no interaction state; state lives in the composed
[text-field](text-field.md) (`default` · `focused` · `disabled` · `error`). The label is
static text.

## Token bindings (normative)

The field's chrome is inherited from the [text-field](text-field.md) theme; this component
binds only the label's text style and the gap between label and field.

| Property | State | Token |
|---|---|---|
| label text style | all | `{typography.baseline.labelMedium}` |
| label color | all | `{color.onSurface}` |
| label → field gap | all | `{space.200}` (8) |
| field chrome | all | inherited from [text-field](text-field.md) |

## Behavioral notes

- **Label above the field.** The label renders on its own line above the field; this is a
  vertical stack, not a leading sidebar.
- **Pass-through.** Field behavior (controller, hint, formatters, enabled/disabled, change
  callbacks) is forwarded to the composed [text-field](text-field.md) unchanged — this
  component adds presentation only, not new field behavior.
- **Optional label.** When no label is supplied the component degenerates to a plain field
  (no empty label row).
- **Opt-in.** This is a convenience; it is not required to use a label with a text field.

## Theming directive

- **Global (theme slot):** all field chrome (border, radius, hint style, etc.) comes from
  the [text-field](text-field.md) / input theming — never set per-instance here. The label
  text style resolves from the global text theme.
- **Per-call (resolved by the thin widget):** the label string, the stacked layout and gap,
  and the forwarded field configuration. These are the only concerns the theme cannot know
  per invocation.

## Known gaps / planned fix

- **Sidebar layout not carried forward (intentional).** The legacy bundled-label *sidebar*
  (label beside the field) is replaced by a **stacked** (label-above) layout by design. If a
  sidebar arrangement is ever needed it would be a separate variant, not this component.

## Transform notes

- **Reference implementation:** `FlowinLabeledTextField` (flutter_flowin), composing a label
  and `FlowinTextField` in a `Column`.
- **Theme slots (reference impl):** the text-field's input theming (field chrome) plus the
  global `textTheme` (label style). No dedicated slot for the composition itself.
- **Legacy names (reference):** the legacy bundled-label text field used a leading label
  sidebar; v1 restores a labeled field as an opt-in convenience but **stacked**, not as a
  sidebar (audit: Med · TextField).
- **Tag:** generic-primitive.
- **Conformance:** a layout test must prove the label renders **above** the field (vertical
  order); a theme-only-styling test must prove the field chrome still comes from the
  text-field theme, not this widget.
