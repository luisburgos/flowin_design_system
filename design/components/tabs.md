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
*cell* content (label-only, icon + label, icon placement) is supplied by the caller as
arbitrary child content and is therefore **not constrained by this contract today** — see
Known gaps.

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
| label text style | selected | `{typography.baseline.labelMedium}` |
| label text style | unselected | `{typography.baseline.labelMedium}` |
| selection indicator size | selected | full tab cell (spans the whole tab, not just the label) |
| divider beneath bar | all | suppressed (transparent) |
| label color | selected | `{color.onSurface}` (color-scheme default; not pinned by the theme slot) |
| label color | unselected | `{color.onSurfaceVariant}` (color-scheme default; not pinned by the theme slot) |
| selection indicator color | selected | `{color.primary}` (color-scheme default; not pinned by the theme slot) |

## Behavioral notes

- Selection is **driven externally**: the bar does not own selection state. The caller
  supplies a selection driver/controller and the list of tabs; the bar reflects and reports
  selection through that driver. Exactly one tab is selected at a time.
- **Tab content is caller-supplied.** The bar accepts an ordered list of tab cells as
  arbitrary child content; it does not impose a label/icon structure. (This is the source of
  the anatomy gap below.)
- **Overflow handling is a boolean choice.** When scrolling is off (default), tabs share the
  available width equally; when on, tabs take content width and the bar scrolls horizontally.
- The bar advertises a **fixed preferred height**, so it can be slotted directly beneath an
  app bar as a bottom region.

## Theming directive

- **Global (theme slot):** label text style (selected and unselected), full-tab selection
  indicator sizing, and divider suppression. A conformant transform installs these on the
  platform's global tab-bar theming mechanism. They must be **globally overridable, not
  per-instance.**
- **Per-call (resolved by the thin widget):** the selection driver, the list of tab cells,
  the scroll/overflow flag, and (as an escape hatch) the bar height. These are the only
  concerns the theme cannot know per invocation.
- **Currently unpinned (color scheme defaults):** selected/unselected label colors and the
  indicator color are inherited from the global color scheme rather than fixed in the
  tab-bar slot. A theme that re-points those color roles moves the tab colors with it.

## Known gaps / planned fix

- **No tab-cell primitive (audit H1).** There is no Flowin tab-item primitive today, so
  callers pass raw native tab cells. With a raw cell holding both an icon and a label, the
  platform default **stacks the icon ABOVE the label**. The legacy reference rendered
  **icon-LEFT of the label**, with a fixed **14px / medium-weight** label and **ellipsis**
  overflow. Planned fix: introduce a Flowin tab-item primitive that restores icon-left
  layout and the label treatment. Tracked in `flowin_pm` (audit H1).
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
  The modern reference dropped `FDTabItem`, which is the H1 gap above.
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove the label style, full-tab indicator
  size, and divider suppression come from the theme slot, not the widget — override the slot,
  render the bar, assert it reflects the override.
