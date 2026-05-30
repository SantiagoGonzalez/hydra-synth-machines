# `thresh(threshold, tolerance)`

> Convierte la imagen en blanco y negro según un umbral de luminancia.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `threshold` | `0.5` | Cutoff luminance |
| `tolerance` | `0.04` | Edge softness around threshold |

## Role in the Pipeline

`thresh` is a **color** transform producing high-contrast binary-like output. Used with [`voronoi`](../sources/voronoi.md) sharp edges (`voronoi(10,0,0)`) and feedback [`diff`](../blend/diff.md) loops for crisp periodic textures.

## Composition Examples

```js
voronoi(10, 0, 0).thresh(0.5, 0).diff(src(o0).scale(0.9)).out(o0)

voronoi(10, 0, 0).thresh(0.5, 0).mask(shape(4, 0.8, 0.0)).diff(src(o0).scale(0.9)).out(o0)
```

## Common Uses & Pitfalls

- Similar to [`luma`](luma.md) but does not preserve soft color in the same way for layering.
- `tolerance` at `0` gives hard edges; pair with [`mask`](../blend/mask.md) to constrain voronoi feedback.

## Related Functions

- [`luma`](luma.md) — soft mask with color preservation
- [`posterize`](posterize.md) — quantize to N levels instead of binary
- [`diff`](../blend/diff.md) — feedback edge emphasis
