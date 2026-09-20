# aizen

Personal site for **Harshith Gangaraju** — software systems at the intersection of
cybersecurity, AI and infrastructure.

The interface is meant to be the evidence, so the constraints below are the point
rather than incidental.

```bash
npm run dev     # dev server
npm test        # ridge generator + environment data
npm run build   # production build
npm run lint
node scripts/make-grain.mjs   # regenerate public/grain.png
```

Routes: `/lab/scenes` is a static reference sheet of all six environments.
`/lab/hero` is the Phase 1 hero prototype.

---

## The idea

The site is a landscape, and its depth axis is the abstraction stack.

A range's parallax speed encodes which layer of the stack it represents. Near
ranges are **what you operate** (infrastructure, deployment, on-call). Far ranges
are **what you model** (graphs, detection, recommendation). The mist between them
is uncertainty.

That is what keeps this from being wallpaper: every motion decision has a
referent. If the depth stops meaning something, the concept has failed.

---

## Environments

Six atmospheric states, descending light → dark and abstract → operational:

```
Morning mist → Blue hour → Ink wash → Dusk ember → Pine wind → Moonlit
```

They are **not** themes and there is deliberately no `prefers-color-scheme` rule:
the palette is content, owned by the environment state machine, not an OS
preference.

Every colour and scene parameter in `src/lib/environments.ts` was read off the
live [FeralUI Gradient Builder](https://feralui.dev/gradients) (SCENES › Mist) by
Sarthak Navalekar, not derived or guessed. Credited in the colophon.

The derived formulas in that file were solved against all six presets and hold
exactly — `veilDuration`, `veilAmplitude`, `rimOpacity`, `groundOpacity`. They are
covered by tests against the observed values.

### One number drives everything

`src/components/environment/environment-store.ts` holds a single `progress` along
the six-state sequence, so `1.4` means "40% of the way from Blue hour to Ink
wash". The hero's scroll timeline and the Sounding Line both write that one
value, which is why they can never disagree about what the environment is.

It is deliberately not React state — it updates every frame during a scrub, and
re-rendering six SVG scenes at 60fps would be absurd. Subscribers write styles
directly.

---

## The scene

Decoded from the reference's live DOM: the whole thing is **SVG and CSS**. There
is no `<canvas>` and no WebGL, which removes ~150KB of Three.js, a GPU budget and
an entire mobile fallback path while keeping every layer independently
composited.

```
.env-surface        linear-gradient(in oklab, …)  — oklab keeps mid-tones clean
.env-light          the sun/moon, outside the SVG (see below)
svg.env-scene       viewBox 1440x900, preserveAspectRatio="none"
  per range:        silhouette path (3-stop gradient = aerial perspective)
                    <use> of that same path as the crest rim light
                    fog veil — CSS transform keyframes, never a filter animation
  ground wash       bottom 14%, opacity = haze x 0.52
.grain              one pre-baked 3.9KB tile, never feTurbulence at runtime
```

### Things that are load-bearing, not arbitrary

**The light source lives outside the SVG.** The scene uses
`preserveAspectRatio="none"` so ranges stretch to any viewport, which squashes a
circle into an oval at phone ratios. Sized from container height with
`aspect-ratio: 1`, the sun stays round everywhere.

**The rim light is a `<use>`, not a second path.** Ridge geometry is most of the
document. The silhouette closes *outside* the viewBox on every side —
`RIDGE_TUNING.overhang` — precisely so the same path can be stroked without
drawing lines down the screen edges. This plus integer coordinates took the hero
from 445KB to 144KB raw (77.5KB → 43.3KB gzipped).

**Ridges are seeded, never random.** `Math.random()` must not appear in
`src/lib/ridge.ts`. Server and client render the same markup; a random ridge is a
guaranteed hydration mismatch. Tests assert determinism.

**`lattice` stays low.** High values read as torn paper or a heart monitor. A
silhouette needs a few big masses, not many small ones.

**Only `transform` and `opacity` animate per frame.** Animating an SVG filter or a
`stop-color` forces a repaint every frame. Environment changes are opacity
cross-fades over stacked scenes; at most two ever carry non-zero opacity and the
rest are `visibility: hidden`, which skips painting without touching layout.

---

## Animation

Two systems, with one rule that keeps them from fighting:

> **GSAP owns everything inside a pinned ScrollTrigger. Motion owns everything
> outside it. Never both on one property.**

GSAP (free including all plugins since April 2025) drives the hero's single
pinned master timeline, SplitText and DrawSVG. Motion handles React-level
interaction outside the pin.

Two constraints worth knowing before touching this:

- Motion's `useScroll` progress **ignores CSS transforms on the target and its
  ancestors**. A `useScroll` target inside a parallax layer silently reports the
  wrong number. Measure from an untransformed sibling.
- Every GSAP timeline is built inside `gsap.context()` and `gsap.matchMedia()`.
  Pinning without context cleanup in React is the classic bug.

Deliberately **not** used: Three.js, Lottie, Anime.js, Lenis. Each was evaluated
and none earns its bytes here — `scrub: 0.6` already provides the smoothing Lenis
would, and GSAP subsumes Anime.js now that it is free.

---

## Accessibility

Reduced motion is a **designed variant, not a subtraction**. The environment still
advances because it carries meaning — it steps on section entry instead of being
dragged by the scrollbar, and nothing is pinned.

The Sounding Line is a real slider: `role="slider"`, arrow keys step, Home/End
jump, and `aria-valuetext` announces the environment by name rather than reading
out an integer. Like the pull-cord it borrows from, it detents *mid-drag* at
depth rather than on release — that is what makes it feel mechanical.

With JavaScript disabled, Morning mist renders statically and the headline is
readable.

---

## Content rules

- **Never invent a number.** This will be enforced structurally by a `Metric`
  component that cannot render a value without a `source`. CYBER-OS publishes no
  benchmarks, so neither does this site.
- Three projects only — Qyverix, CYBER-OS/SENTINEL, Ideaspace. Depth over count.
- Mono is metadata only. Never body, never headlines.

---

## Credits

Colour presets and the layered-scene technique derive from the
[FeralUI Gradient Builder](https://feralui.dev/gradients) by Sarthak Navalekar.
Ridge generation, scroll choreography, the depth semantics and all components are
original.
