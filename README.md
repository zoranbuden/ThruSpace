# ThruSpace

Deterministic placement for things that must not overlap — labels, markers, annotations — in a rectangular
frame or a circular one.

Give an element an anchor and an ordered list of sides to try. The first side that does not collide with
anything already placed is the one it takes. Same input, same output, every time: no annealing, no force
simulation, no random seed. A chart rendered in a test matches the one on screen.

### → **[Open the live demo](https://zoranbuden.github.io/ThruSpace/demo.html)**

Start at **Labels that find a free side**: drag the point count up and watch labels step around their
anchors, then switch on hiding and watch the overlap count go to zero.

```js
ThruSpace.layout('#chart', [
  // the anchors first: fixed, they are the data and must not move
  ...points.map(p => ({ el: p.dot, x: p.x, y: p.y })),

  // then the labels, each with sides to try in order
  ...points.map(p => ({
    el: p.label,
    at: p.dot,
    gap: 3,
    placement: ['right', 'top', 'left', 'bottom',
                'top-right', 'bottom-right', 'top-left', 'bottom-left'],
    hideIfBlocked: true
  }))
]);
```

The engine works out how far apart two elements must sit for their edges to meet, so `gap` is distance
beyond touching rather than a guess. List anchors before labels: an anchor never moves, so anything placed
after it has to work around it, not the other way round.

## What it does

**Ordered placement with a deterministic result.** Sides are tried in the order you give them. The first
free one wins; if none is free the element either takes the last side or is hidden, and either way it is
reported. Across every arrangement in the demo, with hiding on, no label ends up overlapping anything.

**Ranges, not just sides.** Any value can be `[min, max]`. The solver walks a fixed sequence of positions
inside the range, starting at the middle, and takes the first that does not collide. Same idea as
placement, applied to a continuous value instead of a list.

**A circular frame, not only a rectangle.** Every container carries two frames at once: a rectangle from
its dimensions and a circle inscribed in it, sharing an origin. Write `x` and `y` and an element goes in
the rectangle; write `angle` and `radius` and it goes on the circle. Both work in the same call, and no
mode is declared. Labels around a dial get the same collision handling as labels on a scatter plot.

**Relative units.** Coordinates run −100 to 100 as a share of half the container; radius 0 to 100 as a
share of the inscribed circle. Nothing is a pixel, so a layout holds at any container size with no
responsive code of your own.

**Nesting without containers.** Give any element a `space` of its own and the same frames appear inside
it, in its own units, with its own conflict resolution. Children know nothing about the outer space, so
moving the parent costs no recomputation and the view hierarchy does not grow.

**A third axis that does not break the first two.** Add `z` and the rectangle becomes a cuboid; add `phi`
and the circle becomes a sphere. `phi` is measured from the axis facing the viewer and defaults to 90°, so
a layout written without it returns numerically identical positions — checked across every arrangement
from 3 to 16 elements, where the largest `z` produced by a 2D call was 4.78 × 10⁻¹⁵.

## API

Three functions, eleven property names, no configuration.

```js
ThruSpace.layout(container, items)
// items: [{ el, x, y, z, angle, phi, radius, space,
//           at, gap, placement, hideIfBlocked, align }]
// returns { placed, notes, depth }

ThruSpace.ring(selector, { radius, start, end })   // even spread over a circle or arc
ThruSpace.ball(selector, { radius })               // even spread over a sphere
```

| property | meaning |
|---|---|
| `at` | an anchor element to position against instead of the frame |
| `placement` | with `at`, an ordered list of sides or angles; the first free one is used |
| `gap` | distance beyond touching, in pixels |
| `hideIfBlocked` | with `placement`, hide the element when no side is free |
| `align` | with `at`, `'x'` or `'y'` shares that axis and keeps its own value on the other |
| `x` `y` | −100 to 100, share of half the container |
| `z` | same, along the depth axis; its presence makes the frame a cuboid |
| `angle` | degrees from the positive x-axis |
| `phi` | degrees from the axis facing you; 90 is the screen plane |
| `radius` | 0 to 100, share of the inscribed circle or sphere |
| `space` | a list of items placed inside this element, in its own units |
| any of them | may be `[min, max]` instead of a number |

Side names: `right`, `top-right`, `top`, `top-left`, `left`, `bottom-left`, `bottom`, `bottom-right`, or a
number in degrees.

`notes` reports which elements had to move, where they went, and which were hidden.

## Where this sits

Label collision is an old problem with several good answers. The usual ones resolve it by simulation —
`avoid-overlap` uses simulated annealing, D3 setups often use a force layout — which works well and gives
a slightly different result each run. Chart libraries solve it inside themselves: AG Charts, for instance,
takes an ordered `placement` array much like this one, and that pattern is where the idea came from.

| | moves labels | ordered fallback | repeatable byte for byte | outside a chart library | circular frame |
|---|---|---|---|---|---|
| `avoid-overlap` | yes | yes (choices) | no | yes | no |
| D3 force layout | yes | no | no | yes | no |
| Chart-library built-ins | yes | some | varies | no | rarely |
| ThruSpace | yes | yes | yes | yes | yes |

So this is not a new idea. What it is: the ordered-placement pattern pulled out of any one chart library,
made strictly repeatable, and extended to circular frames and to three dimensions.

## Status

Prototype. `thruspace.js` is about 290 lines with no dependencies; `demo.html` carries a copy of it and
runs offline. No users yet.

**Working:** ordered placement with optional hiding, range solving, contacts and axis alignment, the
shared rectangle-and-circle frame and its cuboid-and-sphere extension, frame inference, even distribution
over a circle, arc or sphere, relative units, and nesting to any depth.

**Not built:** anything that targets a headset rather than a page. Labels are placed in the order given
rather than optimised globally, so a different order can give a better arrangement — the demo's numbers
are what this particular order achieves, not the best possible.

**Known limits:** the overlap test is axis-aligned, which is forgiving for round elements; anchors sitting
on top of each other cannot be fixed by any label strategy and are counted separately in the demo; and
none of this has been used by anyone but its author.

## Patents

Two German patent applications are pending, the first received by the DPMA on 18 September 2026 under
**DE 10 2026 004 760.9**. They cover the geometry model: frame inference, relative units, the deterministic
range solver, nesting, and the third axis.

The ordered-placement feature described at the top of this file is **not** covered by either application.
It is a known pattern and is published here as ordinary source.

Patent pending; no patent has been granted.

## Licence

Source-available, not open source. Research, prototyping, testing, teaching and personal non-commercial
projects are permitted without asking. Commercial use requires a written licence — see
[LICENSE.md](LICENSE.md), or just write and ask.

## Contact

Zoran Buden — zoranbuden@gmail.com

Issues and questions are welcome. If you have ever fought with labels colliding on a chart or a map, I
would like to hear what you were building, what you tried, and what you settled for.
