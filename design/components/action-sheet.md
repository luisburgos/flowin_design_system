# Component: action-sheet

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A transient surface that rises from the bottom edge of the screen to present a focused,
self-contained task — a titled header, an optional body, and an optional footer of
actions — over a dimmed scrim that blocks the content beneath. It is a **composition /
container primitive**: it owns the floating card surface, its corner radius, the screen
inset around it, and the internal rhythm between header, body, and footer; it does **not**
style the content placed in its slots (each slot's content carries its own contract). The
call site chooses only *what* goes in the header, body, and footer and whether a close
affordance is shown — never the surface, radius, or spacing.

## Anatomy (illustrative)

A rounded card floated above the bottom edge, inset from all four screen edges, sitting on
a dimmed full-screen scrim:

```
        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       ← scrim (dimmed barrier)
        ┌──────────────────────────────────┐  ╮
        │  Title                       (✕)  │  │    ← header: title/icon + close
        │  Subtitle (only with header icon) │  │
        │                                   │  │
        │  [ body content ]                 │  ├──  card surface, rounded corners
        │                                   │  │
        │  [ left action ] [ right action ] │  │    ← footer: equal-width columns
        └──────────────────────────────────┘  ╯
                  (inset from bottom + sides)
```

- **scrim** — a dimmed, tappable barrier that fills the screen behind the card and
  dismisses the sheet when tapped outside it.
- **card** — the floating surface. It is **inset from all four edges** (larger inset at the
  top so the card clears the status region; a smaller inset at the bottom) rather than
  flush to the bottom, so it reads as a detached card, not a docked tray.
- **header** — a leading title (or a header icon in its place) and a trailing close
  control. When a header icon is supplied, the title moves below it and an optional
  subtitle appears beneath the title.
- **body** — optional caller content, horizontally inset.
- **footer** — optional caller actions laid out as equal-width columns (an optional left
  action and a primary right action).

The exact rendering of the scrim, the rise animation, and how the card is floated are
**platform-dependent**; the binding contract fixes the card's surface, radius, edge insets,
and internal spacing, not the presentation mechanics.

## Variants

The action sheet is single-variant; the header **reshapes** based on whether a header icon
is supplied, but this is one component, not a variant axis.

| Variant | Purpose |
|---|---|
| `sheet` | The base action sheet: header (title + close) over an optional body and optional footer, on a floating card surface. **(default)** |

## Sizes

The action sheet is single-size; it exposes no `xs`/`sm`/`md` scale. Its width fills the
available screen width (minus the side insets) and its height hugs its content. The
measures below are fixed.

| Measure | Value |
|---|---|
| Card corner radius | `{radius.1000}` (40) |
| Edge inset — top | `{space.800}` (32) |
| Edge inset — bottom | `{space.600}` (24) |
| Edge inset — left / right | `{space.400}` (16) |
| Card inner bottom padding | `{space.600}` (24) |
| Gap between header / body / footer | `{space.400}` (16) |
| Header top / left / right padding | `{space.600}` (24) |
| Body & footer horizontal padding | `{space.600}` (24) |
| Footer column gap | `{space.300}` (12) |
| Close control square side | `{size.control.xs}` (32) |
| Close control icon size | `{size.icon.sm}` (16) |

## States

The action sheet is a **static container**; it has no interaction states of its own
(no `hover` / `pressed` / `focused` / `disabled`). Only `default` applies to the surface.
The close control and any footer actions carry their own state contracts (see the
icon-button and button contracts). The scrim has two presentation phases —
**present** and **dismiss** — but these are transitions, not styled states.

## Token bindings (normative)

The card surface, its radius, the edge insets, and the internal spacing are the bar's own
bindings. The header text styles bind to typography roles; the close control inherits the
tonal icon-button color roles from its own contract. The sheet paints **no border** and
applies **no fill of its own to the slot content**.

| Property | Variant / State | Token |
|---|---|---|
| card background | `sheet`, default | `{color.surface}` |
| card corner radius | `sheet`, default | `{radius.1000}` |
| edge inset — top | `sheet`, default | `{space.800}` |
| edge inset — bottom | `sheet`, default | `{space.600}` |
| edge inset — left / right | `sheet`, default | `{space.400}` |
| card inner bottom padding | `sheet`, default | `{space.600}` |
| header / body / footer gap | `sheet`, default | `{space.400}` |
| header top / left / right padding | `sheet`, default | `{space.600}` |
| body & footer horizontal padding | `sheet`, default | `{space.600}` |
| footer column gap | `sheet`, default | `{space.300}` |
| title text style | `sheet`, default | `{typography.baseline.headlineSmall}` |
| subtitle text style | `sheet`, default | `{typography.baseline.bodyLarge}` |
| subtitle foreground | `sheet`, default | `{color.onSurfaceVariant}` |
| close control background | `sheet`, default | `{color.surfaceSecondary}` (tonal icon button) |
| close control foreground | `sheet`, default | `{color.onSurfaceSecondary}` (tonal icon button) |
| close control icon size | `sheet`, default | `{size.icon.sm}` |
| scrim barrier | `sheet`, default | host default scrim (caller-overridable; see Behavioral notes) |

> The body content sits over the card's `{color.surface}`; the sheet does not repaint it.
> Title foreground and body/footer foreground are owned by their own content / typography
> roles, not re-tinted by the sheet.

## Behavioral notes

- The sheet is **presented imperatively** via a helper that floats the card over a modal
  scrim and returns a result when the sheet is dismissed; a companion affordance pops the
  current sheet.
- **Tapping the scrim dismisses** the sheet. The close control, when shown, also dismisses
  it; a caller may override the close handler to run custom logic instead of the default
  dismiss.
- The **header reshapes around the header icon**: with no icon, the title is the leading
  element on the header row and the subtitle renders **below** it. With an icon, the icon
  becomes the leading header element and the title (and optional subtitle) drop below it.
  **A supplied subtitle always renders, with or without a header icon** — only its
  arrangement relative to the title changes.
- The **close control is optional** (shown by default) and is a tonal icon button bearing
  a close glyph.
- **Why the subtitle is not gated on the icon.** An earlier shape rendered the subtitle only
  as a sibling of the demoted title, so an icon-less sheet silently dropped a subtitle the
  caller had supplied. Dropping caller content because an unrelated slot is empty is a
  defect, not a layout rule — a transform must render a supplied subtitle in both
  arrangements. Recorded because a conformance pass against the legacy source will find this
  difference and it is intended.
- **The card's width is clamped.** It fills the available width minus the side insets, up to
  a maximum of **480**. Beyond that the sheet stops growing and stays centered, so the
  layout does not stretch to full width on a tablet or desktop viewport.
- The **footer lays out as equal-width columns**: an optional left action and a required
  right action each take an equal share of the footer width, separated by the footer
  column gap. With no left action, the right action still occupies its single column.
- **Body and footer are both optional**; an absent slot is omitted entirely (no reserved
  space) and the inter-slot gap collapses with it.
- The scrim is **scroll-aware**: the sheet is presented so its content can grow and
  scroll within the screen rather than being clipped to a fixed fraction.

## Theming directive

- **Global (theme slot):** the **modal scrim surface** — its background and the top corner
  radius of the docked-sheet shape — is installed on the platform's global bottom-sheet
  theming mechanism and is **globally overridable, not per-instance**. The header **title /
  subtitle text styles** resolve from the global typography roles, and the close control's
  **color roles** resolve from the global tonal icon-button styling — overriding those roles
  re-skins every action-sheet header at once.
- **Per-call (resolved at the call site):** the header title, optional subtitle, optional
  header icon; whether the close control is shown and its override handler; the body and
  footer content; and the scrim barrier override. The card surface, radius, edge insets,
  and internal spacing are fixed by the contract and are **not** call-site concerns.

> Note: the floating **card** surface (`{color.surface}`) and its `{radius.1000}` corner
> radius are supplied by the sheet's own card composition, *distinct* from the global
> bottom-sheet scrim shape. The scrim shape is what the global theme slot installs; the
> floating card is the sheet's own surface and is not theme-overridable in the current
> shape (recorded under Known gaps).

## Known gaps / planned fix

- _(Closed 2026-08-06, audit unit "action-sheet".)_ **Close control footprint (audit H4)**
  is fixed: the close control is pinned to `{size.control.xs}` (32×32), matching the
  validated intent. The Sizes table above now states 32 directly.
- _(Closed 2026-08-06, audit unit "action-sheet".)_ **Presentation helper dropped
  parameters (audit H5)** is fixed: the present helper accepts size constraints, an
  explicit background color, and a clip-behavior override, alongside the scrim-barrier and
  scroll-control flags. All three are honored and tested.
- **Floating card surface not theme-bound.** The card's `{color.surface}` fill and
  `{radius.1000}` radius are set by the sheet's card composition per-instance rather than
  installed on a global theme slot, so they are not globally overridable. Only the modal
  scrim shape is theme-bound. Recorded as backlog; no fix specified here.

## Transform notes

- **Reference implementation:** `FlowinActionSheet` (flutter_flowin), presented via the
  `showFlowinActionSheet` helper and dismissed via the `popFlowinActionSheet` context
  affordance. The header is `FlowinActionSheetHeader`; the footer is
  `FlowinActionSheetFooter`. The floating surface composes `FlowinCard`, and the close
  control composes the tonal `FlowinIconButton`.
- **Theme slots (reference impl):** `bottomSheetTheme` carries the modal **scrim** surface
  (background `{color.surface}` and top-corner radius `{radius.1000}`). The header text
  styles resolve through the global `textTheme`; the close control's color roles resolve
  through the tonal icon-button styling. The floating card surface is **not** routed through
  a theme slot in the current shape.
- **Legacy names (reference):** `FDActionSheet` / `FDActionSheetHeader` /
  `FDActionSheetFooter`, presented via `showDefaultActionSheet` and dismissed via
  `popDefaultActionSheet`. Legacy `showDefaultActionSheet` accepted `constraints`,
  `backgroundColor`, and `clipBehavior` (dropped — audit H5); the legacy header pinned the
  close control to `FDButtonSize.xs` / 32×32 (regressed to default `sm` / 40×40 — audit H4).
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `surfaceSecondary`, `onSurfaceSecondary`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Illustrative anatomy aside (Flutter):** the sheet is a `FlowinCard` (margin = the edge
  insets, `borderRadius` = `radius1000`, `backgroundColor` = `colorScheme.surface`) wrapping
  a min-size `Column` with `space400` spacing; the present helper is
  `showModalBottomSheet` with a transparent background and `minWidth: double.infinity`
  constraint so the card's own surface shows through. This structure is illustrative only and
  not part of the binding contract.
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove the modal **scrim** shape (top
  corner radius, background) comes from the global bottom-sheet theme slot, not the call
  site — override the slot, present the sheet, assert it reflects the override. A separate
  dimensional check should prove the card radius, the four edge insets, the inter-slot gap,
  and the footer equal-column layout. The H4 close-control footprint and the H5 dropped
  present-helper parameters should be asserted against the **current** shape (40×40 close
  control; helper exposes only barrier + scroll-control) until the planned fixes land.
