# `sub(texture, amount)`

> Resta la textura del argumento escalada del resultado actual.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `texture` | — | Subtracted source |
| `amount` | `0.5` | Scalar multiplier |

## Role in the Pipeline

`sub` is a **blend** operator listed in the [official function reference](https://hydra.ojack.xyz/functions/).

> **TODO:** Detailed semantics and examples not found in primary sources. Compare with [`diff`](diff.md) (absolute difference) and [`add`](add.md) (additive) when choosing operators.

## Composition Examples

```js
// Usado en remapping de paleta (Hydra Book)
osc(6, 0, 1.5).modulate(noise(3).sub(gradient()), 1)
src(o0).modulate(voronoi(6).sub(gradient()), 1).brightness(-0.5), 0.003)
```

## Common Uses & Pitfalls

- `.sub(gradient())` cancels position-to-color mapping from [`gradient`](../sources/gradient.md) when building custom modulator coordinates.

## Related Functions

- [`diff`](diff.md) — `abs(a - b)` with max alpha
- [`add`](add.md) — additive blend
- [`gradient`](../sources/gradient.md) — often subtracted in modulate recipes
