# `modulatePixelate(texture, multiple, offset)`

> Aplica pixelación cuya intensidad depende del modulador.

## Parameters

| Param | Effect |
|-------|--------|
| `texture` | Modulator |
| `multiple` | Pixelation multiplier (e.g. `1024`) |
| `offset` | Pixel block offset (e.g. `16`) |

## Role in the Pipeline

`modulatePixelate` is a **modulate** transform. At default settings it can look similar to [`modulate`](modulate.md). Apply [`pixelate`](../geometry/pixelate.md) to the **inner modulator** for visible block structure.

## Composition Examples

```js
osc(40, 0, 2).modulatePixelate(noise(3, 0)).out(o2)

osc(40, 0, 2).modulatePixelate(noise(3, 0).pixelate(16, 16), 1024, 16).out(o2)

noise(3, 0).modulatePixelate(noise(3, 0).pixelate(16, 16), 1024, 16).out(o2)
```

## Common Uses & Pitfalls

- Strategy: `noise().pixelate(16,16)` inside `modulatePixelate(..., 1024, 16)`.
- Compare side-by-side with plain `modulate` using `render()` and separate buffers.

## Related Functions

- [`pixelate`](../geometry/pixelate.md) — spatial block size
- [`modulate`](modulate.md) — smooth warp alternative
- [`posterize`](../color/posterize.md) — color-level quantization
