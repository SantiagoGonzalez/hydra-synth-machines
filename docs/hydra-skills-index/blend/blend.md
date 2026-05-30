# `blend(texture, amount)`

> Mezcla linealmente con la textura argumento; esencial para atenuar feedback.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `texture` | — | Blend source (often `o0` in feedback) |
| `amount` | `0.5` | Mix ratio; `1` = full texture, `<1` = fade |

## Role in the Pipeline

`blend` is a **blend** operator. Critical for **feedback damping**: `blend(o0, 0.9)` retains 90% of previous frame, preventing runaway brightness in self-modulating loops.

## Composition Examples

```js
noise(10, 0).modulate(o0).blend(o0, 0.9).out(o0)

voronoi(10, 0).modulate(o0).blend(o0, 0.9).out(o0)

src(o2).modulateHue(o1, 8).blend(o0, 0.03).out(o2)

src(o2).modulate(src(o1).add(solid(1, 1), -0.5), 0.01).blend(o0, 0.01).out(o2)
```

## Common Uses & Pitfalls

- **`amount` close to 1** (0.9–0.99): slow feedback decay, smooth trails.
- **`amount` very small** (0.01–0.03): subtle compositing between buffers without full feedback.
- Without `blend` in self-modulating `out(o0)` loops, frames saturate or blow out quickly.

## Related Functions

- [`src`](../sources/src.md) — read buffer for feedback
- [`modulate`](../modulate/modulate.md) — often precedes blend in feedback
- [`layer`](layer.md) — discrete overlay vs temporal mix
