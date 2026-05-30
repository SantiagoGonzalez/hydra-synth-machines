# `mult(texture)`

> Multiplica los valores de color canal por canal; alpha se multiplica independientemente.

## Parameters

| Param | Effect |
|-------|--------|
| `texture` | Texture to multiply with current chain |

## Role in the Pipeline

`mult` is a **blend** operator. Each R, G, B, A channel multiplies independently. Resulting alpha stays opaque if both inputs are opaque — **underlying layers remain hidden** unless alpha is modified.

## Composition Examples

```js
osc(10, 0, 1).hue(0.5).layer(osc(10, 0, 1).mult(shape(4, 0.5, 0.001))).out()

// RGB pixel filter
pix().mult(func().color(1, 0, 0).pixelate(n, n)).out(o1)

src(o2).contrast(2).mult(src(o1)).out(o3)

src(o2).luma(0.3, 0.3).mult(o1).out(o3)
```

## Common Uses & Pitfalls

- **vs [`mask`](mask.md)**: `mult` does not replace alpha with luminance; use `mask` or `mult(...luma())` for see-through overlays.
- Dark regions zero out color — good for tinting, bad for transparent compositing.

## Related Functions

- [`mask`](mask.md) — luminance-based alpha overwrite
- [`layer`](layer.md) — proper alpha compositing
- [`luma`](../color/luma.md) — add transparency to mult for mask-like behavior
