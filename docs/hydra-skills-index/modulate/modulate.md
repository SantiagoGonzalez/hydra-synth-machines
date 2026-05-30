# `modulate(texture, amount)`

> Desplaza la posición de muestreo de cada píxel según los canales R y G de la textura moduladora.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `texture` | — | Modulator source (often `noise()`, `osc()`, or `src(o1)`) |
| `amount` | `0.1` | Displacement strength |

## Role in the Pipeline

`modulate` is a **modulate** transform — the core distortion operator in Hydra. For each output pixel at `(x, y)`, samples the input at approximately:

```
(x + modulator.red * amount, y + modulator.green * amount)
```

(Push direction is opposite to positive X/Y in screen space — grayscale modulators push toward upper-left with varying strength.)

**Blue channel is ignored** by `modulate` (use [`modulateHue`](modulateHue.md) for blue involvement).

## Composition Examples

```js
osc(40, 0, 1).modulate(noise(3, 0)).out()

osc(40, 0, 1).modulate(noise(3, 0).luma(0.5, 0.5)).out()

noise(10, 0).modulate(o0).blend(o0, 0.9).out(o0)

// Bidireccional: centrar modulador
src(o2).modulate(src(o1).add(solid(1, 1), -0.5), 0.01).blend(o0, 0.01).out(o2)

// Remapeo de paleta
gradient().modulate(noise(3, 0).add(gradient(), -1), 1).out()
```

## Common Uses & Pitfalls

- **Two perspectives** (Hydra Book): (1) distorts the base texture; (2) "paints" the modulator pattern with base texture colors.
- Grayscale modulators → displacement mostly upper-left; add [`color`](../color/color.md) / `solid(1,1,-0.5)` for omnidirectional push.
- Keep `amount` small (0.001–0.1) in feedback; large values explode quickly.
- Apply [`luma`](../color/luma.md) to modulator for conditional distortion.

## Related Functions

- [`modulateScale`](modulateScale.md) — scale UVs by R/G instead of translate
- [`modulateHue`](modulateHue.md) — uses G and B; bidirectional shift
- [`noise`](../sources/noise.md) — default modulator texture
