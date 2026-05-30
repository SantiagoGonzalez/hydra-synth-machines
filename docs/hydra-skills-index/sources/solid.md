# `solid(r, g, b, a)`

> Genera una textura de color sólido uniforme en toda la pantalla; esencial como valor de referencia en operaciones aritméticas y para inicializar fondos.

## Parameters

| Param | Default | Range/Type | Effect |
|-------|---------|------------|--------|
| `r` | `0` | number [0, 1] | Red channel value |
| `g` | `0` | number [0, 1] | Green channel value |
| `b` | `0` | number [0, 1] | Blue channel value |
| `a` | `1` | number [0, 1] | Alpha channel value |

## Role in the Pipeline

`solid` is a **source** that outputs a constant RGBA color at every pixel. Its primary role is as an **arithmetic operand** — adding, subtracting, or multiplying `solid` against other textures is the standard way to shift, scale, or clamp channel values in Hydra.

## Composition Examples

```js
// Fondo rojo sólido
solid(1, 0, 0).out()

// Normalizar noise de [-1,1] a [0,1]
noise(4, 0.1).add(solid(1, 1, 1), 0.5).out()

// Desplazar un modulador al centro [-0.5, 0.5]
osc(6, 0, 1).brightness(-0.5).out()
// equivalente con solid:
osc(6, 0, 1).add(solid(1, 1), -0.5).out()

// Agregar rojo al canal X de un modulador
noise(2, 0).color(1, 0, 0).add(solid(0, 0.5)).add(gradient(), -1)

// Fondo transparente (para layer)
solid(0, 0, 0, 0).out()
```

## Common Uses & Pitfalls

- **Arithmetic bias**: `add(solid(1,1,1), 0.5)` adds 0.5 to every channel — the most common normalization pattern for `noise`.
- **Channel isolation**: `solid(1, 0, 0)` followed by `mult` isolates the red channel of another texture.
- **Alpha transparency**: `solid(0,0,0,0)` is a fully transparent black, useful as a starting point for `layer` compositions.
- `solid` has no spatial variation, so applying geometry transforms to it has no visible effect.

## Related Functions

- [`noise`](noise.md) — often needs `solid`-based normalization
- [`add`](../blend/add.md) — arithmetic pairing with `solid`
- [`color`](../color/color.md) — alternative for setting fixed RGB multipliers
- [`layer`](../blend/layer.md) — `solid` as a transparent base
