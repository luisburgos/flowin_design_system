# Component: text-field

> The **binding contract** (Intent, States, Token Bindings, Behavioral notes) is
> **normative**. **Anatomy is illustrative.**

## Intent

A single- or multi-line control for free-text entry. It presents a fillable surface with
a placeholder hint when empty and emits the current value as the user types. The field's
fill, hint style, content padding, and rounded outline come from the global theme — never
from the call site. The call site chooses only the per-instance content concerns the theme
cannot encode (initial value, hint string, line count, input constraints, focus, and
whether the field accepts input).

## Anatomy (illustrative)

A rounded, filled rectangle containing the editable text region. When empty it shows the
hint string in the hint style; when populated it shows the entered value in the body text
style. There is no bundled label, leading affordance, or surrounding card — the field is a
standalone surface. The exact caret, selection handles, and text-region metrics are
**platform-dependent** and not specified here; the contract fixes the fill, hint, padding,
and border, and leaves native text-editing rendering to the host platform.

> Illustrative aside (one platform): the reference implementation is a thin wrapper over
> the host framework's native form-text primitive, styled entirely by the global input
> theme slot.

## Variants

This component has a single variant. Emphasis and grouping (labels, helper text, error
text, leading/trailing affordances) are **not** part of this contract today — they are
composed by callers around the field.

| Variant | Purpose |
|---|---|
| `default` | Standalone filled text-entry surface. **(only variant)** |

## Sizes

This component exposes **no discrete size scale**. Footprint is governed by the theme's
content padding plus the intrinsic height of the text region; multi-line growth is a
per-call concern (see Behavioral notes), not a size token.

| Size | Notable dimensions |
|---|---|
| (none) | Height = content padding (`space.400` h × `space.300` v) + intrinsic text-region height; width fills the available inline space. |

## States

`default` · `focused` · `disabled`. Hover and pressed produce no distinct token-level
visual in v1 — they are inherited from the platform's themed input primitive and not
overridden by this contract.

## Token bindings (normative)

Fill, hint style, content padding, and the rounded outline border are **theme-level**
(they apply to every text field). There is **no per-call styling layer**: the call site
contributes content and constraints only, never visual tokens.

| Property | State | Token |
|---|---|---|
| fill (background) | all | `{color.surface}` |
| input text color | all | `{color.onSurface}` |
| hint text color | default (empty) | `{color.onSurfaceVariant}` |
| hint text style | default (empty) | `{typography.baseline.bodyLarge}` |
| border color | default, focused, disabled | `{color.borderSubtle}` |
| border width | all | `{border.regular}` |
| corner radius | all | `{radius.400}` |
| content padding (h × v) | all | `{space.400}` × `{space.300}` |

## Behavioral notes

- The field is **uncontrolled at construction**: it seeds from an optional initial value
  and reports each edit through a change callback. Absence of the callback does not disable
  the field (compare: a control whose absent activation callback disables it).
- A separate **enabled** flag governs interactivity. When disabled, the field rejects input
  and presents the disabled affordance from the platform's themed input primitive; the
  border token binding is unchanged in v1.
- **Line count** is a per-call concern: the field defaults to a single line and may be
  configured to allow more.
- **Input constraints** (formatters that filter or transform keystrokes) are supplied
  per-call.
- **Focus** may be requested on first render via an autofocus flag.
- The hint string is supplied per-call; its *style* is fixed by the theme.

## Theming directive

- **Global (theme slot):** fill color, input text color, hint text color and style,
  content padding, corner radius, and border (color + width). A conformant transform
  installs these on the platform's global input-decoration theming mechanism. They must be
  **globally overridable, not per-instance.**
- **Per-call (resolved by the thin widget):** initial value, change callback, hint string,
  line count, input constraints/formatters, autofocus, and the enabled flag. These are the
  only concerns the theme cannot know per invocation — none of them carry visual tokens.

## Known gaps / planned fix

- **Intended redesign — surface decomposition.** The legacy field bundled a label sidebar,
  a vertical divider, and a bordered-card surface around the input. The current reference is
  **standalone**: it no longer renders the label sidebar / vertical divider / bordered-card
  wrapper. This contract specifies the standalone shape. (audit: surface decomposition.)
- **Dropped API surface.** `id`, `label`, and `labelDecoration` were removed; labelling is
  now a caller responsibility composed around the field. An `enabled` flag was added.
  Recorded as backlog, not re-introduced here. (link `flowin_pm`.)
- **No label / helper / error / counter slots.** Validation messaging, helper text, and
  character counters are not part of this contract today; callers compose them externally.
- **Hover / pressed / focused visuals.** v1 does not bind distinct tokens for hover,
  pressed, or focused states; they inherit from the platform input primitive. A future
  revision may bind a focused border token.
- **No size scale.** Unlike the action control, this component has no `xs`/`sm`/`md`
  footprint scale; height is padding + intrinsic. Adding sizes is deferred.

## Transform notes

- **Reference implementation:** `FlowinTextField` (flutter_flowin) — a thin composition
  over the framework's native form-text primitive (`TextFormField`), passing only
  per-instance content/constraints and letting the input theme slot style fill, hint,
  padding, and outline.
- **Theme slot (reference impl):** `inputDecorationTheme`.
- **Legacy names (reference):** `FDTextField` / `FDInputField` — provided `id`, `label`,
  `labelDecoration`, the label sidebar + `FDVerticalDivider` + `FDCard` surface, and a
  fixed min-height (`space.1600`); the modern reference drops all of these for a standalone
  field. `border.regular` (1px) is the platform border-side default width.
- **Color-role neutralization:** this contract names color roles by their platform-neutral keys (e.g. `borderSubtle`); a Flutter transform maps them to Material's `ColorScheme` roles per the table in [DESIGN.md §3](../../DESIGN.md#3-transformation-contract). The named slots in this file's bindings are already neutral.
- **Tag:** generic-primitive.
- **Conformance:** a theme-only-styling test must prove fill, hint style, content padding,
  corner radius, and border come from the theme, not the widget — override the input theme
  slot, render the field, assert it reflects the override.
