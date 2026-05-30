# `diff(texture)`

> Devuelve el valor absoluto de la diferencia entre dos texturas; alpha = max de ambas.

## Parameters

| Param | Effect |
|-------|--------|
| `texture` | Texture to differ against current chain |

## Role in the Pipeline

`diff` is a **blend** operator. Produces `abs(c0.rgb - c1.rgb)` with `alpha = max(c0.a, c1.a)`. Continuous edges unlike [`add`](add.md) with negative amount. Classic for feedback edge patterns.

## Composition Examples

```js
shape(4, 0.8).diff(src(o0).scale(0.9)).out(o0)

voronoi(10, 0).diff(src(o0).scale(0.9)).out(o0)

voronoi(10, 0, 0).thresh(0.5, 0).mask(shape(4, 0.8, 0.0))
  .diff(src(o0).scale(0.9)).out(o0)

shape(4, 0.9, 0).diff(src(o0).scale(0.9).mask(shape(4, 0.9, 0.0)).rotate(0.1)).out(o0)

solid(0.5, 0.5, 0.5).diff(osc(40, 0, 1)).out(o0)
```

## Common Uses & Pitfalls

- **vs `add(tex, -1)`**: `diff` is continuous; `add` clips negatives to black on output.
- Pair with [`scale`](../geometry/scale.md) on `src(o0)` slightly below 1.0 for stable feedback trails.

## Related Functions

- [`add`](add.md) — non-absolute subtraction
- [`prev`](../sources/prev.md) — shorthand previous frame
- [`mask`](mask.md) — constrain diff regions
