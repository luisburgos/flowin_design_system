# Component: tab-item

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A single cell within a [tabs](tabs.md) bar: an **icon-left row** with a label, sized to sit
within the bar's fixed height. It expresses one selectable destination; the bar owns
selection and the indicator, the item owns only its own content layout.

## Anatomy (illustrative)

A horizontal row: an optional leading icon, then a label, laid out left-to-right inside the
tab cell. The label is single-line and **ellipsizes** when the cell is too narrow. This
differs from the platform's default `Tab(icon:, text:)`, which **stacks** the icon *above*
the label — the Flowin tab item is explicitly icon-**left**.

> *Illustrative platform aside (non-binding):* the reference implementation is a small
> widget composed inside the native tab primitive's cell; the bar (`FlowinTabs`) re-wraps
> each item to the bar height. The exact ripple bounds and icon-label gap are
> platform-dependent; the **intent** (icon-left row, single-line ellipsized label) is
> normative.

## Variants

The tab item has no emphasis variants of its own. Selected/unselected styling is applied by
the **bar** (label color, indicator), not the item.

| Variant | Purpose |
|---|---|
| (single) | An icon-left labeled cell. **(only form)** |

## Sizes

No per-call size axis. The item lays out within the bar's fixed height (`{space.1400}`,
56px — see [tabs](tabs.md)).

| Size | Notable dimensions |
|---|---|
| (single) | label `14 / w500`; icon paired at the tabs label size; height inherited from the bar |

## States

`default` · `selected` · `unselected` · `disabled`. Selection and disabled visuals are owned
by the bar; the item contributes layout only. Pressed/hover/focus overlays are inherited
from the platform's themed tab.

## Token bindings (normative)

The item owns its label text style and the icon-left layout; selection colors and the
indicator are bound at the **bar / tab-theme** level (see [tabs](tabs.md)).

| Property | State | Token |
|---|---|---|
| label text style | all | `14 / w500` (— see Behavioral notes) |
| label overflow | all | ellipsis (single line) |
| icon placement | all | leading (icon-left of label) |
| icon size | all | the tabs paired icon size |
| selected label color | selected | inherited from the bar (tab-theme / global role) |

## Behavioral notes

- **Icon-left row, not stacked.** The leading icon (when present) renders *before* the
  label on the same line — never above it.
- **Single-line ellipsized label.** The label is one line and truncates with an ellipsis
  when constrained; it does not wrap.
- **Label weight.** The label renders at `14 / w500` (medium). This is the item's own
  intrinsic label sizing; the bar's selected/unselected *color* is layered on top.
- **Icon is optional.** A label is required; the leading icon is optional.
- **The bar owns selection.** The item does not manage selection state, the indicator, or
  the tap/selection callback — those belong to [tabs](tabs.md).

## Theming directive

- **Global (theme / bar slot):** selected/unselected label color and the selection
  indicator — these come from the tab theme and global color roles, never from the item.
- **Per-call (resolved by the thin widget):** the label, an optional leading icon, and the
  icon-left layout with ellipsized single-line label. These are the only concerns the bar
  and theme cannot know per item.

## Known gaps / planned fix

- _None._ (Restores the legacy icon-left labeled tab cell; see Transform notes.)

## Transform notes

- **Reference implementation:** `FlowinTabItem` (flutter_flowin) — a public widget passed as
  a tab to `FlowinTabs`, which sizes/wraps it to the bar height. Replaces a raw
  `Tab(icon:, text:)` (which stacks icon over label).
- **Theme slot (reference impl):** `tabBarTheme` (label text styles, indicator) supplies the
  selected/unselected coloring; the item supplies the row layout + `14/w500` label.
- **Legacy names (reference):** the legacy tab cell was an icon-left row with an ellipsized
  `14/w500` label; the modern rebuild had regressed to the stacked native `Tab`. This
  contract restores the legacy layout (audit H1).
- **Tag:** generic-primitive.
- **Conformance:** a layout test must prove the icon renders to the **left** of the label
  (same row), and that an over-long label ellipsizes rather than wraps.
