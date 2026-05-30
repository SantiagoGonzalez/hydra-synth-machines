# `repeat(repsX, repsY, offsetX, offsetY)`

> Repite el patrón en una cuadrícula; incluye variantes por eje.

## Parameters

### `repeat(repsX, repsY, offsetX, offsetY)`

| Param | Default | Effect |
|-------|---------|--------|
| `repsX` | `3` | Horizontal tile count |
| `repsY` | `3` | Vertical tile count |
| `offsetX` | `0` | Scroll every other column (staggered grids) |
| `offsetY` | `0` | Scroll every other row |

### `repeatX(reps, offset)` / `repeatY(reps, offset)`

Repeat along a single axis only. Same `offset` stagger semantics on that axis.

## Role in the Pipeline

`repeat` is a **geometry** transform. It tiles the current pattern across the viewport. Combine with [`scale`](scale.md) so shrunken tiles fill the frame, or with [`scroll`](scroll.md) for animated grids.

## Composition Examples

```js
// Rejilla de cuadrados
var n = 4
var a = () => shape(4, 0.4).repeat(n, n)
a().add(a().scroll(0.5 / n, 0.5 / n)).out()

// Rejilla escalada con offset alternado
shape(4, 0.4).scale(1, 1, 2).repeat(4, 8, 0.5).out()

// Polka dots
shape(999, 0.4).repeat(8, 8).rotate(Math.PI / 4).out()

// Con modulateScale para repetición por escala
shape(999).repeat(1, 1).modulateScale(noise(8, 0).pixelate(8, 8).add(solid(1, 1)).color(0.5, 0.5).posterize(4, 1), -1.3, 1).out()
```

## Common Uses & Pitfalls

- `repeat(1, 1)` with [`modulateScale`](../modulate/modulateScale.md) prevents a lone tiny shape when the pattern is shrunk.
- Stagger parameters (3rd/4th args) create brick-wall and polka-dot layouts without extra sources.
- High repeat counts with complex inner chains are GPU-intensive.

## Related Functions

- [`scale`](scale.md) — control cell size before repeating
- [`scroll`](scroll.md) — animate tiled grids
- [`modulateRepeat`](../modulate/modulateRepeat.md) — repeat count driven by modulator (TODO: detail)
