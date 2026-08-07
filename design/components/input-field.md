# Component: input-field

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A labelled field: a **label stacked above** an arbitrary caller-supplied **field child**,
on a bordered surface. The input field is a **layout/composition primitive** — it frames
the label and the field content and owns only the label's text style, the gap beneath it,
and the surrounding surface (border, corner radius, inner padding). It contributes no
input behavior of its own: the field child (a text entry, a picker, a toggle, a swatch
row, etc.) carries its own contract. The surface shape, border color, and label text style
come from the global theme — never from the call site. The call site chooses only the
label text and the field child.

This is the **generic** form of [labeled-text-field](labeled-text-field.md), which is a
thin convenience that fills the child slot with a [text-field](text-field.md).

## Anatomy (illustrative)

A label, then a bordered surface holding the field child:

```
  label                                             ← themed label text
┌────────────────────────────────────────────────┐  ← bordered surface, smooth corners
│  [ field child ]                               │  ← the caller's content, padded
└────────────────────────────────────────────────┘
```

- **label** — themed text above the surface, truncating with an ellipsis when it overflows.
- **field child** — fills the surface's padded content area; its appearance and behavior
  are owned by that content's own contract, not by the input field.

The surface is the one piece the host framework has no native equivalent for (a
smooth-cornered bordered card wrapping arbitrary content), so it is a custom composition.
How a field child renders inside the content slot is platform-dependent.

## Variants

| Variant | Purpose |
|---|---|
| `field` | The base labelled field: a label above a bordered surface wrapping an arbitrary child. **(default, and only variant)** |

## Sizes

The input field is single-size; it exposes no `xs`/`sm`/`md` scale.

| Measure | Value |
|---|---|
| Label → surface gap | `{space.200}` (8) |
| Surface min height | `{space.1600}` (64) |
| Content max height | `{space.1000}` (40) |
| Surface inner padding (h × v) | `{space.400}` × `{space.300}` (16 × 12) |

## States

The input field shell is a **static container**; it has no interaction states of its own
(no `hover` / `pressed` / `focused` / `disabled`). Any interactivity — focus, hover,
error, disabled — belongs to the field child placed in the content slot, which carries
its own state contract. Only `default` applies to the shell.

## Token bindings (normative)

The surface paints a transparent fill with a subtle border and smooth corners; the label
is themed text. All bindings below describe the **shell**, not the field child.

| Property | Variant / State | Token |
|---|---|---|
| surface corner radius | `field`, default | `{radius.400}` |
| surface corner smoothing | `field`, default | `{radius.cornerSmoothing}` |
| surface background fill | `field`, default | none (transparent — the field contributes no surface color) |
| surface border color | `field`, default | `{color.borderSubtle}` |
| surface border thickness | `field`, default | `{border.regular}` |
| label text style | `field`, default | `{typography.baseline.labelMedium}` |
| label text color | `field`, default | `{color.onSurface}` |
| label → surface gap | `field`, default | `{space.200}` |
| surface min height | `field`, default | `{space.1600}` |
| content max height | `field`, default | `{space.1000}` |
| surface inner padding (horizontal) | `field`, default | `{space.400}` |
| surface inner padding (vertical) | `field`, default | `{space.300}` |

> The field child sits over the transparent surface; the input field does not repaint it.
> The child's foreground, fill, and any focus/error chrome are owned by that content's own
> contract, not by the shell.

## Behavioral notes

- A **field child** is required. The **label is optional**: with no label the component
  renders the bordered surface alone, which is how a caller frames content that is already
  self-describing.
- The label sits **above** the surface, separated by the label → surface gap, and
  **truncates with an ellipsis** when it exceeds the available width.
- The child is **arbitrary**: any widget may occupy the content slot, and the input field
  neither styles nor constrains it beyond the surface's padding and content max height.
- The surface holds a fixed minimum height regardless of child content.
- The field child's own contract governs all interaction (focus, value changes,
  validation, disabled). The shell neither intercepts nor styles those.

