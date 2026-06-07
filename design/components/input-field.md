# Component: input-field

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A labelled field row that pairs a fixed-width **label column** with an arbitrary
caller-supplied **field child**, separated by a vertical divider, on a bordered surface.
The input field is a **layout/composition primitive**: it frames the label and the field
content side by side and owns only the surrounding surface (border, corner radius), the
label column's footprint, the divider, and the row's fixed measures. It contributes no
input behavior of its own — the field child (a text entry, a picker, a toggle, etc.)
carries its own contract. The surface shape, border color, label text style, and divider
color come from the global theme — never from the call site. The call site chooses only
the label text, the field child, and the label column's width and alignment.

## Anatomy (illustrative)

A single bordered, transparent-fill surface with smooth (continuous) corners, padded
inside, containing one horizontal row:

```
┌────────────────────────────────────────────────┐  ← bordered surface, fixed min height
│   [ label ]  │  [ field child (expands)      ]  │  ← row: label col · divider · child
└────────────────────────────────────────────────┘
```

- **label column** — a fixed-width box holding the label text, center-aligned by default,
  truncating with an ellipsis when it overflows.
- **divider** — a vertical hairline separating the label column from the field content.
- **field child** — expands to fill the remaining width; its appearance and behavior are
  owned by that content's own contract, not by the input field.

The surface is the one piece the host framework has no native equivalent for (a
side-by-side label layout on a smooth-cornered bordered card), so it is a custom
composition. The internal row structure is the reference layout; how a field child renders
inside the expanding slot is platform-dependent.

## Variants

| Variant | Purpose |
|---|---|
| `field` | The base labelled field: fixed-width label column, divider, and an expanding child slot on a bordered surface. **(default, and only variant)** |

## Sizes

The input field is single-size; it exposes no `xs`/`sm`/`md` scale. Its measures are fixed,
with the **label column width** being the only caller-overridable dimension (see Behavioral
notes).

| Measure | Value |
|---|---|
| Surface min height | `{space.1600}` (64) |
| Content row max height | `{space.1000}` (40) |
| Label column width (default) | `{space.1400}` (56) |
| Surface inner padding (h × v) | `{space.400}` × `{space.300}` (16 × 12) |
| Label ↔ divider ↔ child gap | `{space.250}` (10) |

## States

The input field shell is a **static container**; it has no interaction states of its own
(no `hover` / `pressed` / `focused` / `disabled`). Any interactivity — focus, hover,
error, disabled — belongs to the field child placed in the expanding slot, which carries
its own state contract. Only `default` applies to the shell.

## Token bindings (normative)

The surface paints a transparent fill with a subtle border and smooth corners; the label
is themed text; the divider inherits the subtle border role. All bindings below describe
the **shell**, not the field child.

| Property | Variant / State | Token |
|---|---|---|
| surface corner radius | `field`, default | `{radius.400}` |
| surface corner smoothing | `field`, default | `{radius.cornerSmoothing}` |
| surface background fill | `field`, default | none (transparent — the field contributes no surface color) |
| surface border color | `field`, default | `{color.borderSubtle}` |
| surface border thickness | `field`, default | `{border.regular}` |
| label text style | `field`, default | `{typography.baseline.labelMedium}` |
| label text color | `field`, default | `{color.onSurface}` |
| divider color | `field`, default | `{color.borderSubtle}` |
| divider thickness | `field`, default | `{border.regular}` |
| surface min height | `field`, default | `{space.1600}` |
| content row max height | `field`, default | `{space.1000}` |
| label column width | `field`, default | `{space.1400}` |
| surface inner padding (horizontal) | `field`, default | `{space.400}` |
| surface inner padding (vertical) | `field`, default | `{space.300}` |
| row gap (label ↔ divider ↔ child) | `field`, default | `{space.250}` |

> The field child sits over the transparent surface; the input field does not repaint it.
> The child's foreground, fill, and any focus/error chrome are owned by that content's own
> contract, not by the shell.

