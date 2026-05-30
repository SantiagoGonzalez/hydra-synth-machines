# `brightness(amount)`

> Ajusta el brillo de la imagen sumando un offset a los canales.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `amount` | `0.5` | Brightness offset added to RGB |

## Role in the Pipeline

`brightness` is a **color** transform. Used to remap modulator colors into signed ranges (e.g. `brightness(-0.5)` centers noise/voronoi modulators around zero for bidirectional [`modulate`](../modulate/modulate.md)).

## Composition Examples

```js
// Centrar modulador para empuje bidireccional en feedback
src(o0).modulate(
  osc(6, 0, 1.5).modulate(noise(3).sub(gradient()), 1).brightness(-0.5),
  0.003
).layer(osc(30, 0.1, 1.5).mask(shape(4, 0.3, 0))).out(o0)

src(o0).modulate(
  gradient().pixelate(2, 2).brightness(-0.5),
  -0.1
).layer(osc(30, 0.1, 1.5).mask(shape(4, 0.3, 0))).out(o0)
```

## Common Uses & Pitfalls

- Negative brightness offsets are common in feedback/remapping recipes, not only for "making things brighter."

## Related Functions

- [`contrast`](contrast.md) — stretch dynamic range
- [`modulate`](../modulate/modulate.md) — consumer of centered modulators
- [`solid`](../sources/solid.md) — `add(solid(1,1), -0.5)` alternative for [-0.5, 0.5] range
