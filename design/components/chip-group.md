# Component: chip-group

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A single-select set of chips: a row (or wrap) of mutually-exclusive option labels
where exactly one is selected at a time. The call site supplies the option **labels**
and observes the **selected index**; chip appearance — pill shape, selected fill, border,
label style, padding — comes from the global theme, never from the call site. The group
owns only its layout (spacing, padding, scroll-vs-wrap) and its selection bookkeeping.

## Anatomy (illustrative)

A horizontal strip of pill-shaped chips separated by a fixed gap, with horizontal padding
around the run. Each chip is a label inside a stadium-shaped container; the selected chip
is filled, the rest are outlined/transparent. When scrolling is disabled the strip becomes
a centered multi-line wrap instead of a single scrollable line.

> Illustrative platform aside (non-binding): the reference implementation composes the
> framework's native choice-chip primitive per item and lays them out with a horizontal
> scrolling list or a wrap; selection state is held by a small controller object. The
> drawn chrome is the themed native chip, not a bespoke drawing.

## Variants

The group itself has no emphasis variants. Each chip resolves to one of two visual roles
from its position in the selection model:

| Chip role | Purpose |
|---|---|
| `selected` | The currently chosen chip. Filled with the secondary surface role. **(exactly one)** |
| `unselected` | Every other chip. Transparent fill, subtle border. **(default unselected role)** |
| `unselectedDimmed` | Optional reduced-emphasis unselected role (half opacity). Opt-in per group. |

The unselected role is chosen once for the whole group; the selected role is applied to
whichever chip the selection model points at.

## Sizes

The group exposes no per-call size scale. Chip footprint (padding, label style, pill shape)
is fixed by the theme. The only group-level dimensions are the run **height** (scrollable
mode) and the inter-chip **spacing**, both group layout concerns rather than a size token
scale.

| Dimension | Default | Token |
|---|---|---|
| run height (scrollable) | 48px | `{space.1200}` |
| inter-chip spacing | 8px | `{space.200}` |
| run padding (horizontal) | 12px | `{space.300}` |

## States

Per chip: `selected` · `unselected` (· `unselectedDimmed` when opted in) · `disabled`
(a chip with no activation path is non-interactive). Pressed/hover/focus overlays are
inherited from the platform's themed chip and are not overridden here.

## Token bindings (normative)

Chip chrome is **theme-level** (every chip in the group inherits it). The group layer adds
only layout dimensions (height, spacing, padding) and the selection→role mapping.

| Property | Role / State | Token |
|---|---|---|
| chip shape | all | pill / stadium (fully rounded) — see Behavioral notes |
| chip label text style | all | `{typography.baseline.labelMedium}` |
| chip content padding (h × v) | all | `{space.400}` × `{space.200}` |
| chip background | selected | `{color.surfaceSecondary}` |
| chip foreground | selected | `{color.onSurfaceSecondary}` |
| chip border side | selected | `{color.surfaceSecondary}` |
| chip background | unselected | transparent |
| chip foreground | unselected | `{color.onSurfaceSecondary}` |
| chip border side | unselected | `{color.surfaceSecondary}` |
| chip border width | all | `{border.regular}` |
| chip opacity | unselectedDimmed | `0.5` |
| run height | scrollable | `{space.1200}` |
| inter-chip spacing | all | `{space.200}` |
| run padding (horizontal) | all | `{space.300}` |

> The chip's selected fill, border color, and label style are bound at the **chip-theme**
> level and shared with the standalone chip component; this group does not re-bind them
> per instance. The current chip-theme uses a single secondary-surface role for both the
> selected fill and the unselected border, hence the repeated `{color.surfaceSecondary}`
> rows above.

## Behavioral notes

- **Single-select, exactly one.** The group holds a selection index; tapping a chip makes
  it the selected one and reports the new index. There is no multi-select and no
  deselect-to-empty.
- **Controlled or uncontrolled.** A caller may pass a selection controller to drive and
  observe the index externally (controlled), or omit it and let the group own selection
  internally (uncontrolled), seeded by an initial index. An out-of-range initial index is
  clamped into range; if the label set shrinks below the current index, the index is
  clamped down.
- **Custom chip content (optional builder).** By default each option renders as a themed
  label chip from its string. A caller may instead supply an optional **chip builder** that,
  given the item's index, label, selected state, and selection callback, returns the chip to
  render — enabling leading media or other composed content while keeping the simple
  `labels` path as the default. The builder is additive: when omitted, the default rendering
  applies.
- **Selection callback.** After a tap updates the selection, the group reports the newly
  selected **index** to an optional callback. An optional **label callback** may also be
  supplied for callers who prefer the selected label string; both fire on the same tap.
- **Long-press (optional).** An optional per-item long-press callback may be supplied
  alongside tap; it reports the long-pressed item's index and does not change selection. A
  null long-press callback disables the gesture.
- **Layout switch.** A flag chooses horizontal scrolling (a single scrollable run of fixed
  height) versus wrapping (a centered multi-line wrap with no fixed height). Scroll physics
  are platform-default for the scrollable run.
- **At least one option.** The group requires a non-empty label set.

## Theming directive

- **Global (theme slot):** pill/stadium shape, selected fill, border color, label text
  style, and chip content padding. These live on the platform's global chip theming
  mechanism and must be **globally overridable, not per-instance** — the group never
  passes per-chip styling overrides.
- **Per-call (resolved by the thin widget):** the option **labels**, an optional **chip
  builder** for custom chip content, the unselected role for the group, the selection model
  (controller / initial index), the selection callback (index, plus an optional label
  callback), an optional per-item **long-press** callback, and the group layout dimensions
  (scroll-vs-wrap, height, inter-chip spacing, run padding). These are the only concerns the
  theme cannot know per invocation.

## Known gaps / planned fix

- **Custom chip content + long-press (audit H10) — now specified above.** An optional chip
  builder restores custom per-chip content (leading media, composed children) over the
  simple `labels` path, and an optional per-item long-press callback is part of the
  contract. _(Previously deferred; resolved.)_
- **Scroll handle dropped.** The legacy tap/long-press callbacks handed the caller the run's
  scroll controller (to programmatically scroll to the tapped chip); the modern reference
  does not surface a scroll handle. Programmatic scroll-to-selection is not available in v1.

## Transform notes

- **Reference implementation:** `FlowinChipGroup` (flutter_flowin); selection held by a
  `FlowinChipGroupController`. Each item renders a `FlowinChip`, the standalone chip
  component, which composes the framework's native `ChoiceChip`.
- **Theme slot (reference impl):** `chipTheme` — supplies selected color, border side,
  label style, stadium shape, and chip padding for every chip in the group.
- **Legacy names (reference):** `FdChipGroup` took `List<FdChip> chips` (custom chip
  content), `onItemTap` and `onItemLongTap` with `(index, chip, ScrollController)`
  signatures; `FdChipVariant` { selected, unselected, unselectedDimmed }. The standalone
  pager wrapper `FDChipGroupViewPager` (paged content driven by the chip row) is a separate
  legacy composite, out of scope for this contract.
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `surfaceSecondary`, `onSurfaceSecondary`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove the selected fill, border, label
  style, and pill shape come from the chip theme slot, not the group widget — override the
  slot, render the group, assert the selected chip reflects the override.
