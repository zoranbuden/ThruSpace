# ThruSpace

A layout engine where a square and a circle share the same space, and you never say which one you are in.

Every layout engine in common use gives you a rectangle. If you want something arranged *around* a point
instead of *inside* a box, you go back to writing sine and cosine by hand. ThruSpace keeps both frames
available at once, in two dimensions or three, and works out which one you meant from the properties you set.

### → **[Open the live demo](https://zoranbuden.github.io/ThruSpace/demo.html)**

Three things to try there: drag the sliders and watch the layout hold its proportions; add items until the
fixed arrangement collides while the range-based one stays clear; turn the cube and see the same engine
place real HTML elements on a sphere.

```js
ThruSpace.layout('#space', [
  ...ThruSpace.ring('.node', { radius: 78 }),   // eight items on the circle
  { el: '#center', x: 0,  y: 0  },              // and two in the square
  { el: '#corner', x: 70, y: 78 }
]);
```

No mode is declared. `angle` and `radius` mean the circle; `x` and `y` mean the square. Both in one call.

## What it does

**Two frames, one origin.** A rectangular frame from the container's dimensions and a circle inscribed in
it, sharing a centre. The frame for an element is not stated — it follows from which properties you set,
so a mismatch between a declared mode and the values given can no longer happen.

**Relative units.** Coordinates run −100 to 100 as a share of half the container; radius 0 to 100 as a
share of the inscribed circle. Nothing is a pixel, so a layout stays correct at any container size with
no responsive code of your own.

**Ranges instead of fixed values.** Any value can be `[min, max]`. A deterministic solver walks a fixed
sequence of positions inside the range, starting at the middle, and takes the first one that does not
overlap anything already placed. Same input, same output, every time — no randomness, no iteration, no
learned model.

**Nesting without containers.** Give any element a `space` of its own and the same square, circle and axes
appear inside it, in its own units, with its own conflict resolution. Children know nothing about the
outer space, so moving the parent costs no recomputation and the view hierarchy does not grow.

**A third axis that does not break the first two.** Add `z` and the square becomes a cube; add `phi` and
the circle becomes a sphere. `phi` is measured from the axis facing the viewer and defaults to 90°, so a
layout written without it returns numerically identical positions — checked across every arrangement from
3 to 16 elements, where the largest `z` produced by a 2D call was 4.78 × 10⁻¹⁵.

## API

Three functions, seven property names, no configuration.

```js
ThruSpace.layout(container, items)
// items: [{ el, x, y, z, angle, phi, radius, space }]
// returns { placed, notes, depth }

ThruSpace.ring(selector, { radius, start, end })   // even spread over a circle or arc
ThruSpace.ball(selector, { radius })               // even spread over a sphere
```

| property | meaning |
|---|---|
| `x` `y` | −100 to 100, share of half the container |
| `z` | same, along the depth axis; its presence makes the frame a cube |
| `angle` | degrees from the positive x-axis |
| `phi` | degrees from the axis facing you; 90 is the screen plane |
| `radius` | 0 to 100, share of the inscribed circle or sphere |
| `space` | a list of items placed inside this element, in its own units |
| any of them | may be `[min, max]` instead of a number |

`notes` reports which elements the solver had to move and where it put them.

## Where this sits

Constraint solvers already spare you from computing final pixel positions, and they do it well. What none
of the mainstream engines offer is a non-rectangular frame.

| Engine | Relative positioning | Polar / radial frame | Ranges rather than fixed values |
|---|---|---|---|
| CSS Flexbox / Grid | yes | no | no |
| Android ConstraintLayout | yes | no | no |
| Apple Auto Layout | yes | no | inequalities only |
| ThruSpace | yes | yes | yes, with conflict resolution |

## Status

Prototype. `thruspace.js` is about 190 lines with no dependencies; `demo.html` carries a copy of it and
runs offline. No users yet.

**Working:** the shared square-and-circle space and its cube-and-sphere extension, frame inference, even
distribution over a circle, arc or sphere, relative units, nesting to any depth, and range solving with
overlap avoidance in all three axes.

**Not built:** contact relations between elements, and anything that targets a headset rather than a page.

**Known limits:** the overlap test is axis-aligned, which is forgiving for circular arrangements; the
solver resolves conflicts in the order elements are given rather than globally; and none of this has been
used by anyone but its author.

## Patents

Two German patent applications are pending:

- **DE 10 2026 004 760.9**, received 18 September 2026 — the methods described here: frame inference,
  relative units, the deterministic range solver, nesting, and the third axis.
- A second application covering the wider geometry model.

Patent pending; no patent has been granted. Documentation available on request.

## Licence

Source-available, not open source. Research, prototyping, testing, teaching and personal non-commercial
projects are permitted without asking. Commercial use requires a written licence — see
[LICENSE.md](LICENSE.md), or just write and ask.

## Contact

Zoran Buden — zoranbuden@gmail.com

Issues and questions are welcome. If you have ever hand-written `x = r·cos(θ)` to place something in a
user interface, I would particularly like to hear what you were building and what you wished had existed.
