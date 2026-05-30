# `mask(texture)`

> Usa la luminancia de la textura argumento como máscara; reemplaza el canal alpha.

## Parameters

| Param | Effect |
|-------|--------|
| `texture` | Mask source (luminance drives visibility) |

## Role in the Pipeline

`mask` is a **blend** operator. Only luminance of the mask matters; RGB is multiplied by that luminance and **alpha is set to mask luminance**. Enables [`layer`](layer.md) compositing where [`mult`](mult.md) would block the background.

## Composition Examples

```js
osc(10, 0, 1).hue(0.5).layer(osc(10, 0, 1).mask(shape(4, 0.5, 0.001))).out()

voronoi(10, 0, 0).thresh(0.5, 0).mask(shape(4, 0.8, 0.0)).diff(src(o0).scale(0.9)).out(o0)

src(o0).scroll(0.003, 0.006)
  .layer(osc(30, 0.1, 1.5).mask(shape(4, 0.3, 0.01))).out(o0)
```

## Common Uses & Pitfalls

- **vs `mult`**: identical-looking in Hydra UI preview but different alpha — `mask` lets layers beneath show through.
- Sharp masks: use [`shape`](../sources/shape.md) with low `smoothing` (near 0).

## Related Functions

- [`mult`](mult.md) — multiply without alpha replacement
- [`luma`](../color/luma.md) — alternative transparency path
- [`layer`](layer.md) — stack masked results
