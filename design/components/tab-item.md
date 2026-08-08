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
> each item to the bar height. The exact ripple bounds are platform-dependent; the
> **intent** (icon-left row, single-line ellipsized label) is normative. The **icon-label
> gap** is *not* platform-dependent — it is bound to `{space.100}` below.

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
| (single) | label `{typography.baseline.labelMedium}`; icon size caller-supplied; height inherited from the bar |

## States

`default` · `selected` · `unselected` · `disabled`. Selection and disabled visuals are owned
by the bar; the item contributes layout only. Pressed/hover/focus overlays are inherited
from the platform's themed tab.

## Token bindings (normative)

The item owns its label text style and the icon-left layout; selection colors and the
indicator are bound at the **bar / tab-theme** level (see [tabs](tabs.md)).

| Property | State | Token |
|---|---|---|
| label text style | all | `{typography.baseline.labelMedium}` (14 / semibold) |
| label overflow | all | ellipsis (single line) |
| icon placement | all | leading (icon-left of label) |
| icon-label gap | all (icon present) | `{space.100}` (4) |
| icon size | all | caller-supplied — **not bound**; see Known gaps |
| selected label color | selected | inherited from the bar (tab-theme / global role) |

## Behavioral notes

- **Icon-left row, not stacked.** The leading icon (when present) renders *before* the
  label on the same line — never above it.
- **Single-line ellipsized label.** The label is one line and truncates with an ellipsis
  when constrained; it does not wrap.
- **The label style comes from the bar, not the item.** The item sets no style of its own;
  it inherits the tab bar's label style, so a Flowin cell and a raw platform cell in the
  same bar render alike. The bar's selected/unselected *color* is layered on top.
- **Icon is optional.** A label is required; the leading icon is optional.
- **The bar owns selection.** The item does not manage selection state, the indicator, or
  the tap/selection callback — those belong to [tabs](tabs.md).

## Theming directive

- **Global (theme / bar slot):** selected/unselected label color and the selection
  indicator — these come from the tab theme and global color roles, never from the item.
- **Per-call (resolved by the thin widget):** the label, an optional leading icon, the
  icon-left layout with ellipsized single-line label, and — when the bar itself was given a
  non-default height — a matching **height** so the item tracks it. These are the only
  concerns the bar and theme cannot know per item.

## Known gaps / planned fix

- _(Closed 2026-08-07.)_ The icon size was unbound, and the gap was live rather than
  theoretical: one consumer passed the small step explicitly while another took the icon
  scale's default, so the same component shipped at two sizes in two applications. That is
  the convergence failure a contract exists to prevent. The size is now bound to
  `{size.icon.sm}` — the value a production application already ships.

## Transform notes

- **Reference implementation:** `FlowinTabItem` (flutter_flowin) — a public widget passed as
  a tab to `FlowinTabs`, which sizes/wraps it to the bar height. Replaces a raw
  `Tab(icon:, text:)` (which stacks icon over label).
- **Theme slot (reference impl):** `tabBarTheme` supplies the label text styles and the
  selected/unselected coloring; the item supplies the row layout only.
- **Weight deviates from the legacy source, deliberately.** The legacy cell hardcoded a
  medium (w500) label per item. v1 binds the label to the type scale instead, which is
  semibold (w600), so the weight travels through the theme and every cell in a bar agrees.
  A conformance pass against the legacy source will find this difference; it is intended.
- **Legacy names (reference):** the legacy tab cell was an icon-left row with an ellipsized
  `14/w500` label; the modern rebuild had regressed to the stacked native `Tab`. This
  contract restores the legacy layout (audit H1).
- **Tag:** generic-primitive.
- **Conformance:** a layout test must prove the icon renders to the **left** of the label
  (same row), and that an over-long label ellipsizes rather than wraps.
