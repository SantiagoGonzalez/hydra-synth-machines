# `shape(sides, radius, smoothing)`

> Genera un polígono regular centrado en pantalla; con suficientes lados se convierte en un círculo, y con suavizado se producen formas difusas o máscaras.

## Parameters

| Param | Default | Range/Type | Effect |
|-------|---------|------------|--------|
| `sides` | `3` | integer ≥ 2 | Number of polygon sides; `2` = line, `4` = square, `999` ≈ circle |
| `radius` | `0.3` | number [0, 1] | Size of the shape relative to screen |
| `smoothing` | `0.01` | number | Edge softness; near `0` = sharp, near `1` = very fuzzy |

## Role in the Pipeline

`shape` is a **source**. It produces a white polygon on a black background, centered in screen space. Being centered is important: `kaleid`, `rotate`, and `scale` all operate around the screen center, so `shape` naturally composes with them.

Output range: **[0, 1]**. Fully white inside the shape, fully black outside (with `smoothing ≈ 0`). Because the background is black (not transparent), use `luma` or `mask` to make it compositable as an overlay.

## Composition Examples

```js
// Cuadrado
shape(4).out()

// Círculo
shape(999).out()

// Línea fina
shape(2, 0.01, 0).out()
// equivalente:
shape(2).scale(0.01).out()

// Polka dots: repetir círculos
shape(999, 0.4).repeat(8, 8).rotate(Math.PI / 4).out()

// Grid de cuadrados con desplazamiento
var n = 4
var a = () => shape(4, 0.4).repeat(n, n)
a().add(a().scroll(0.5/n, 0.5/n)).out()

// Máscara para otro efecto
osc(30, 0.1, 1).mask(shape(4, 0.5, 0.001)).out()
```

## Common Uses & Pitfalls

- **`smoothing` cannot be exactly `0`** in recent Hydra versions — use `0.001` for sharp edges.
- **Black background is opaque**: to use a shape as a compositing mask over another texture, use `.mask(shape(...))` (not `.mult`) to properly write the alpha channel, or use `.luma()` to extract the bright region as transparent overlay.
- **`sides = 2`** produces a thick horizontal band; scale it down with `.scale(1, 0.01)` or by setting a small `radius` to get a thin line.
- **Tiling patterns**: combining `shape` + `repeat` + `scroll` is the primary recipe for grids, dot arrays, and offset tile layouts.

## Related Functions

- [`repeat`](../geometry/repeat.md) — tile `shape` across the screen
- [`kaleid`](../geometry/kaleid.md) — apply radial symmetry to shape-based patterns
- [`mask`](../blend/mask.md) — use `shape` as an alpha cutout for another texture
- [`luma`](../color/luma.md) — extract the bright region with transparency
- [`scale`](../geometry/scale.md) — resize and stretch shapes non-uniformly
