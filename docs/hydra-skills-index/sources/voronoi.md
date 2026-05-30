# `voronoi(scale, speed, blending)`

> Genera una textura de diagrama de Voronoi con celdas orgánicas, útil como fuente o como modulador de formas con bordes nítidos.

## Parameters

| Param | Default | Range/Type | Effect |
|-------|---------|------------|--------|
| `scale` | `5` | number | Number of Voronoi cells; higher = more, smaller cells |
| `speed` | `0.3` | number | Rate at which cell seed points move; `0` = frozen |
| `blending` | `0.3` | number | Softness/sharpness of cell boundaries; `0` = sharp edges |

## Role in the Pipeline

`voronoi` is a **source**. It produces a cellular pattern where each pixel is colored by its distance to the nearest seed point. Output range: **[0, 1]** — safe to blend without normalization.

Setting `blending` to `0` produces binary sharp cells; combine with `thresh` and `mask` for crisp geometric cutouts. Setting it near `1` creates a smooth gradient field similar to `noise`.

## Composition Examples

```js
// Celdas de Voronoi animadas
voronoi(5, 0.3, 0.3).out()

// Bordes nítidos con umbral
voronoi(10, 0, 0).thresh(0.5, 0).out()

// Feedback con efecto de profundidad falsa
voronoi(10, 0).modulate(o0).blend(o0, 0.9).out(o0)

// Voronoi como máscara con forma cuadrada
voronoi(10, 0, 0).thresh(0.5, 0).mask(shape(4, 0.8, 0.0)).diff(src(o0).scale(0.9)).out(o0)
```

## Common Uses & Pitfalls

- **Sharp vs. soft**: `blending = 0` is useful for cellular/tile patterns, but naive feedback may explode into full noise — wrap with a `mask(shape(...))` to constrain it.
- **Output range**: unlike `noise`, voronoi outputs [0, 1], so it can be used directly as a blend operand.
- **Modulation role**: voronoi works well as a modulator for geometry operations, producing irregular, organic warping.
- **`speed = 0`**: freezes the cell positions; useful for static pattern composition.

## Related Functions

- [`noise`](noise.md) — similar organic source but outputs [-1, 1]
- [`thresh`](../color/thresh.md) — binarizes voronoi cells for sharp geometric cutouts
- [`mask`](../blend/mask.md) — constrains voronoi feedback patterns
- [`modulate`](../modulate/modulate.md) — use voronoi as a warp field