## Behavioral notes

- Both a **label** (string) and a **field child** are required; the child fills the
  expanding slot to the right of the label column.
- The label column has a **fixed width** and is **center-aligned** by default. Both the
  width and the text alignment are overridable per call through a single **label-decoration**
  value object; an absent decoration falls back to the default width and center alignment.
- The label text **truncates with an ellipsis** when it exceeds the column width — the
  column never grows to fit the label.
- The row is vertically centered within the surface and clamped to a fixed content height;
  the surface itself holds a fixed minimum height regardless of child content.
- The field child's own contract governs all interaction (focus, value changes,
  validation, disabled). The shell neither intercepts nor styles those.

## Theming directive

- **Global (theme):** the input-field shell has **no dedicated theme slot of its own** — it
  is a composition widget, not a styled primitive. Its visible chrome is read from
  **global roles**: the border and divider colors from the subtle-border role, the label
  text from the label text style and the on-surface foreground role, the corner radius and
  smoothing from the surface-shape roles. Overriding those global roles re-skins every input
  field at once. A field child that is itself a themed text-entry primitive picks up its own
  fill, border, hint, and content padding from the **global text-input styling**, which is
  independent of the shell.
- **Per-call (resolved at the call site):** the label text, the field child, and the label
  column's width and text alignment (via the label-decoration value object). These are the
  only concerns the shell surfaces, because all other styling lives in global roles or in
  the field child's own contract.

## Known gaps / planned fix

- **Faithful to the reference, 1:1.** The shell matches the reference implementation as
  validated — same fixed measures, same border/label/divider role bindings, same
  transparent surface, same default-center label alignment. No behavioral deviation is
  introduced.
- **Label-decoration `copyWith` bugfix (vs. legacy).** The legacy label-decoration value
  object's `copyWith` discarded the receiver's current values, assigning the (nullable)
  arguments directly, so calling it with no arguments **nulled both fields**. The modern
  reference fixes this to the conventional `argument ?? this.field` fallback, so `copyWith`
  is now non-destructive. Recorded as an applied fix, not an outstanding gap.
- **No themed shell slot.** The shell reads its chrome from global color/typography roles
  rather than from a dedicated input-field theme slot, so a conformant transform cannot
  re-skin only the shell without touching the shared roles. Recorded as an accepted
  consequence of the composition approach (`flowin_pm`), not a planned change for v1.

## Transform notes

- **Reference implementation:** `FlowinInputField` (flutter_flowin); the label-decoration
  value object is `FlowinInputFieldLabelDecoration` in the same module.
- **Theme slots (reference impl):** none for the shell itself — it composes `FlowinCard`
  for the surface and reads `colorScheme` / `textTheme` roles directly; there is no
  `inputFieldTheme` binding. A themed text-entry field child resolves through the global
  `inputDecorationTheme` slot, which styles the child, not the shell.
- **Legacy names (reference):** `FDInputField` / `FDInputFieldLabelDecoration`, with the
  companion `FDTextField` placing a collapsed text field into the child slot. The legacy
  `FDInputFieldLabelDecoration.copyWith` is the source of the `copyWith` bug fixed in the
  modern reference (see Known gaps).
- **Illustrative anatomy aside (Flutter):** the shell is a `FlowinCard`
  (`SmoothRectangleBorder` surface) wrapping a fixed-height `SizedBox` over a `Row` of a
  fixed-width `SizedBox` label, a `VerticalDivider`, and an `Expanded` child. This structure
  is illustrative only and not part of the binding contract.
- **Tag:** generic-primitive.
- **Conformance:** the shell carries border/label/divider bindings that resolve through
  shared global roles; a conformance check should prove the dimensional contract (fixed min
  height, content row height, default label column width, inner padding, row gap), that the
  border and divider colors reflect an override of the **global** subtle-border role rather
  than per-instance values, and that the label-decoration `copyWith` is non-destructive when
  called with no arguments.
