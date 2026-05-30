# `colorama(amount)`

> Cicla los valores HSV y aplica `fract`, produciendo cambios de color impredecibles y vibrantes.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `amount` | `0.005` | Amount added to HSV before fract wrap |

## Role in the Pipeline

`colorama` is a **color** transform. Unlike [`hue`](hue.md), it shifts hue, saturation, and value, then wraps with `fract` (equivalent to `x % 1`), causing discontinuities when values exceed 1. Great for psychedelic feedback; harsh at positive small amounts.

## Composition Examples

```js
osc(30, 0, 1).out(o0)
osc(30, 0, 1).colorama(0.01).out(o1)
render()

// Efecto más suave con valor negativo
osc(30, 0, 1).colorama(-0.1).out()
```

## Common Uses & Pitfalls

- **Unpredictability**: `fract` wraps values > 1 back to 0, causing sudden color jumps.
- **Negative `amount`**: gentler, less harsh cycling (Hydra Book recommendation).
- Pairs well with [`noise`](../sources/noise.md) for vivid evolving textures.

## Related Functions

- [`hue`](hue.md) — controlled hue-only shift
- [`posterize`](posterize.md) — another way to quantize color appearance
- [`invert`](invert.md) — complementary dramatic color change
