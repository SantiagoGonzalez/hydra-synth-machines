# `modulateScale(texture, multiplier, offset)`

> Escala las coordenadas de muestreo según los canales R y G del modulador (variante de `modulate`).

## Parameters

| Param | Effect |
|-------|--------|
| `texture` | Modulator source |
| `multiplier` | Scale factor driven by modulator |
| `offset` | Additional offset (optional in some examples) |

## Role in the Pipeline

`modulateScale` **scales** pixel positions by `(r, g)` from the modulator instead of translating them. Can produce extreme distortion — pleasant at low amounts. Unlike [`modulateScrollX`](modulateScroll.md), scaling avoids texture-wrap discontinuities.

## Composition Examples

```js
osc(60, 0).modulateScale(osc(8, 0)).out(o0)

osc(60, 0).modulateScale(osc(8, 0)).kaleid(400).out(o0)

shape(400, 0.5).repeat(40, 40)
  .modulate(osc(60, 0).modulateScale(osc(8, 0)).kaleid(400), 0.02).out()

shape(4).modulateScale(noise(8, 0).pixelate(2, 2)).out()

shape(999).repeat(1, 1)
  .modulateScale(noise(8, 0).pixelate(8, 8).add(solid(1, 1)).color(0.5, 0.5).posterize(4, 1), -1.3, 1).out()
```

## Common Uses & Pitfalls

- `modulateScale` on [`shape`](../sources/shape.md) alone often looks like plain [`modulate`](modulate.md) — pixelate the modulator first.
- Scale factor **< 1** + [`repeat`](../geometry/repeat.md) creates tiled repetition patterns.
- [`posterize`](../color/posterize.md) on modulator keeps scale factors below 1 for stepped tiling.

## Related Functions

- [`modulate`](modulate.md) — translation-based distortion
- [`kaleid`](../geometry/kaleid.md) — radial breathing after modulateScale
- [`scale`](../geometry/scale.md) — non-modulated geometry scale
