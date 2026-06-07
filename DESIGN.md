# Flowin Design System — DESIGN.md

> **Status: scaffold.** This file is the agent-facing spine of the spec. Sections below
> are stubs to be filled by the v1 issues. See the
> [`flowin_pm`](https://github.com/luisburgos/flowin_pm) backlog for planned work.

## 1. Thesis — theme-first

_TBD (issue: DESIGN.md spine). Source material: the legacy-vs-modern rationale relocated
into `docs/`._

The system favors the host platform's global theming mechanism. Tokens map onto the
platform's theme; component appearance is configured through the theme, not recomputed
per instance. A component resolves only the per-call concerns the theme genuinely cannot
know (e.g. which variant, which size). Custom components exist only where the platform
has no equivalent.

## 2. Theming model

_TBD. How tech-agnostic tokens map onto a platform's global theming mechanism._

**Semantic role vocabulary (decided):** the semantic color role keys (primary, onPrimary,
secondaryContainer, onSecondaryContainer, onSurface, outlineVariant, errorContainer,
onErrorContainer) are adopted as the house agnostic role vocabulary for v1. They are
Material-3-derived; this is a deliberate choice — the role+on-color contract is
platform-neutral, and aligning keys with the first transform target keeps that transform
1:1 and verifiable. The most platform-specific names (the `…Container` family,
`outlineVariant`) are scheduled for neutralization when the full role set and dark mode
land.

## 3. Transformation contract

_TBD. Mechanism-mapping table (Flutter row real, others as shape-examples) +
tech-agnostic conformance rules (chiefly: every token binding must be globally
overridable, not per-instance) + a "do not" list._

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

_TBD. Spec-coverage gaps tracked in the `flowin_pm` backlog (chromatic brand hue;
dark-mode `onSurfaceBright` / `onSurfaceBrightVariant`; legacy-only and intentionally-
trimmed capabilities)._
