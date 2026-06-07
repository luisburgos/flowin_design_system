# Component: divider

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A thin rule that separates content into groups along one axis. The divider carries no
interaction and no label — it expresses only a visual break. Its color, thickness, and the
extent it reserves come from the global theme; the call site does not style it. This is a
**theme-only** contract: there is no thin wrapper widget, and the host's native divider
primitive is styled wholesale by the theme.

## Anatomy (illustrative)

A single hairline rule centered within a reserved extent (a leading/trailing gap on the
axis perpendicular to the line, so the line does not abut adjacent content). The reference
implementation does not draw a bespoke rule or ship a wrapper widget — it styles the host
platform's native divider primitive directly through the global theme.

> *Illustrative aside (one platform):* in Flutter the rendered element is the framework's
> `Divider` (and, where a vertical rule is needed, `VerticalDivider`), styled entirely by
> the `DividerThemeData` theme slot. There is no `FlowinDivider` widget in the modern
> reference.

## Variants

| Variant | Purpose |
|---|---|
| `horizontal` | A rule that runs left-to-right, separating stacked content. **(default — the only themed variant)** |

> A vertical orientation is a documented gap, not a current variant — see *Known gaps*.

## Sizes

The divider has no size scale. The reserved extent and thickness are fixed by the theme and
do not vary per call.

| Size | Notable dimensions |
|---|---|
| (single) | reserved extent `{space.50}` (2px); rule thickness `{border.regular}` (1px) |

## States

`default` only. A divider is non-interactive and carries no hover / pressed / focused /
disabled states.

## Token bindings (normative)

Color, thickness, and reserved extent are **theme-level** and apply to every divider.
Nothing is resolved per call.

| Property | State | Token |
|---|---|---|
| line color | default | `{color.borderSubtle}` |
| line thickness | default | `{border.regular}` |
| reserved extent (gap along the cross axis) | default | `{space.50}` |

## Behavioral notes

- The divider is purely decorative: it accepts no activation callback and reserves no
  semantics beyond a visual separator.
- The reserved extent is the *total* space the divider occupies on its cross axis; the
  hairline is centered within it, leaving symmetric breathing room on both sides.
- It stretches to fill the available length on its main axis; it has no intrinsic length.

## Theming directive

- **Global (theme slot):** line color, line thickness, and reserved extent. A conformant
  transform installs these on the platform's global divider theming mechanism. They must be
  **globally overridable, not per-instance.**
- **Per-call:** nothing. The call site neither selects a variant nor passes styling; placing
  a divider is the entire API surface. (The legacy reference exposed optional per-instance
  `color` / `thickness` overrides; the modern theme-only contract drops them — see
  *Known gaps*.)

## Known gaps / planned fix

- **No vertical divider (Med).** The contract themes only the horizontal rule. The legacy
  reference shipped a separate vertical primitive; the modern theme slot has a single
  channel that governs the horizontal rule's reserved extent and offers **no separate
  vertical-extent channel**. A vertical orientation and its own extent channel are
  backlog, not specified here (track in `flowin_pm`).
- The legacy reference exposed optional per-instance `color` / `thickness` overrides; these
  are intentionally absent from the theme-only contract (styling is global). Recorded, not
  reintroduced here.

## Transform notes

- **Reference implementation:** none — this is a theme-only contract with **no thin
  widget**. The host's native divider primitive is themed directly.
- **Theme slot (reference impl):** `dividerTheme` (`DividerThemeData`), with `color`,
  `thickness`, and `space` mapping to line color, line thickness, and reserved extent
  respectively.
- **Legacy names (reference):** `FDDivider` (wrapping `Divider`, `height: space50`) and
  `FDVerticalDivider` (wrapping `VerticalDivider`, `width: space50`), both defaulting the
  line color to `outlineVariant` and accepting optional `color` / `thickness` overrides.
- **Color role note:** the reference slot binds `colorScheme.outlineVariant`; in agnostic
  token terms this is the neutralized low-emphasis border role `{color.borderSubtle}`
  (both resolve to the same neutral step).
- **Audit:** faithful — color, thickness, and reserved extent are reproduced from the
  reference. Known gap: no vertical divider + no separate vertical-extent theme channel
  (Med).
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove line color, thickness, and reserved
  extent come from the theme, not a call site — override the slot, render a divider, assert
  it reflects the override.
