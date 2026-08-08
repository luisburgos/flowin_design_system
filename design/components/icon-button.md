# Component: icon-button

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A control that triggers an action when activated, presenting a single icon and no
label. Emphasis is conveyed by **variant**; footprint by **size**. The button's shape
(a circle) and base styling come from the global theme — never from the call site. The
call site chooses only *which variant* and *which size*.

## Anatomy (illustrative)

A circular container wrapping a single icon, centered with no surrounding padding. The
circular shape and footprint are platform-dependent in their exact rendering; the intent
is a square hit target whose side equals the size's control height, with a fully circular
container and the icon centered within. The reference implementation composes the host
platform's native icon-button primitive (in Flutter: `IconButton`) rather than drawing a
bespoke shape — the theme styles the native primitive.

## Variants

Default variant is `filled`.

| Variant | Emphasis | Purpose |
|---|---|---|
| `filled` | high | Primary icon action. Solid `primary` background. **(default)** |
| `tonal` | medium | Secondary icon action. `surfaceSecondary` background. |
| `text` | low | Lowest-emphasis, transparent fill. |
| `destructive` | high | Dangerous icon action. Layers the error color role onto the filled shape. |

## Sizes

Default size is `sm`. An icon button is square: its side equals the size's control
height, and the icon is sized to the paired icon size.

| Size | Square side | Icon size | Outer padding (all sides) |
|---|---|---|---|
| `xs` | `{size.control.xs}` (32px) | `{size.icon.sm}` (16px) | `{space.200}` (8) |
| `sm` | `{size.control.sm}` (40px) | `{size.icon.md}` (20px) | `{space.100}` (4) |
| `md` | `{size.control.md}` (56px) | `{size.icon.lg}` (24px) | `{space.zero}` (0) |

**Outer padding is applied on all four sides**, unlike the button's, which is vertical-only
at the same steps. The difference is deliberate and normative: an icon button is a square
target that needs breathing room on every side, whereas a button is laid out in a vertical
rhythm where horizontal spacing comes from its container. A transform must preserve the
axis difference, not unify the two.

## States

`default` · `hovered` · `pressed` · `focused` · `disabled`. State visuals (overlay,
opacity) are inherited from the platform's themed icon button; the spec does not override
them in v1.

## Token bindings (normative)

Shape (circle) is **theme-level** (applies to every icon button). The per-call layer adds
only the square side / icon size and the per-variant color roles (and, for `destructive`,
the error color roles).

| Property | Variant / State | Token |
|---|---|---|
| shape | all | circle (theme-level; not a length token) |
| background | filled, default | `{color.primary}` |
| foreground | filled, default | `{color.onPrimary}` |
| background | tonal, default | `{color.surfaceSecondary}` |
| foreground | tonal, default | `{color.onSurfaceSecondary}` |
| background | text, default | transparent |
| foreground | text, default | `{color.primary}` |
| background | destructive, default | `{color.errorContainer}` |
| foreground | destructive, default | `{color.onErrorContainer}` |
| square side | per size | `{size.control.*}` (see Sizes table) |
| icon size | per size | `{size.icon.*}` (see Sizes table) |
| outer padding (all sides) | per size | `{space.*}` (see Sizes table) |

## Behavioral notes

- A null/absent activation callback **disables** the button.
- The icon is required arbitrary content; there is no label.
- The container is square — its minimum and fixed footprint are both the size's control
  height — and carries no internal padding around the icon.

## Theming directive

- **Global (theme slot):** the circular shape. A conformant transform installs this on
  the platform's global icon-button theming mechanism. It must be **globally overridable,
  not per-instance.**
- **Per-call (resolved by the thin widget):** variant selection (→ background/foreground
  color roles), size (→ square side, icon size), and the destructive error-role overlay.
  These are the only concerns the theme cannot know per invocation.

## Known gaps / planned fix

- The per-variant **color roles** are resolved per-call by the widget rather than
  installed on the global theme slot (which currently carries only the shape). Variant
  colors are therefore not globally overridable. Recorded as backlog; no planned fix
  specified here.
- _(Resolved 2026-08-06, audit unit "icon-button".)_ The `text` variant binds its foreground
  to `{color.primary}` while the sibling text **button** binds `{color.onSurface}`. This was
  recorded as an unreconciled divergence; it is now **deliberate**. A standalone icon
  affordance has no surrounding text to be mistaken for, so it carries the accent; a text
  button sits in a content flow, where an accent label would read as a link. Both contracts
  state the reason.
- _(Resolved 2026-08-06, audit unit "icon-button".)_ This entry previously stated that the
  modern reference **drops** the legacy outer padding. That was wrong: the reference applies
  per-size outer padding on all four sides. It is now **specified** above (Sizes table and
  Token bindings) rather than deferred, restoring legacy parity with the axis difference
  from the button made explicit.

## Transform notes

- **Reference implementation:** `FlowinIconButton` (flutter_flowin). Variants are
  `filled` / `tonal` / `text` / `destructive`; there is no `outline` variant (unlike the
  sibling button).
- **Theme slot (reference impl):** `iconButtonTheme` (carries the circular shape only).
- **Size mapping (reference):** size is shared with the button via `FlowinButtonSize`; the
  square side is taken from the size's control height (`minHeight`) and the icon size from
  the size's paired icon size.
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `surfaceSecondary`, `onSurfaceSecondary`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove the circular shape comes from the
  theme, not the widget — override the slot, render the icon button, assert it reflects the
  override.
