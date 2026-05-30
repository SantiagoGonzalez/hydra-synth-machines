# `add(texture, amount)`

> Suma la textura del argumento escalada por `amount` al resultado actual.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `texture` | — | Source chain or buffer (`o0`, `osc()`, etc.) |
| `amount` | `0.5` | Scalar multiplier on added texture |

## Role in the Pipeline

`add` is a **blend** operator. Adds RGB values channel-wise. Unlike [`diff`](diff.md), negative results can occur and appear as black when written to buffers.

## Composition Examples

```js
var n = 4
var a = () => shape(4, 0.4).repeat(n, n)
a().add(a().scroll(0.5 / n, 0.5 / n)).out()

// Normalizar noise a [0,1]
noise(4, 0.1).add(solid(1, 1, 1), 0.5).out()

// Comparación con diff (mantiene negativos → negro)
solid(0.5, 0.5, 0.5).add(osc(40, 0, 1), -1).out(o1)

// Paleta: offset de coordenadas
noise(3, 0).add(gradient(), -1).out(o1)
src(o1).add(solid(1, 1), -0.5)  // centrar a [-0.5, 0.5]
```

## Common Uses & Pitfalls

- `add(oX, -1)` is **not** identical to [`diff(oX)`](diff.md): `add` keeps negative values; `diff` uses absolute difference.
- [`noise`](../sources/noise.md) normalization: `.add(solid(1,1,1), 0.5)` shifts [-1,1] → [0,1].

## Related Functions

- [`diff`](diff.md) — absolute difference blend
- [`layer`](layer.md) — alpha-aware overlay
- [`solid`](../sources/solid.md) — constant offset partner
