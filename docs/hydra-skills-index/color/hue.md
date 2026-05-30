# `hue(amount)`

> Desplaza el matiz en espacio HSV preservando saturación y brillo.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `amount` | `0.5` | Hue rotation amount (fractional shift in HSV) |

## Role in the Pipeline

`hue` is a **color** transform. It shifts hue while keeping saturation and value intact — predictable color cycling unlike [`colorama`](colorama.md). Ideal for slow drift in feedback loops.

## Composition Examples

```js
osc(30, 0, 1).hue(0.5).out()

// Feedback con deriva de color
src(o0).modulateRotate(noise(2, 0), 0.03).hue(0.003)
  .layer(shape(2, 0.125).luma().color(0, 0, 1)).out(o0)

osc(10, 0, 1).hue(0.5).layer(osc(10, 0, 1).mult(shape(4, 0.5, 0.001))).out()
```

## Common Uses & Pitfalls

- Small `hue` increments per frame (0.001–0.01) in feedback create smooth rainbow trails.
- Documented in Hydra Book as useful though not always in the interactive reference sidebar.

## Related Functions

- [`colorama`](colorama.md) — shifts H, S, and V; less predictable
- [`saturate`](saturate.md) — controls saturation independently
- [`osc`](../sources/osc.md) — `offset` param also shifts channel phases
