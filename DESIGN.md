# Flowin Design System — DESIGN.md

> **Status: spine.** This file is the agent-facing spine of the spec. Sections below
> are normative for v1. Component contracts live under `design/components/`; token
> sources live under `tokens/`. See the
> [`flowin_pm`](https://github.com/luisburgos/flowin_pm) backlog for planned work.

## 1. Thesis — theme-first

The Flowin Design System is **theme-first**: it favors the host platform's own global
theming mechanism over a closed catalog of styled widgets. The system is, first and
foremost, a set of tech-agnostic tokens and a contract for how those tokens are bound
into a platform theme. A platform's theme — not a wrapper widget — is the single place
where appearance is decided.

Tokens map onto the platform theme. The primitive palette (raw ramps, the dimension
scale, the type scale) is reduced to a semantic vocabulary (roles like a primary fill
and its on-color, a surface and its on-color, a subtle border), and that semantic
vocabulary is bound into whatever the platform offers as its global appearance store.
Where the platform models a concept natively (color roles, a type scale, per-component
defaults), the binding targets that native slot directly; where it does not, the binding
targets a platform-provided extension mechanism.

Component appearance is configured **through the theme, not recomputed per instance**.
A conformant transform pushes every appearance decision a component needs — fill colors,
corner radius, stroke, padding defaults, text style — into the platform's global theme so
that the platform's *own* native widgets already render in the Flowin look without any
wrapper. The design system is expressed as a theme that any native widget inherits, not
as a parallel set of widgets that re-derive styling on every build.

Against that backdrop a component resolves **only the per-call concerns the theme
genuinely cannot know**: which variant the call site wants (e.g. a filled vs. tonal vs.
text button) and which size. Variant and size are properties of the *call*, not of the
theme, so they are the only thing a thin component is allowed to resolve. Everything else
it inherits.

Custom components exist **only where the platform lacks an equivalent**. If the platform
already ships a widget that, once themed, produces the Flowin result, the design system
ships no wrapper for it — the themed native widget *is* the component. Custom widgets are
reserved for genuine Flowin concepts the platform does not model: bespoke layouts,
unique selection logic, or affordances with no native analogue. Those survive, but they
too consume the theme rather than hardcode appearance.

This thesis is a deliberate correction of a **legacy closed-wrapper anti-pattern**. The
legacy design layer got the tokens right — a complete, well-named foundation — and the
composition wrong. It shipped over-engineered, closed wrapper widgets that **bypassed the
platform's component themes and recomputed styling per instance inside each widget's
build path**. The shared theme it produced configured only the color scheme, the text
theme, and the scaffold background; it defined **zero component themes**. With no
component themes, styling had nowhere to live but inside the wrappers, so each wrapper
recomputed its own look on every build — and a consumer could not get a Flowin-styled
button from a native button; they were forced to use the wrapper. The design system
collapsed into a closed widget catalog instead of a theme.

The theme-first rebuild inverts this. The tokens are ported faithfully, then fed into a
**single theme builder** that produces a theme carrying full component themes plus an
extension for the non-native tokens. Native widgets — and the thin widgets that compose
them — are styled entirely by the theme, with no per-instance styling. The one-time
investment concentrates in the theme builder; adopting the system becomes a stable token
contract plus themed native widgets, not a parallel widget library. The reference
implementation has proven this end-to-end for the button (see §3 and §4).

## 2. Theming model

How tech-agnostic tokens map onto a platform's global theming mechanism.

**Semantic role vocabulary (neutralized — done):** the semantic color role keys are the
house agnostic role vocabulary for v1, and the platform-specific names inherited from the
first transform target have been **neutralized**. The role+on-color contract is
platform-neutral; the keys were initially aligned 1:1 with the reference implementation's
native scheme to keep that first transform verifiable, and the most platform-specific
names have since been renamed to neutral, self-describing keys. The neutralized names are
**`surfaceSecondary`** / **`onSurfaceSecondary`** (the tonal/secondary surface and its
on-color) and **`borderSubtle`** (the subtle border/outline role). These replace the
earlier platform-derived names (a `…Container` family and an outline-variant key). Roles
that were already neutral (a primary fill and its on-color, a surface on-color, an error
surface and its on-color) keep their names. The exact, current role set is **not**
restated here — it lives authoritatively under `tokens/semantic/`.

**The three tiers.** Tokens are organized as three tiers, and the mapping onto a
platform's global theming mechanism happens at the boundary between the second and third:

1. **Primitive** — the raw palette and scales (color ramps, the dimension/spacing scale,
   the radius scale, the type scale). Literal values; never consumed directly by
   components.
2. **Semantic** — roles that alias primitives (a primary fill and its on-color, a
   surface and its on-color, `surfaceSecondary`/`onSurfaceSecondary`, `borderSubtle`,
   an error surface and its on-color, …). This is the vocabulary components speak.
3. **Component bindings** — the rules that map semantic tokens into the platform's
   global theming mechanism, so that the platform's own widgets inherit the Flowin look.

The first two tiers are platform-agnostic data. The third tier is the transform: it takes
semantic roles and writes them into whatever the platform exposes as its global appearance
store — the platform's color-role table, its type scale, and its per-component default
slots.

**Semantic color uses role + on-color pairs.** Color is never a bare value in the semantic
tier; it is always a *role* paired with the *on-color* that is legible on top of it (a
fill and its on-color, a surface and its on-color, an error surface and its on-color).
This pairing is what makes the contract platform-neutral: any platform with a notion of
"a color and the color that goes on it" can host the binding, and a theme-level override
of a role implies the on-color travels with it.

**Non-color, non-type tokens go into a platform extension mechanism.** Spacing, radius,
shadow/elevation, and icon sizing have no universal native slot the way color roles and a
type scale do. These bind into the platform's **theme-extension mechanism** — a typed
escape hatch the platform provides for carrying design-system data on the global theme —
so they remain globally overridable and travel with the rest of the theme rather than
being hardcoded at call sites. The non-native, genuinely-Flowin concepts (for example a
size↔stroke pairing for icons, or the brand type styles that have no standard slot) live
here too.

The exact role set, including its on-color pairings, lives in `tokens/semantic/`. The
binding rules — which semantic role targets which native slot or extension field — are
specified per platform in §3.

## 3. Transformation contract

A *transform* takes the platform-agnostic tokens (§2) and binds them into one platform's
global theming mechanism. **Flutter is the named reference implementation**; the Flutter
column below is real and verified. The CSS column is illustrative — it shows the *shape*
of a second transform, not a shipped one.

### Mechanism mapping

| Concept | Flutter (reference) | Example: CSS (illustrative) |
|---|---|---|
| Semantic colors | Bound onto `ColorScheme` roles (role + on-color → the scheme's color/on-color pairs); native widgets inherit from `Theme.of(context).colorScheme`. | Custom properties on `:root` (`--color-primary`, `--color-on-primary`, …); elements read them via `var(--color-…)`. |
| Typography | Bound onto `TextTheme` slots; native text inherits the resolved text styles from the theme. | Custom properties (`--font-body`, `--line-height-body`, …) plus utility classes that apply them. |
| Spacing / radius / other non-Material tokens | Carried on a `ThemeExtension` (e.g. a `FlowinTokens` extension: spacing scale, radius, base shadow, icon sizing), read via a typed `context` accessor. | Custom properties (`--space-200`, `--radius-400`, `--shadow-100`, …) under `:root`. |
| Component appearance | Bound onto per-component theme slots (e.g. `filledButtonTheme`, and the analogous `…Theme` slot for each component); the native widget renders Flowin by default. | Component classes (`.flw-button`, `.flw-button--filled`, …) whose declarations resolve the custom properties. |

The Flutter column is the contract a conformant Flutter transform MUST satisfy: semantic
colors land on `ColorScheme`, typography on `TextTheme`, non-Material tokens on a
`ThemeExtension`, and every component's appearance on that component's theme slot. The CSS
column is shown only to demonstrate that the same token set maps onto a fundamentally
different mechanism (custom properties + classes) without changing the tokens — it is not
a delivered transform.

### Conformance rules

- **Every token binding must be globally overridable, not per-instance.** A binding is
  conformant only if changing it once on the global theme changes every consumer. If a
  value can only be changed by editing a call site, it is not a binding — it is a leak.
- **A conformant transform must let a theme-only test override any documented binding.**
  For every binding in the table above (and every component contract in §4), it must be
  possible to override that binding *purely through the theme* — with no change to the
  component or its call site — and observe the override on the rendered output. The
  reference implementation demonstrates this for the button: a test overrides the
  filled-button shape on the theme, pumps the button unchanged, and reads the themed
  radius off the rendered surface. Theme-overridability is the acceptance test for a
  transform.

### Do not

- **Do not apply per-instance hardcoded styling.** Appearance lives on the theme. A
  component resolves only per-call variant and size; it never hardcodes colors, radius,
  stroke, padding, or text style at the call site.
- **Do not invent values for documented gaps.** Where a token, role, or scheme value is
  declared a gap (§5), leave it as the declared placeholder/alias. Do not fabricate a
  brand hue, a missing dark-scheme on-color, or any value the source has not defined.
- **Do not collapse variants or sizes.** Variant and size are the per-call concerns a
  theme cannot know; preserve the full variant/size surface a component documents. Do not
  drop a variant or fold sizes together to simplify a transform.
- **Do not rename token references without updating bindings atomically.** A semantic role
  key and the component bindings that target it are one contract. If a role is renamed,
  update the bindings (and the component contracts that reference it) in the same change —
  never leave a binding pointing at a name that no longer exists.

## 4. Component index

The v1 catalog (modern-only: components validated theme-first in the reference
implementation), each tagged generic-primitive vs domain/app-specific.

| Component | Tag | Contract |
|---|---|---|
| button | generic-primitive | [design/components/button.md](design/components/button.md) |

_Remaining v1 components (icon-button, chip, chip-group, tabs, app-bar, action-sheet,
card, input-field, text-field, divider, color-picker-field, color-radial-button, …) are
authored under the component-contracts slice._

### Typography conversion rule

`letterSpacing` is authored in **px** (as authored in the Flowin foundation tokens). A transform targeting a
platform that expects relative units converts per binding: `em = letterSpacing_px /
fontSize_px`. `lineHeight` is a unitless ratio and transforms directly.

## 5. Open gaps

These are spec-coverage gaps known and tracked. They are declared here so transforms know
**not to invent values** for them (see §3 "Do not"). Each is tracked in the `flowin_pm`
backlog.

- **Chromatic brand accent.** The `primary` / `secondary` / `tertiary` roles are
  **placeholder aliases to the neutral ramp** — the brand has no chromatic accent yet.
  They exist as named slots awaiting a real palette. A transform must port them as the
  declared neutral aliases; it must not fabricate a brand hue. Re-pointing these to
  chromatic values is a future revisit, not a transform-time fix.
- **Dark-mode `onSurfaceBright` / `onSurfaceBrightVariant`.** The dark scheme defines
  `surfaceBright` but does **not** define `onSurfaceBright` or `onSurfaceBrightVariant`.
  This is a genuine gap: the bright surface has no declared on-color in dark mode. Do not
  invent these values — leave them undefined until the design source supplies them.
- **`primary` / `secondary` 400 ramp divergence.** Aliasing `primary` and `secondary` to
  the neutral ramp introduced a divergence at the 400 step: the `primary`/`secondary` 400
  value (`#b6b6b6`) does not match `neutral400` (`#ababab`). This off-by-shade divergence
  is an artifact of the placeholder aliasing and is resolved alongside the chromatic brand
  accent above; until then it is documented, not patched.
- **Legacy-only & intentionally-trimmed component capabilities.** Capabilities that
  existed in the legacy widgets but were intentionally dropped in the theme-first rebuild
  (and any legacy-only widgets not yet carried over) are tracked as scoped items in the
  `flowin_pm` backlog rather than re-derived here.
