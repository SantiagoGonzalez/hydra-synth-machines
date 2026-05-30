# `luma(threshold, tolerance)`

> Enmascara por luminosidad preservando el color de las zonas brillantes; devuelve transparencia en zonas oscuras.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `threshold` | `0.5` | Luminance cutoff |
| `tolerance` | `0.1` | Edge softness (cannot be `0`) |

## Role in the Pipeline

`luma` is a **color** transform that outputs **alpha transparency** in dark regions. Essential for [`layer`](../blend/layer.md) compositing and conditional [`modulate`](../modulate/modulate.md) (apply modulation only where modulator is bright).

## Composition Examples

```js
osc(30, 0, 1).luma(0.5, 0.01).out()

// Capas superpuestas
osc(200, 0, 1).rotate(1).layer(osc(30, 0, 1).luma(0.5, 0.01)).out()

// Modulación condicional
osc(40, 0, 1).modulate(noise(3, 0).luma(0.5, 0.5)).out()

// Sombra
f().saturate(0).luma(0.2, 0.2).color(0, 0, 0, 1)
```

## Common Uses & Pitfalls

- **`tolerance` cannot be 0** — use a tiny value like `0.0001` for hard edges.
- On [`noise`](../sources/noise.md) (range [-1,1]), negative values clip when buffered; `luma(-epsilon, 0)` reveals clipping artifacts vs normalized noise.
- Applying `luma` to the **modulator** restricts where distortion appears.

## Related Functions

- [`thresh`](thresh.md) — hard binary mask; does not preserve soft color the same way
- [`mask`](../blend/mask.md) — luminance-based blending with another texture
- [`layer`](../blend/layer.md) — primary compositor for luma-cut shapes