## Theming directive

- **Global (theme):** the input-field shell has **no dedicated theme slot of its own** — it
  is a composition widget, not a styled primitive. Its visible chrome is read from
  **global roles**: the border color from the subtle-border role, the label text from the
  label text style and the on-surface foreground role, the corner radius and smoothing from
  the surface-shape roles. Overriding those global roles re-skins every input field at once.
  A field child that is itself a themed text-entry primitive picks up its own fill, border,
  hint, and content padding from the **global text-input styling**, which is independent of
  the shell.
- **Per-call (resolved at the call site):** the label text, the field child, and whether
  the shell draws its **surface**. These are the only concerns the shell surfaces, because
  all other styling lives in global roles or in the field child's own contract.
- **The surface can be suppressed.** A child that already draws its own chrome — most
  importantly a themed text entry, which carries the field border and fill from the global
  input theming mechanism — would otherwise be wrapped in a second border. Suppressing the
  surface is therefore a composition concern, not a styling override: it selects *which*
  layer owns the chrome, rather than changing what the chrome looks like. With the surface
  suppressed, the surface bindings below (background, border, radius, smoothing, min height,
  content max height, inner padding) do not apply; the label bindings and the stacked
  label-above-child layout still do. This is the composition
  [labeled-text-field](labeled-text-field.md) uses.

## Known gaps / planned fix

- **No themed shell slot.** The shell reads its chrome from global color/typography roles
  rather than from a dedicated input-field theme slot, so a conformant transform cannot
  re-skin only the shell without touching the shared roles. Recorded as an accepted
  consequence of the composition approach (`flowin_pm`), not a planned change for v1.

## Transform notes

- **Reference implementation:** `FlowinInputField` (flutter_flowin).
- **Theme slots (reference impl):** none for the shell itself — it composes `FlowinCard`
  for the surface and reads `colorScheme` / `textTheme` roles directly; there is no
  `inputFieldTheme` binding. A themed text-entry field child resolves through the global
  `inputDecorationTheme` slot, which styles the child, not the shell.
- **Sidebar layout removed (2026-08-04).** This contract previously specified a
  **sidebar**: a fixed-width label column beside a vertical divider, with the child
  expanding alongside it. That arrangement is no longer part of the design system in any
  component — stacked (label-above) is now the only labelled-field shape.
  [labeled-text-field](labeled-text-field.md) had already dropped the sidebar, leaving this
  contract as the last place it was specified, and the shipping product had already moved
  to stacked. Removing it here also closes the "if a sidebar arrangement is ever needed it
  would be a separate variant" escape hatch that legitimised keeping it.
  - **Removed measures:** label column width `{space.1400}`, label ↔ divider ↔ child gap
    `{space.250}`, and the vertical-divider color and thickness bindings.
  - **Consequence:** the label-decoration value object (label column width and text
    alignment) has nothing left to configure and leaves the API, along with the
    non-destructive-`copyWith` fix that only ever applied to it.
  - The legacy package still ships the sidebar. That is expected: apps migrating onto
    flutter_flowin drop the removed arrangement as part of adoption.
- **Legacy names (reference):** `FDInputField` was the legacy *stacked* labelled field and
  maps to [labeled-text-field](labeled-text-field.md), **not** to this component — pairing
  the two by name compares different contracts. This component has no legacy predecessor;
  it generalises the stacked layout to an arbitrary child.
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `borderSubtle`, `cornerSmoothing`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Illustrative anatomy aside (Flutter):** the shell is a `Column` of a `Text` label and a
  `FlowinCard` (`SmoothRectangleBorder` surface) wrapping the child. This structure is
  illustrative only and not part of the binding contract.
- **Tag:** generic-primitive.
- **Conformance:** a layout test must prove the label renders **above** the surface
  (vertical order); a theme-only-styling test must prove the surface border and label style
  reflect an override of the **global** roles rather than per-instance values; and the
  dimensional contract (label gap, surface min height, content max height, inner padding)
  must be pinned.
