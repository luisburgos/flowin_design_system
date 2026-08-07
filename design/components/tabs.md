# Component: tabs

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A horizontal bar of mutually-exclusive section selectors: exactly one tab is selected at
a time, and selecting a tab switches the visible section. The bar's fixed height, label
text style, selected/unselected coloring, full-tab selection indicator, and the absence of
a separating divider all come from the global theme — never from the call site. The call
site supplies only *which tabs* exist, *which one is selected* (via an external selection
driver), and *whether the bar scrolls* when the tabs overflow.

## Anatomy (illustrative)

A single-row, fixed-height bar of equal-or-content-width tab cells. Each cell holds a tab's
content (typically a label, optionally an icon). The selected cell carries a selection
indicator sized to the full tab cell. No divider rule is drawn beneath the bar.

*Platform-dependent rendering note:* the reference implementation is a **thin wrapper over
the host platform's native tab-bar primitive** (in Flutter: `TabBar`), fixed to a Flowin
height. It does **not** draw a bespoke bar — the theme styles the native primitive. Tab
*cell* content is supplied by the caller as arbitrary child content, so this contract does
not constrain it; the [tab-item](tab-item.md) contract constrains the Flowin cell, and a
caller passing a raw platform cell instead gets the platform's own arrangement.

## Variants

This component has no style variants. A single tab-bar treatment is themed globally.

| Variant | Purpose |
|---|---|
| `default` | The only treatment. Equal-width tabs by default; switches to content-width, horizontally scrolling tabs when overflow is opted in. |

## Sizes

This component has no discrete size scale. The bar is **fixed to a single Flowin height**;
the call site may override the height as an escape hatch but the contract size is one value.

| Size | Notable dimensions |
|---|---|
| `default` | Bar height `{space.1400}` (56px). |

## States

Per-tab: `selected` · `unselected`. The bar itself has no enabled/disabled state in v1;
hover/pressed/focus visuals are inherited from the platform's themed tab primitive and are
not overridden by this contract.

## Token bindings (normative)

Label text style, selection-indicator sizing, divider suppression, and bar height are
**theme-level** (apply to every tab bar). There is no per-call styling layer. Selected and
unselected label colors are **not set by the theme slot** and resolve from the global color
scheme defaults — recorded explicitly below.

| Property | State | Token |
|---|---|---|
| bar height | all | `{space.1400}` |
| label horizontal padding (per side) | all | `{space.100}` (4) |
| label text style | selected | `{typography.baseline.labelMedium}` |
| label text style | unselected | `{typography.baseline.labelMedium}` |
| selection indicator size | selected | full tab cell (spans the whole tab, not just the label) |
| divider beneath bar | all | suppressed (transparent) |
| content inset (scrolling bar only) | all | `{space.400}` (16) horizontal |
| label color | selected | `{color.onSurface}` (color-scheme default; not pinned by the theme slot) |
| label color | unselected | `{color.onSurfaceVariant}` (color-scheme default; not pinned by the theme slot) |
| selection indicator color | selected | `{color.primary}` (color-scheme default; not pinned by the theme slot) |

## Behavioral notes

- Selection is **driven externally**: the bar does not own selection state. The caller
  supplies a selection driver/controller and the list of tabs; the bar reflects and reports
  selection through that driver. Exactly one tab is selected at a time.
- **Tab content is caller-supplied.** The bar accepts an ordered list of tab cells as
  arbitrary child content; it does not impose a label/icon structure. The Flowin cell layout
  lives in [tab-item](tab-item.md).
- **Overflow handling is a boolean choice.** When scrolling is off (default), tabs share the
  available width equally; when on, tabs take content width and the bar scrolls horizontally.
- The bar advertises a **fixed preferred height**, so it can be slotted directly beneath an
  app bar as a bottom region.

## Theming directive

- **Global (theme slot):** label text style (selected and unselected), label horizontal
  padding, full-tab selection indicator sizing, and divider suppression. A conformant
  transform installs these on the platform's global tab-bar theming mechanism. They must be
  **globally overridable, not per-instance.**
- **Label padding is deliberately tight** (`{space.100}` per side). Platforms commonly
  default a tab's label padding far wider (the reference platform defaults to 16 per side);
  at that width, a fixed-width bar clamps icon+label tabs hard enough that ordinary labels
  ellipsize. A transform must set this explicitly rather than inherit the platform default.
- **Per-call (resolved by the thin widget):** the selection driver, the list of tab cells,
  the scroll/overflow flag, and (as an escape hatch) the bar height. These are the only
  concerns the theme cannot know per invocation.
- **The scrolling bar takes a horizontal content inset** of `{space.400}`, so the first and
  last tabs do not sit flush against the bar's edges. It applies **only** when the bar
  scrolls: an equal-width bar divides the full width among its tabs, where an inset would
  shrink the cells instead of adding breathing room. Resolved per-call because it depends on
  the overflow flag, which the theme cannot know.
- **Currently unpinned (color scheme defaults):** selected/unselected label colors and the
  indicator color are inherited from the global color scheme rather than fixed in the
  tab-bar slot. A theme that re-points those color roles moves the tab colors with it.

## Known gaps / planned fix

- _(Closed 2026-08-06, audit unit "tabs".)_ **No tab-cell primitive (audit H1)** is fixed:
  a tab-item primitive now ships with its own contract ([tab-item](tab-item.md)), restoring
  the icon-left row with a single-line ellipsized label. The bar still *accepts* arbitrary
  cell content, so a caller passing a raw platform cell gets the platform's stacked
  arrangement — using the tab-item primitive is what produces the Flowin layout.
- **Indicator size & divider suppression are now theme-dependent (audit, Med).** The
  reference previously pinned the full-tab indicator size and the transparent divider on the
  widget itself; these are now expressed only through the theme slot. If a host theme does
  not carry those slot values, a **stray divider** can reappear and the indicator may shrink
  to label width. Planned fix: guarantee the slot values via a conformance check (or
  re-pin defensively). Tracked in `flowin_pm` (audit Med).

## Transform notes

- **Reference implementation:** `FlowinTabs` (flutter_flowin) — a thin `PreferredSize`/
  `SizedBox` wrapper over the framework `TabBar`, fixing the bar to `kFlowinTabsHeight`
  (= `{space.1400}`). Exposes `controller`, `tabs`, `isScrollable`, `height`.
- **Theme slot (reference impl):** `tabBarTheme` (`indicatorSize: tab`,
  `dividerColor: transparent`, `labelStyle`/`unselectedLabelStyle: labelMedium`). Selected/
  unselected label and indicator colors are left to `ColorScheme` defaults.
- **Legacy names (reference):** `FDTabs` pinned `indicatorSize`/`dividerColor` on the widget
  and accepted an `FDTabItem` (`Tab` → `Row` of icon + 4px gap + 14/w500 ellipsis `Text`).
  The modern reference restores that cell as `FlowinTabItem` — see
  [tab-item](tab-item.md).
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove the label style, full-tab indicator
  size, and divider suppression come from the theme slot, not the widget — override the slot,
  render the bar, assert it reflects the override.
