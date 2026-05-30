# `gradient(speed)`

> Genera un degradado de color que mapea la posición de pantalla a valores RGB, útil como paleta de color o como modulador de posición.

## Parameters

| Param | Default | Range/Type | Effect |
|-------|---------|------------|--------|
| `speed` | `0` | number | Rate of color cycling over time; `0` = static |

## Role in the Pipeline

`gradient` is a **source**. It maps screen coordinates directly to RGB values: the red channel increases left-to-right, and the green channel increases top-to-bottom. This makes `gradient` uniquely useful as a **positional lookup texture** in modulation chains.

Output range: **[0, 1]**. The static version (`gradient(0)`) is a pure coordinate map — `x` in red, `y` in green.

## Composition Examples

```js
// Degradado estático (coordenadas en color)
gradient(0).out()

// Degradado animado
gradient(1).out()

// Como paleta para remapeo de color:
// El noise modula el oscilador usando el gradient como offset de posición
osc(Math.PI * 2, 0, 2).modulate(noise(3, 0).add(gradient(), -1), 1).out()

// Estirado en Y para muestreo horizontal de paleta
gradient().scale(1, 1, 1000).modulate(noise(3, 0).add(gradient(), -1), 1).out()
```

## Common Uses & Pitfalls

- **As a modulator offset**: `add(gradient(), -1)` subtracts the pixel position, which cancels the coordinate shift in `modulate`. This is the key technique for color remapping — mapping grayscale intensity to a 1D palette.
- **Positional awareness**: because `gradient` encodes `(x, y)` position as `(r, g)`, using it inside `modulate(gradient(), amount)` creates a uniform directional warp rather than a distortion based on texture content.
- **`speed > 0`** cycles colors continuously; at moderate values it creates a flowing rainbow.

## Related Functions

- [`osc`](osc.md) — alternative colored source
- [`modulate`](../modulate/modulate.md) — `gradient` as a modulator produces linear coordinate offsets
- [`solid`](solid.md) — complement for arithmetic operations (e.g. `add(solid(0, 0.5), ...)`)
- [`color`](../color/color.md) — recolor a gradient output
