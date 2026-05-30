# `src(buffer)`

> Lee una textura desde un buffer de salida (o fuente externa), permitiendo referenciar el fotograma previo de un buffer para crear bucles de retroalimentación.

## Parameters

| Param | Type | Effect |
|-------|------|--------|
| `buffer` | `o0`–`o3` or external source | The output buffer or external source to sample |

## Role in the Pipeline

`src` is a **source** (buffer reader). It reads a previously rendered output buffer (`o0`, `o1`, `o2`, `o3`) or an external source (`s0`–`s3`) back into a new chain. This is the primary mechanism for:

1. **Feedback loops**: reading the current buffer as input to itself creates per-frame accumulation.
2. **Multi-buffer composition**: one buffer processes and writes to another, which a third chain reads.

> **Important**: writing to a buffer clips values to [0, 1]. So `src(o0)` always returns pixels in [0, 1], even if the chain that produced `o0` computed values outside that range.

## Composition Examples

```js
// Bucle de retroalimentación básico: el buffer se lee y reescribe a sí mismo
src(o0).scroll(0.003, 0.006).layer(osc(30, 0.1, 1.5).mask(shape(4, 0.3, 0.01))).out(o0)

// Feedback con modulación de escala
src(o0).modulateScale(osc(6, 0.5), 0.01).layer(osc(30, 0.1, 1.5).mask(shape(4, 0.3, 0))).out(o0)

// Composición multi-buffer: o1 alimenta a o0
osc(40, 0.1).out(o1)
src(o1).hue(0.1).out(o0)

// Remapeo de color: leer o0 después de clipear
noise(4).out(o0)
src(o0).add(solid(1, 1, 1), 0.5).out(o1)
```

## Common Uses & Pitfalls

- **Buffer clipping**: values written to a buffer are clamped to [0, 1]. Reading the same buffer will never return negative values, unlike inline `noise()`.
- **Feedback control**: feedback loops grow exponentially without damping. Use `blend(o0, t)` with `t < 1` (e.g. `0.9`) to fade old frames, or keep modulation `amount` values very small (0.001–0.01).
- **Order of evaluation**: buffers are evaluated in the order they are declared in the sketch. If `o1` depends on `o0`, declare `o0`'s chain first.

## Related Functions

- [Synth settings: `.out()`](../synth-settings/synth-settings.md) — writes a chain to a buffer, which `src` then reads
- [`blend`](../blend/blend.md) — essential for feedback damping
- [`layer`](../blend/layer.md) — inject new content into a feedback loop each frame
- [`prev`](prev.md) — a shorthand for the previous frame of the current output
