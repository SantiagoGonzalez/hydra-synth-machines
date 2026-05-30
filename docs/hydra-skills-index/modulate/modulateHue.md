# `modulateHue(texture, amount)`

> Variante de modulación que usa canales G y B (no el matiz HSV pese al nombre); permite desplazamiento bidireccional.

## Parameters

| Param | Effect |
|-------|--------|
| `texture` | Modulator |
| `amount` | Displacement strength |

## Role in the Pipeline

`modulateHue` shifts sampling by `(g - r, b - g)` per modulator pixel — **bidirectional** unlike [`modulate`](modulate.md) (R/G only, effectively one quadrant bias). Blue channel participates; name is misleading vs HSV [`hue`](../color/hue.md).

Official GLSL behavior (Hydra Book):

```
return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0/resolution);
```

## Composition Examples

```js
osc(10, 0, 1).modulate(noise(2, 0), 0.5).hue(-0.1).out(o1)
src(o2).modulateHue(o1, 8).blend(o0, 0.01).out(o2)

src(o0).modulateHue(src(o0).scale(1.01), 1)
  .layer(osc(30, 0.1, 1.5).mask(shape(4, 0.3, 0))).out(o0)
```

## Common Uses & Pitfalls

- `src(o0).scale(1.01)` prevents pixels freezing in self-`modulateHue` feedback.
- Large `amount` (e.g. `8`) creates extreme warps — use in multi-buffer chains with [`blend`](../blend/blend.md) damping.

## Related Functions

- [`modulate`](modulate.md) — R/G translation only
- [`hue`](../color/hue.md) — actual HSV hue shift on colors
- [`blend`](../blend/blend.md) — feedback damping partner
