# `layer(texture)`

> Superpone la textura argumento respetando alpha; la capa superior reemplaza donde es opaca.

## Parameters

| Param | Effect |
|-------|--------|
| `texture` | Layer to composite on top |

## Role in the Pipeline

`layer` is a **blend** operator — the standard **compositor** for multi-element scenes. Works with [`luma`](../color/luma.md)-cut textures for partial overlays. Primary tool for injecting new content into feedback loops each frame.

## Composition Examples

```js
osc(200, 0, 1).rotate(1).layer(osc(30, 0, 1).luma(0.5, 0.01)).out()

src(o0).scroll(0.003, 0.006)
  .layer(osc(30, 0.1, 1.5).mask(shape(4, 0.3, 0.01))).out(o0)

// Capas de paleta por intensidad (5 colores)
colorize(func, url)  // ver Hydra Book — múltiples .layer encadenados
```

## Common Uses & Pitfalls

- Input layers should have meaningful **alpha** (`luma`, `mask`, or transparent sources) for partial overlap.
- In feedback, `layer` injects fresh content without destroying accumulated `src(o0)` history.

## Related Functions

- [`blend`](blend.md) — linear interpolation mix
- [`mask`](mask.md) — prepare alpha for layering
- [`add`](add.md) — additive, not alpha-aware
