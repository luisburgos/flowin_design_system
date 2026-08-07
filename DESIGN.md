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

**Flowin is monochrome by design.** The `primary`, `secondary` and `tertiary` ramps are
**neutral greys, deliberately** — identical at every step, carrying no hue. Colour in this
system is reserved for *meaning*: only the `error`, `warning` and `success` ramps are
chromatic. When nothing else on screen is coloured, a red or green is impossible to miss.

This is a decision, not an unfinished palette. Three same-valued brand ramps read like
placeholder scaffolding, and the legacy package shipped the same greys, so a conformance
pass comparing against it will keep finding grey and concluding nothing is wrong — which
is correct, for the opposite reason. Recorded here (2026-08-04) so the greys are not
"fixed" into brand hues by someone reading them as an oversight.

Consequence: a component that needs a distinguishable set of arbitrary colours — a colour
picker's palette, a chart series, user-chosen entity colours — takes them from the **call
site**, not from the brand ramps. The system supplies neutrals and semantics; it does not
supply a spectrum.

**Colour that comes from data is vetted, not trusted.** The consequence above leaves a
hole: a colour supplied by the call site — a team's colour, a chart series, a user-picked
accent — has no on-colour paired with it and no guarantee it differs from the surface it
lands on. Two questions follow at every such site, and the system answers both in one
place rather than letting each component invent its own heuristic:

