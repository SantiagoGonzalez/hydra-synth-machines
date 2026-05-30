# `modulateRotate(texture, amount)`

> Rota las coordenadas de muestreo según el modulador.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `texture` | — | Modulator |
| `amount` | — | Rotation strength |

## Role in the Pipeline

`modulateRotate` is a **modulate** transform. Swirls and vortex effects when paired with [`osc`](../sources/osc.md) and [`kaleid`](../geometry/kaleid.md).

## Composition Examples

```js
osc(40, 0.1, 1).hue(-0.1)
  .modulate(noise(1, 0), 0.5)
  .modulateRotate(osc(12, 0).kaleid(100), 4)
  .out(o1)

src(o0).modulateRotate(noise(2, 0), 0.03).hue(0.003).out(o0)
```

## Common Uses & Pitfalls

- Small `amount` (0.01–0.03) in feedback loops for controlled swirl.
- Kaleidoscoped modulators create complex symmetric rotation fields.

## Related Functions

- [`rotate`](../geometry/rotate.md) — uniform rotation, not modulator-driven
- [`modulate`](modulate.md) — translation distortion
- [`kaleid`](../geometry/kaleid.md) — on modulator chain
