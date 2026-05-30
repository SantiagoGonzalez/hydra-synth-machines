# `pixelate(pixelX, pixelY)`

> Reduce la resolución efectiva agrupando píxeles en bloques.

## Parameters

| Param | Default | Range/Type | Effect |
|-------|---------|------------|--------|
| `pixelX` | `20` | number | Block width in pixels |
| `pixelY` | `pixelX` | number | Block height in pixels |

## Role in the Pipeline

`pixelate` is a **geometry** transform. It quantizes UV coordinates into blocks, creating a mosaic or retro-pixel look. Often applied to a modulator *inside* another modulate function to make spatial structure visible.

## Composition Examples

```js
// Pixelación básica
gradient().pixelate(8, 8).kaleid(4).out()

// Filtro RGB: pixeles por canal
var n = 50
var func = () => osc(30, 0.1, 1).modulate(noise(4, 0.1))
var pix = () => shape(4, 0.3).scale(1, 1, 3).repeat(n, n)
pix().mult(func().color(1, 0, 0).pixelate(n, n)).out(o1)

// Modulador pixelado dentro de modulatePixelate
shape(4).modulateScale(noise(8, 0).pixelate(2, 2)).out()
```

## Common Uses & Pitfalls

- Apply `pixelate` to the **modulator** (inner function) when using [`modulateScale`](../modulate/modulateScale.md) or [`modulatePixelate`](../modulate/modulatePixelate.md) — otherwise the effect can look similar to plain [`modulate`](../modulate/modulate.md).
- Large `pixelX`/`pixelY` values = chunkier blocks; `1` = no visible effect.

## Related Functions

- [`modulatePixelate`](../modulate/modulatePixelate.md) — pixelation amount driven by modulator
- [`kaleid`](kaleid.md) — often chained after pixelate for crystalline patterns
- [`posterize`](../color/posterize.md) — reduces color levels, not spatial resolution
