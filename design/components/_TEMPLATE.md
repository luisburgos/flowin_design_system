# Component: <concept-name>

> Fixed contract template. The **binding contract** (Intent, States, Token Bindings,
> Behavioral notes) is **normative**. **Anatomy is illustrative** — where a component's
> rendering is platform-dependent, say so and specify the intent, not the rendering.

## Intent

One sentence: what this component is *for*, independent of how any platform renders it.

## Anatomy (illustrative)

The reference implementation's structure. Not binding. Note explicitly if the anatomy is
platform-dependent.

## Variants

| Variant | Purpose |
|---|---|

## Sizes

| Size | Notable dimensions (padding, min-height, icon size, text style) |
|---|---|

## States

default · hover · pressed · focused · disabled (list those that apply).

## Token bindings (normative)

The machine-targetable core: property × state → token reference.

| Property | State | Token |
|---|---|---|

## Behavioral notes

Behavior the token bindings can't express (gestures, async, helper APIs, etc.).

## Theming directive

What is styled globally (theme) vs. resolved per-call (the concerns the theme cannot know).

## Known gaps / planned fix

Documented deviations from the reference and their planned remediation (link `flowin_pm`).

## Transform notes (optional)

Per-technology hints. Reference implementation name (e.g. `FlowinButton`). Generic-primitive
vs domain/app-specific tag.
