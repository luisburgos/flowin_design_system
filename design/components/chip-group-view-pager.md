# Component: chip-group-view-pager

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A navigation control that binds a single-select **chip row** to a **paged content
view**: selecting a chip moves the view to its page, and moving the view (e.g. by
swipe) reselects the matching chip. The two stay in lock-step at all times. Each page is
identified by its chip label and is built on demand. The chip styling, the separator
between the row and the pages, and the label text style all come from the global theme —
never from the call site. The call site supplies only the ordered list of label-plus-page
items and a handful of behavior knobs.

## Anatomy (illustrative)

A vertical stack of three parts: a horizontally-scrollable (or wrapped) single-select
chip row at the top, a thin full-width separator beneath it, and a swipeable paged region
filling the remaining space. The selected chip is highlighted; the visible page
corresponds to it.

> *Illustrative platform aside (non-normative):* the reference implementation composes the
> chip-row primitive, the host divider primitive, and the host page-view primitive
> (in Flutter: `FlowinChipGroup`, `Divider`, `PageView`) inside a column with a fixed
> inter-section gap. Whether pages scroll by swipe, the swipe physics, and the
> highlight/separator rendering are all platform-dependent; the **intent** (two-way
> chip↔page binding, lazy pages, optional state preservation) is what is normative.

## Variants

This component has no visual variants of its own. It composes the chip row, whose
unselected chips may be rendered at a chosen emphasis.

| Variant | Purpose |
|---|---|
| (single composition) | Chip row bound to a paged view. The only stylistic choice is the **unselected-chip emphasis**, forwarded to the chip row. **(default: normal unselected emphasis)** |

## Sizes

This component has no size scale. The chip row and its chips carry their own intrinsic
dimensions from the theme (chip padding, label style, row height); the paged region
expands to fill available space. The call site does not pick a size.

## States

The component as a whole has no interaction states. State lives in its parts:

- **Selection:** exactly one chip is selected at any time; it mirrors the active page.
- Per-chip states (`selected` · `unselected` · `unselectedDimmed`) and per-page presence
  are owned by the composed chip row and paged view respectively, and are styled by their
  own theme slots.

## Token bindings (normative)

This component owns no color or radius bindings directly — every visible surface is
inherited from the theme slots of its composed parts. The bindings below are the ones the
composition itself asserts (the inter-section gap) plus the inherited bindings it depends
on, recorded here so a conformant transform can verify them.

| Property | Part / State | Token |
|---|---|---|
| inter-section gap (row → separator → pages) | composition | `{space.300}` |
| separator color | divider | `{color.borderSubtle}` |
| separator thickness | divider | `{border.regular}` |
| chip label text style | chip row, all | `{typography.baseline.labelMedium}` |
| chip background | chip row, selected | `{color.surfaceSecondary}` |
| chip border | chip row, unselected | `{color.surfaceSecondary}` |
| chip background | chip row, unselected | transparent |
| chip corner radius | chip row, all | `{radius.full}` |
| chip content padding (h × v) | chip row, all | `{space.400}` × `{space.200}` |

## Behavioral notes

- **Two-way binding.** Selecting a chip animates the paged view to that chip's page;
  moving the paged view to a page selects that page's chip. Selection and visible page are
  always equal.
- **At least one item** is required; constructing the component with an empty item list is
  a contract violation.
- **Initial selection** is the requested initial index, clamped into the valid range.
- **Lazy pages.** Each page's content is produced on demand from a per-item builder, not
  eagerly for every item.
- **Optional state preservation.** Built pages may be kept alive so their internal state
  (scroll offset, form input) survives navigating away and back. This is on by default and
  can be disabled per call.
- **Index-change notification.** A per-call callback fires with the new index whenever the
  active page changes, regardless of whether the change came from a chip tap or a view
  move.
- **Transition tuning.** The chip-tap → page animation duration and easing, and the paged
  view's scroll/swipe physics, are per-call behavior knobs (not styling).
- **Controlled or uncontrolled.** A caller may optionally supply an external **paging
  controller** and/or an external **chip-selection controller** to drive and observe the
  active index from outside (controlled mode). When omitted, the component creates and owns
  both internally (uncontrolled, today's behavior). Externally-supplied controllers are
  owned by the caller and are not disposed by the component.
- **Custom chip rendering (optional).** A caller may supply an optional **chip builder/
  factory** to customize each chip's rendering, forwarded to the composed chip row; when
  omitted, chips render from labels through the themed chip row.
- **Chip-row layout knobs (optional).** The chip-row outer padding and inter-chip spacing
  may be forwarded as per-call parameters; when omitted, the chip row's own defaults apply.

## Theming directive

- **Global (theme slot):** all visual styling is inherited, never set per call — the chip
  shape/colors/label style/padding, the separator color and thickness, and the label text
  style. A conformant transform installs these on the platform's global chip, divider, and
  tab/label theming mechanisms, and they must be **globally overridable, not
  per-instance.**
- **Per-call (resolved by the thin widget):** the ordered item list (label + page
  builder), initial index, unselected-chip emphasis, whether the chip row scrolls vs.
  wraps, whether pages are kept alive, the transition duration/curve, the paged-view
  physics, the index-change callback, optional external paging / chip-selection
  controllers, an optional chip builder, and optional chip-row layout knobs (outer padding,
  inter-chip spacing). These are the only concerns the theme cannot know per invocation —
  none of them are visual styling.

## Known gaps / planned fix

- **Controlled mode, chip factory, and chip-row layout knobs (audit H11) — now specified
  above.** Optional external paging + chip-selection controllers (controlled mode), an
  optional chip builder, and forwardable chip-row outer padding / inter-chip spacing are
  part of the contract. _(Previously deferred; resolved.)_

## Transform notes

- **Reference implementation:** `FlowinChipGroupViewPager` (flutter_flowin), composing
  `FlowinChipGroup`, the host `Divider`, and `PageView`. Page items are
  `FlowinChipGroupViewPage` (label + lazy builder).
- **Theme slots (reference impl):** `chipTheme` (chip shape/colors/label/padding),
  `tabBarTheme` (label text styles), and `dividerTheme` (separator color/thickness). No
  dedicated slot for the pager composition itself.
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `surfaceSecondary`, `borderSubtle`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Legacy names (reference):** `FDChipGroupViewPager` with `chipFactory`,
  `controller` (external `PageController`), `chipGroupController`, `chipsPadding`,
  `chipSpacing` — re-adopted in v1 as optional per-call parameters (audit H11), restoring
  controlled-mode parity.
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove the separator color/thickness and
  the chip styling come from their theme slots, not the widget — override the slots, render
  the component, assert it reflects the overrides. A binding test must prove the chip↔page
  two-way sync (tap a chip → page changes; move the view → chip selection changes).
