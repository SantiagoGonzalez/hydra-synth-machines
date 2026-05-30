# `modulateRepeat` / `modulateRepeatX` / `modulateRepeatY`

> Repite el patrón con parámetros de repetición controlados por el modulador.

## Functions

| Function | Axis |
|----------|------|
| `modulateRepeat(texture, ...)` | Both X and Y |
| `modulateRepeatX(texture, ...)` | Horizontal only |
| `modulateRepeatY(texture, ...)` | Vertical only |

## Role in the Pipeline

**Modulate** family listed in the [official function reference](https://hydra.ojack.xyz/functions/). Analogous to [`repeat`](../geometry/repeat.md) but repeat counts/offsets driven by modulator texture colors.

> **TODO:** Parameter list, defaults, and verified examples not found in primary sources. Confirm at https://hydra.ojack.xyz/functions/ before documenting exact signatures.

## Composition Examples

```js
// TODO: add verified examples from interactive reference
```

## Common Uses & Pitfalls

- Likely pairs with [`pixelate`](../geometry/pixelate.md) or [`posterize`](../color/posterize.md) on modulator for stepped repeat counts (pattern from `modulateScale` + `repeat` recipes).

## Related Functions

- [`repeat`](../geometry/repeat.md) — fixed repeat counts
- [`modulateScale`](modulateScale.md) — scale-driven tiling alternative
- [`modulate`](modulate.md) — base modulation
