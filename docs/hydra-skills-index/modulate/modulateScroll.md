# `modulateScrollX` / `modulateScrollY`

> Desplaza coordenadas según el modulador; similar a scroll pero con envolvente de textura.

## Functions

| Function | Effect |
|----------|--------|
| `modulateScrollX(texture, scrollX, speed)` | Horizontal scroll driven by modulator |
| `modulateScrollY(texture, scrollY, speed)` | Vertical scroll driven by modulator |

> **Launchpad:** el pad `modulateScroll` no existe en hydra-synth; el compilador lo expande a `.modulateScrollX(tex, scrollX, speedX).modulateScrollY(tex, scrollY, speedY)` con el mismo modulador en ambos ejes.

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
