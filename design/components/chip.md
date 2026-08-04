# Component: chip

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A compact, pill-shaped control that represents a single choice within a group, and toggles
its **selection** when activated. Emphasis is conveyed by **selection state** — selected,
unselected, or unselected-dimmed (de-emphasized but still present). The chip's pill shape,
border, fill colors, label text style, and padding all come from the global theme — never
from the call site. The call site chooses only *which selection variant* the chip is in and
supplies the label (and an optional leading element).

## Anatomy (illustrative)

A pill-shaped container wrapping an optional leading element (typically an icon) and a
label. The reference implementation composes the host platform's native choice-chip
primitive (in Flutter: `ChoiceChip`) rather than drawing a bespoke chip — the theme styles
the native primitive, and a wrapper applies the dimmed opacity. Exact internal layout
(gap between leading element and label, ripple bounds) is **platform-dependent**; the spec
fixes the *intent* (leading element precedes label inside a single pill), not the pixels.

## Variants

Selection is the only axis. Default is `unselected`.

| Variant | Selected? | Purpose |
|---|---|---|
| `selected` | yes | The chosen chip in a group. Filled pill. |
| `unselected` | no | A choosable, not-currently-chosen chip. Transparent fill, visible border. **(default)** |
| `unselectedDimmed` | no | Same as `unselected` but rendered at reduced opacity to de-emphasize it. |

## Sizes

The chip has **no per-call size axis**. Footprint is fixed by the theme (single padding +
label style for every chip). This is intentional and differs from the multi-size button.

| Size | Content padding (h × v) | Label text style |
|---|---|---|
| (single) | `space.400` × `space.200` (16 × 8) | `typography.baseline.labelMedium` |

## States

`default` · `selected` · `unselected` · `disabled`. Selection is a first-class variant (see
Variants). A null activation callback yields the **disabled / non-interactive** state.
Transient interaction visuals (hover, pressed, focused overlays) are inherited from the
platform's themed chip; the spec does not override them in v1.

## Token bindings (normative)

Shape, border, padding, label style, and the per-selection fill/foreground roles are
**theme-level** (apply to every chip). The per-call layer adds only the selection variant
and, for `unselectedDimmed`, the reduced opacity.

| Property | Variant / State | Token |
|---|---|---|
| shape | all | pill — `{radius.full}` |
| label text style | all | `{typography.baseline.labelMedium}` |
| content padding | all | `{space.400}` × `{space.200}` |
| border side color | unselected | `{color.borderSubtle}` |
| border side width | all | `{border.regular}` |
| background | unselected | transparent |
| foreground (label) | unselected | `{color.onSurface}` |
| background | selected | `{color.surfaceSecondary}` |
| foreground (label) | selected | `{color.onSurfaceSecondary}` |
| opacity | unselectedDimmed | `0.5` (literal, see Behavioral notes) |
| selection glyph | all | none — selection is conveyed by fill and border only |

## Behavioral notes

- A null/absent activation callback **disables** the chip (renders it non-interactive).
- The activation callback reports the *desired* selection state (a boolean), so the caller
  owns selection — the chip does not self-toggle its variant.
- `unselectedDimmed` differs from `unselected` **only** by a reduced-opacity wrapper; its
  fill/border/foreground roles are identical to `unselected`.
- The **label is arbitrary content**: it accepts any composed element (text, an icon-plus-
  text row, etc.), not only a string. An optional leading element renders before the label
  inside the same pill.
- **Selection adds no glyph.** Selection is conveyed by the fill and border roles alone —
  the chip never inserts a checkmark or any other automatic leading affordance. The
  leading slot holds only what the caller puts there, in every state. A platform whose
  choice-chip primitive shows a selected-state checkmark by default must turn it off.
- An optional **long-press** callback may be supplied alongside the activation (tap)
  callback. Long-press is a secondary gesture and does not affect selection unless the
  caller chooses to act on it; a null long-press callback simply disables that gesture.
- The dimmed opacity (`0.5`) is a literal multiplier applied by the thin wrapper, not a
  color/elevation token — it scales the whole composed pill uniformly.

## Theming directive

- **Global (theme slot):** pill shape, border side, content padding, label text style, and
  the per-selection fill/foreground color roles. A conformant transform installs these on
  the platform's global chip theming mechanism. They must be **globally overridable, not
  per-instance.**
- **Per-call (resolved by the thin widget):** selection variant, the label (arbitrary
  content), an optional leading element, the activation callback, an optional long-press
  callback, and the `unselectedDimmed` opacity multiplier. These are the only concerns the
  theme cannot know per invocation.

## Known gaps / planned fix

- **Composite content + long-press (audit H8) — now specified above.** The label accepts
  arbitrary content and an optional long-press callback is part of the contract (see
  Behavioral notes / Theming directive). _(Previously deferred; resolved.)_
- The legacy variant used a **uniform** content padding of `{space.400}` on all sides
  (16 all-round); the modern reference changes this to **h `{space.400}` × v `{space.200}`**
  (16 × 8). This contract specifies the current (validated) h16/v8 shape; the change is
  recorded as audit H8, not reverted.
- Legacy exposed per-instance escape hatches (`backgroundColor`, `borderColor`, `border`,
  `constraints`, `padding`, `margin`); these are intentionally **not** carried forward —
  styling is theme-only.

## Transform notes

- **Reference implementation:** `FlowinChip` (flutter_flowin) — a thin composition over the
  framework's native choice-chip primitive (`ChoiceChip`).
- **Theme slot (reference impl):** `chipTheme`.
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `surfaceSecondary`, `onSurfaceSecondary`, `borderSubtle`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Legacy names (reference):** `FdChip` / `FdChipVariant` (`selected` / `unselected` /
  `unselectedDimmed`), with `child` + `onLongPress` + per-instance styling hooks (see Known
  gaps).
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove the pill shape, selected fill, and
  label style come from the theme slot, not the widget — override the slot, render the chip,
  assert it reflects the override.
