# `color(r, g, b, a)`

> Remapea o fija los canales de color de la textura.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `r`, `g`, `b` | `1, 1, 1` | Channel multipliers or fixed values |
| `a` | `1` | Alpha channel |

## Role in the Pipeline

`color` is a **color** transform. Used to tint textures, isolate channels for RGB-split effects, or build alpha masks (`color(0,0,0,1)` on desaturated shadows).

## Composition Examples

```js
// Canal rojo aislado en filtro RGB
pix().mult(func().color(1, 0, 0).pixelate(n, n)).out(o1)

// Sombra negra con alpha
f().saturate(0).luma(0.2, 0.2).color(0, 0, 0, 1)

// Modulador: solo R y G para desplazamiento XY
src(o1).modulate(src(o1).add(solid(1, 1), -0.5), 0.01)

noise(3, 0).color(1, 0, 0).add(solid(0, 0.5)).add(gradient(), -1).out()
```

## Common Uses & Pitfalls

- Modulators use **red and green** channels for X/Y displacement; blue is ignored by [`modulate`](../modulate/modulate.md) but used by [`modulateHue`](../modulate/modulateHue.md).
- `color(0.99, 0.99, 0.99)` on intensity textures can avoid texture wrapping in palette remapping (Hydra Book note).

## Related Functions

- [`r`](channels.md) / [`g`](channels.md) / [`b`](channels.md) — per-channel accessors
- [`solid`](../sources/solid.md) — flat color source for offsets
- [`modulateHue`](../modulate/modulateHue.md) — uses blue channel differently
