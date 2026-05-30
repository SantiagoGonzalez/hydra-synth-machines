# `kaleid(nSides)`

> Refleja el patrón radialmente alrededor del centro, creando simetría tipo mandala.

## Parameters

| Param | Default | Range/Type | Effect |
|-------|---------|------------|--------|
| `nSides` | `4` | number | Number of mirror segments (higher = more folds) |

## Role in the Pipeline

`kaleid` is a **geometry** transform. It takes the top portion of the image (in normalized UV space), mirrors it, and arranges copies like a triangle fan. Works best when the source has strong directional color (e.g. [`gradient`](../sources/gradient.md) top = red).

## Composition Examples

```js
// Mandala desde gradiente
gradient().pixelate(8, 8).kaleid(4).out()

// Rayos desde el centro (wedge fino + kaleid)
var k = 16
var d = Math.PI / 2 / k
shape(2, d, 0).scrollY(d / 2).rotate(Math.atan2(d, 1))
  .scrollY(-d / 2 - 0.5).kaleid(k).out()

// Respiración radial con modulateScale
osc(60, 0).modulateScale(osc(8, 0)).kaleid(400).out()

// En cadena de modulación
osc(40, 0.1, 1).modulateRotate(osc(12, 0).kaleid(100), 4).out()
```

## Common Uses & Pitfalls

- Dominant color at the **top** of the source maps to the center of the kaleidoscope (Hydra UV: y=0 at top).
- Very high `nSides` (100–400) with [`modulateScale`](../modulate/modulateScale.md) creates ripple/breathing effects toward center.
- Demo masks using `shape(1,0,0).invert()` for wedge visualization may not work for all `k < 4`.

## Related Functions

- [`rotate`](rotate.md) — combine to spin kaleidoscopic output
- [`modulateKaleid`](../modulate/modulateKaleid.md) — kaleid segment count driven by modulator
- [`pixelate`](pixelate.md) — chunky input before kaleid for crystalline look
