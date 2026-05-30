# `modulateScrollX` / `modulateScrollY`

> Desplaza coordenadas según el modulador; similar a scroll pero con envolvente de textura.

## Functions

| Function | Effect |
|----------|--------|
| `modulateScrollX(texture, amount)` | Horizontal scroll driven by modulator |
| `modulateScrollY(texture, amount)` | Vertical scroll driven by modulator |

## Role in the Pipeline

**Modulate** variants of [`scroll`](../geometry/scroll.md). Hydra Book notes `modulateScrollX` can achieve effects **similar to [`modulateScale`](modulateScale.md)** but involves **texture wrapping** → visible discontinuities unlike scaling.

## Composition Examples

```js
// TODO: add verified examples from https://hydra.ojack.xyz/functions/
```

## Common Uses & Pitfalls

- Prefer plain [`scrollX`](../geometry/scroll.md) in feedback loops when smooth drift matters.
- Use when intentional seam/wrap artifacts are desired.

## Related Functions

- [`scroll`](../geometry/scroll.md) — non-modulated scroll
- [`modulateScale`](modulateScale.md) — similar motion without wrap (per Hydra Book)
- [`modulate`](modulate.md) — general displacement
