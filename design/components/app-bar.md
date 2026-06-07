# Component: app-bar

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A fixed-height bar pinned to the top of a screen that frames a center region between a
leading slot and a trailing slot, with an optional footer pinned to its bottom edge. The
app bar is a **layout/composition primitive**: it positions caller-supplied content and
owns only the bar's height, edge padding, and slot minimum footprint. It contributes no
chrome of its own — no fill, no border, no text style — so whatever is placed in its slots
is styled by that content's own contract, not by the bar.

## Anatomy (illustrative)

A fixed-height band laid out as a single horizontal row inset from the top, left, and
right edges by a uniform pad:

```
┌──────────────────────────────────────────────┐  ← height (fixed)
│  [leading]      [ center child ]   [trailing] │  ← row, top/left/right padding
│                                                │
│················································│  ← footer (optional, bottom-pinned)
└──────────────────────────────────────────────┘
```

- **leading** / **trailing** — square minimum-footprint slots at the edges (e.g. a back
  or menu control, an action control). Each reserves a minimum square box even when empty,
  so the center stays optically aligned.
- **center** — expands to fill the space between the two edge slots; collapses to flexible
  empty space when absent.
- **footer** — optional, pinned to the bottom edge across the full width and drawn behind
  the row (e.g. a divider or a tab strip). It does **not** add to the bar's height; the
  caller sizes the bar to make room for it.

The single-row inset layout is the reference structure. The bar exposes a *preferred size*
so a host scaffold can reserve vertical space for it; how that reservation is honored is
platform-dependent.

## Variants

| Variant | Purpose |
|---|---|
| `bar` | The base bar: leading / center / trailing slots plus an optional generic footer. **(default)** |
| `tab-bar` | A bar whose footer is a hairline divider above a tab strip bound to a selection controller. A composition over `bar` for the common "screen with tabbed sections" pattern. |

## Sizes

The app bar is single-size; it exposes no `xs`/`sm`/`md` scale. Its measures are fixed,
with the overall height being the only caller-overridable dimension (see Behavioral notes).

| Measure | Value |
|---|---|
| Bar height (`bar`, default) | `{space.1400}` (56) |
| Edge slot min height / min width | `{space.1200}` (48) |
| Edge & top padding (uniform inset) | `{space.200}` (8) |
| Bar height (`tab-bar`) | base height `{space.1400}` (56) + tab-strip height |

## States

The app bar is a **static container**; it has no interaction states of its own
(no `hover` / `pressed` / `focused` / `disabled`). Any interactivity belongs to the
content placed in its slots, which carries its own state contract. Only `default` applies.

## Token bindings (normative)

The bar paints no fill, border, or text — its visible measures are dimensional. The footer
divider in the `tab-bar` variant is the only color binding, and it inherits from the global
divider styling rather than from the bar itself.

| Property | Variant / State | Token |
|---|---|---|
| bar height | `bar`, default | `{space.1400}` |
| edge slot min height | all, default | `{space.1200}` |
| edge slot min width | all, default | `{space.1200}` |
| edge / top inset padding | all, default | `{space.200}` |
| background fill | all, default | none (transparent — bar contributes no surface) |
| footer divider color | `tab-bar`, default | `{color.borderSubtle}` |
| footer divider thickness | `tab-bar`, default | `{border.regular}` |

> The center child sits over the host `{color.surface}` it is placed on; the bar does not
> repaint it. Slot content foreground (e.g. `{color.onSurface}`) is owned by that content,
> not the bar.

## Behavioral notes

- All four content slots (leading, trailing, center, footer) are **optional**. An absent
  leading/trailing slot still reserves its minimum square footprint; an absent center
  collapses to flexible empty space; an absent footer is omitted entirely.
- The footer is drawn **behind** the row and pinned to the bottom edge. It is the caller's
  responsibility to size the bar tall enough to clear both the row and the footer — the
  footer does not grow the bar.
- The bar advertises a **preferred size** (its height) so a host scaffold can reserve
  vertical space; it does not itself enforce that reservation.
- For the `tab-bar` variant, the active tab is driven by an externally-owned **selection
  controller**, and the tab strip may be configured to **scroll horizontally** when the
  tabs overflow.

## Theming directive

- **Global (theme):** the app bar has **no dedicated theme slot** — it is a composition
  widget, not a styled primitive, so there is nothing for a global theme to install on it.
  The one inherited binding is the `tab-bar` footer divider, whose color and thickness come
  from the **global divider styling**; overriding the divider role re-skins every app bar
  footer at once.
- **Per-call (resolved at the call site):** which slots are filled and with what content,
  the overall bar height, and — for `tab-bar` — the selection controller, the tab list, and
  whether the strip scrolls. These are the only concerns the bar surfaces, because all
  visual styling lives in the slot content, not the bar.

## Known gaps / planned fix

- **Faithful to the reference per audit.** The bar matches the reference implementation as
  validated; the one intentional addition over the legacy shape is a caller-overridable
  **bar height** parameter (legacy fixed the height via a max-height constraint with no
  override). Recorded as an accepted enhancement, not a deviation.
- **Sub-variant `tab-bar` regressions (audit H2/H3).** The tab footer composes a hairline
  divider stacked above the tab strip as a two-child column, where the legacy reference
  laid the tabs and divider as a single footer row. Two gaps are tracked against the
  current shape: (H2) the **divider hairline** is emitted as a generic divider that picks
  up the global divider role/thickness rather than a footer-local hairline, and (H3) the
  **single-row footer layout** of the legacy reference is not reproduced — the modern shape
  is a divider-over-strip column. Both are recorded as backlog (`flowin_pm`), and the
  `tab-bar` sub-variant is specified here as part of the app-bar family rather than as a
  separate contract.

## Transform notes

- **Reference implementation:** `FlowinAppBar` (flutter_flowin); the `tab-bar` variant is
  `FlowinTabAppBar` in the same module, composing `FlowinAppBar` with a tab strip footer.
- **Theme slots (reference impl):** none for the bar itself (no `appBarTheme` binding — it
  implements `PreferredSizeWidget` purely for scaffold integration). The `tab-bar` footer
  divider resolves through the global `dividerTheme` slot.
- **Legacy names (reference):** `FDAppBar` / `FDTabAppBar`. Legacy `FDAppBar` had no height
  parameter (max-height constraint only); legacy `FDTabAppBar` exposed a per-instance
  `dividerColor` override — dropped in the modern reference in favor of the global divider
  role.
- **Illustrative anatomy aside (Flutter):** the bar is a `SizedBox` over a `Stack` — the
  footer in a bottom-pinned `Positioned`, the row in a top/left/right-padded `Row` with
  `ConstrainedBox` edge slots and an `Expanded`/`Spacer` center. This structure is
  illustrative only and not part of the binding contract.
- **Tag:** generic-primitive.
- **Conformance:** the bar carries no theme bindings to assert; a conformance check should
  prove the dimensional contract (fixed height default, slot minimum footprint, edge inset)
  and that the `tab-bar` footer divider reflects an override of the **global** divider role,
  not a per-instance value.
