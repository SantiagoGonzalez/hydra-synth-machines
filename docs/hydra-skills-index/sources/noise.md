# `noise(scale, offset)`

> Genera una textura de ruido procedural con valores en el rango [-1, 1], diferente a los demás generadores de fuente.

## Parameters

| Param | Default | Range/Type | Effect |
|-------|---------|------------|--------|
| `scale` | `10` | number | Spatial frequency of the noise; higher = finer grain |
| `offset` | `0.1` | number | Speed/phase of temporal animation; `0` = frozen |

## Role in the Pipeline

`noise` is a **source**. It produces a full-screen procedural (Perlin-like) noise texture. Unlike `osc`, `gradient`, and `voronoi`, the output range is **[-1, 1]** — values below zero are clipped to black when written to a buffer.

This asymmetry makes `noise` a powerful modulator and a tricky blend target; normalization is often required before compositing.

## Composition Examples

```js
// Noise básico animado
noise(4, 0.1).out()

// Normalizado a [0,1] para blend seguro
noise(4, 0.1).add(solid(1, 1, 1), 0.5).out()

// Como modulador: distorsiona un oscilador
osc(40, 0, 1).modulate(noise(3, 0)).out()

// Noise auto-modulado en loop de feedback (efecto 3D)
noise(10, 0).modulate(o0).blend(o0, 0.9).out(o0)

// Noise congelado como textura estática
noise(6, 0).out()
```

## Common Uses & Pitfalls

- **Output range [-1, 1]**: when writing `noise` to a buffer with `.out()`, negative values are clipped to 0. If you then read that buffer via `src(o0)`, you only see [0, 1]. Normalize inline with `.add(solid(1,1,1), 0.5)` if the full range matters.
- **As a modulator**: `noise` is the most common argument inside `modulate()` because its organic contours produce natural-looking distortion. Use low `scale` (2–5) for broad warps and high `scale` (10–20) for fine grain.
- **Self-modulating feedback**: `noise(10,0).modulate(o0).blend(o0,0.9).out(o0)` creates a smooth 3D-like evolving texture — a classic starting point.
- **`offset = 0`** freezes the texture; useful when you want noise to drive spatial layout without temporal drift.

## Related Functions

- [`voronoi`](voronoi.md) — alternative organic source; outputs [0, 1] unlike `noise`
- [`modulate`](../modulate/modulate.md) — primary consumer of `noise` as a modulator
- [`luma`](../color/luma.md) — useful for creating conditional masks from noise regions
- [`colorama`](../color/colorama.md) — applying colorama to noise produces vivid HSV cycling