1. **What can be drawn legibly on top of it?** A foreground is chosen from candidates
   (the caller's preference first, then black, then white) by WCAG 2.1 contrast ratio at
   a stated compliance level — 4.5:1 for normal text, 3.0:1 for large text and non-text
   UI, 7.0:1 for AAA.
2. **Does it stand apart from what is behind it?** When the colour and its background are
   within a luminance threshold of each other, the edge between them disappears and a
   border is needed to restore it.

**The layer reports; it does not repaint.** When no candidate meets the required ratio,
the best available is returned *and flagged as not meeting it*. A colour a designer chose
is never silently replaced — the call site decides whether to accept the shortfall, pick
a different seed, or surface a warning. Auto-correction would hide exactly the cases worth
knowing about.

A component consuming caller colour is **required** to resolve through this layer rather
than comparing luminance itself. Hand-rolled checks drift: the same rule implemented
independently at several call sites produces several different answers, which is what
happened before the layer existed (`flowin_pm#14`).

**Normal text (4.5:1) is the default compliance level.** A component asks for a different
one only when it knows its content is not body text — large display type or a non-text
element such as an icon or border, both 3.0:1. Defaulting to the stricter level is
deliberate: a component that guesses wrong at 3.0:1 ships unreadable body text, while one
that guesses wrong at 4.5:1 merely overshoots.

**Reporting is not the same as rendering.** The rule above governs what the layer *returns*
— it never silently swaps a seed colour and calls it a match. A component still has to
decide what to paint, and one drawing content **on** a caller's fill has no legible option
but to override an unreadable foreground: it cannot show the caller's colour and remain
readable, and unreadable content is not a shortfall the viewer can act on. Such a component
therefore treats a caller-supplied foreground as a *preference* — used when it meets the
level, replaced when it does not. The seed itself is still never repainted.

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

**Status roles are colors that go in the extension mechanism.** `success`, `warning` and
`info` — each with its on-color — are semantic color roles, but unlike the core roles they
have **no universal native slot**: a platform's color-role table typically models a primary,
a surface, and an error, and stops there. They therefore bind alongside spacing and radius
in the theme-extension mechanism rather than into the native color-role table, and they
live in their own token files (`tokens/semantic/color.status.*`) to keep that split visible.
`error` is **not** a status role in this sense — it has a native slot on every target and
stays in the core role set.

Two consequences follow. First, `info` is **neutral, not chromatic**: it is not an alert, so
under the monochrome thesis below it carries no hue. Second, the chromatic status steps
**lighten in dark mode** (the 500 step becomes 400) so they hold their contrast against a
dark surface, with the on-colors darkening to match — the core roles' light/dark pairs are
declared the same way.

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
| Typography (baseline) | Overlaid onto `TextTheme` slots on top of Material's own scale with the Flowin family applied; native text inherits the resolved styles. | Custom properties (`--font-body`, `--line-height-body`, …) plus utility classes that apply them. |
| Typography (caption + brand) | No `TextTheme` slot exists for these, so they are exposed as typed accessors alongside the theme rather than replacing a standard slot. | Additional custom properties + their own utility classes. |
| Spacing / radius / other non-Material tokens | Carried on a `ThemeExtension` (e.g. a `FlowinTokens` extension: spacing scale, radius, base shadow, icon sizing), read via a typed `context` accessor. | Custom properties (`--space-200`, `--radius-400`, `--shadow-100`, …) under `:root`. |
| Status colors (`success` / `warning` / `info` + on-colors) | Carried on the same `ThemeExtension` (a semantic-colors value object), **not** on `ColorScheme` — Material models no such roles. Resolved per brightness. | Custom properties (`--color-success`, `--color-on-success`, …) under `:root`, re-declared in the dark-mode block. |
| Base elevation shadow | Carried on the `ThemeExtension` as the resolved per-brightness shadow; the geometry is one token, the colour binds to the per-mode `shadow` role. | `--shadow-100` under `:root`, re-declared in the dark-mode block. |
| Component appearance | Bound onto per-component theme slots (e.g. `filledButtonTheme`, and the analogous `…Theme` slot for each component); the native widget renders Flowin by default. | Component classes (`.flw-button`, `.flw-button--filled`, …) whose declarations resolve the custom properties. |

The Flutter column is the contract a conformant Flutter transform MUST satisfy: semantic
colors land on `ColorScheme`, typography on `TextTheme`, non-Material tokens on a
`ThemeExtension`, and every component's appearance on that component's theme slot. The CSS
column is shown only to demonstrate that the same token set maps onto a fundamentally
different mechanism (custom properties + classes) without changing the tokens — it is not
a delivered transform.

### Role-name mapping (neutral → Material)

Several semantic role keys were given **platform-neutral names** so the agnostic layer does
not presuppose any one framework's vocabulary (see §2). The Flutter reference implementation
binds them onto Material's `ColorScheme` roles — the names differ, the binding is identical.
This table is the single source of truth for that mapping; a Flutter transform applies it,
and a reviewer uses it to confirm that a Material name in the code is the *correct* transform
of a neutral spec name, not a deviation.

| Spec (neutral) | Flutter (`ColorScheme` role / radius) |
|---|---|
| `surfaceSecondary` | `secondaryContainer` |
| `onSurfaceSecondary` | `onSecondaryContainer` |
| `borderSubtle` | `outlineVariant` |
| `cornerSmoothing` | `iOSSmooth` (the `figma_squircle` smoothing factor) |

Role keys not listed here map to the identically-named Material role (`primary` →
`primary`, `onSurface` → `onSurface`, …). For a non-Material target (e.g. CSS custom
properties), the neutral name *is* the name — no mapping applies.

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
| item-button | generic-primitive | [design/components/item-button.md](design/components/item-button.md) |
| icon-button | generic-primitive | [design/components/icon-button.md](design/components/icon-button.md) |
| chip | generic-primitive | [design/components/chip.md](design/components/chip.md) |
| chip-group | generic-primitive | [design/components/chip-group.md](design/components/chip-group.md) |
| chip-group-view-pager | generic-primitive | [design/components/chip-group-view-pager.md](design/components/chip-group-view-pager.md) |
| tabs | generic-primitive | [design/components/tabs.md](design/components/tabs.md) |
| tab-item | generic-primitive | [design/components/tab-item.md](design/components/tab-item.md) |
| app-bar | generic-primitive | [design/components/app-bar.md](design/components/app-bar.md) |
| action-sheet | generic-primitive | [design/components/action-sheet.md](design/components/action-sheet.md) |
| card | generic-primitive | [design/components/card.md](design/components/card.md) |
| input-field | generic-primitive | [design/components/input-field.md](design/components/input-field.md) |
| text-field | generic-primitive | [design/components/text-field.md](design/components/text-field.md) |
| labeled-text-field | generic-primitive | [design/components/labeled-text-field.md](design/components/labeled-text-field.md) |
| divider | generic-primitive | [design/components/divider.md](design/components/divider.md) |
| color-picker-field | domain/app-specific | [design/components/color-picker-field.md](design/components/color-picker-field.md) |
| color-radial-button | domain/app-specific | [design/components/color-radial-button.md](design/components/color-radial-button.md) |

### Typography conversion rule

`letterSpacing` is authored in **px** (as authored in the Flowin foundation tokens). A transform targeting a
platform that expects relative units converts per binding: `em = letterSpacing_px /
fontSize_px`. `lineHeight` is a unitless ratio and transforms directly.

### Typography binding rules

**The type scale overlays the platform's baseline; it does not replace it.** A conformant
transform starts from the platform's own type scale, applies the Flowin font family across
it, and then overrides *only* the slots the token set names. Slots the token set does not
name keep their platform-default size and weight, in the Flowin family. Replacing the whole
scale would leave unnamed slots undefined and change the rendering of native widgets that
read them.

**Two families, two roles.** The **baseline** family carries the working type — body, labels,
titles, captions — and is what native widgets inherit. The **brand** family is expressive
display type; it has no standard slot on a typical platform and therefore binds through the
theme-extension mechanism (§2) alongside the other non-native tokens. A transform must keep
both reachable: replacing brand styles with baseline ones collapses the distinction the two
families exist to draw.

**A font family shipped with the design system must be referenced by its packaged name.**
Where a platform namespaces bundled font assets (so that a library's font is addressed
differently from an application's), the binding must use the namespaced form. Referencing
the bare family name typically does not fail loudly — it silently falls back to the host's
default UI font, which on some platforms resembles the intended face closely enough to pass
review unnoticed.

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
  accent above; until then it is documented, not patched. **Currently inert:** no semantic
  role binds a brand ramp's 400 step, so the divergence reaches no rendered output
  (verified against the reference implementation, audit unit 1). It becomes live the moment
  a role does bind that step.
- **`typography.baseline.titleLarge` is declared but not bound.** The style is defined in
  the token set, but no component contract cites it and the reference implementation leaves
  the corresponding native slot at the platform default (carried forward from the production
  source, where it appears to be an oversight). A transform must **not** install it just
  because it exists — see the token's own `$description`. Resolving this means either binding
  it deliberately across all transforms or removing it; until then it stays declared and
  unbound, not silently adopted.

- **Legacy-only & intentionally-trimmed component capabilities.** Capabilities that
  existed in the legacy widgets but were intentionally dropped in the theme-first rebuild
  (and any legacy-only widgets not yet carried over) are tracked as scoped items in the
  `flowin_pm` backlog rather than re-derived here.
