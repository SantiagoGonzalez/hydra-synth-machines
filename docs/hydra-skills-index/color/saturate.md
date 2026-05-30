# `saturate(amount)`

> Ajusta la saturación del color; `0` convierte a escala de grises.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `amount` | `0.5` | Saturation multiplier; `0` = grayscale |

## Role in the Pipeline

`saturate` is a **color** transform. Use to desaturate for shadow masks or boost vividness before [`luma`](luma.md) masking.

## Composition Examples

```js
// Sombra: escala de grises + luma + color negro
var f = () => osc(30, 0, 1)
osc(200, 0, 1).rotate(1)
  .layer(f().saturate(0).luma(0.2, 0.2).color(0, 0, 0, 1))
  .layer(f().luma(0.5, 0.01)).out()
```

## Common Uses & Pitfalls

- `saturate(0)` is the first step in shadow-generation recipes before `luma` + `color(0,0,0,1)`.

## Related Functions

- [`luma`](luma.md) — masking after desaturation
- [`color`](color.md) — remap grayscale to alpha/color
- [`hue`](hue.md) — hue shift without touching saturation
