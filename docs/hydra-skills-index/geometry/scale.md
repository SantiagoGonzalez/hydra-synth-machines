# `scale(x, y, z)`

> Escala las coordenadas de textura; estira o comprime el patrón en cada eje.

## Parameters

| Param | Default | Range/Type | Effect |
|-------|---------|------------|--------|
| `x` | `1` | number | Horizontal scale factor |
| `y` | `1` | number | Vertical scale factor |
| `z` | `1` | number | Third-axis scale (used in some repeat/3D-style tricks) |

## Role in the Pipeline

`scale` is a **geometry** transform. Values **> 1** zoom in (fewer pattern repeats visible); values **< 1** zoom out (pattern appears larger on screen). Essential before `repeat` when you want tiles to fill the frame after shrinking.

## Composition Examples

```js
// Línea fina desde shape(2)
shape(2).scale(0.01).out()
shape(2, 0.01, 0).out()  // equivalente con radius

// Estirar en Y para rejilla
shape(4, 0.4).scale(1, 1, 2).repeat(4, 8, 0.5).out()

// Feedback: zoom suave cada frame
src(o0).scale(1.1).layer(osc(30, 0.1, 1.5).mask(shape(4, 0.3, 0))).out(o0)

// Paleta: estirar gradient en Y para muestreo 1D
gradient().scale(1, 1, 1000).modulate(noise(3, 0).add(gradient(), -1), 1).out()
```

## Common Uses & Pitfalls

- `scale(0.9)` on `src(o0)` in a feedback loop creates a shrinking/zooming trail effect when combined with [`diff`](../blend/diff.md).
- Very large scale factors (e.g. `1000` on one axis) flatten a texture into a 1D strip — useful for palette remapping via [`modulate`](../modulate/modulate.md).
- Order: `scale` before `repeat` tiles a shrunken cell; `repeat` before `scale` scales the whole tiled field.

## Related Functions

- [`repeat`](repeat.md) — tiling after scale
- [`modulateScale`](../modulate/modulateScale.md) — scale driven by modulator colors
- [`src`](../sources/src.md) — feedback loops often use `.scale(1.01)` on self-read
