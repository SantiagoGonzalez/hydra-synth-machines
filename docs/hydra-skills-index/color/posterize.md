# `posterize(levels, amount)`

> Reduce el número de niveles de color, creando bandas discretas.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `levels` | `3` | Number of color levels |
| `amount` | `1` | Effect strength |

## Role in the Pipeline

`posterize` is a **color** transform. When applied to modulators inside [`modulate`](../modulate/modulate.md) chains, it creates stepped displacement fields. Values from posterize are always **< 1** per level count, useful for controlled [`modulateScale`](../modulate/modulateScale.md).

## Composition Examples

```js
osc(10, 0, 1).modulate(noise(2, 0), 0.5).posterize(4).out(o1)

shape(999).repeat(1, 1)
  .modulateScale(
    noise(8, 0).pixelate(8, 8).add(solid(1, 1)).color(0.5, 0.5).posterize(4, 1),
    -1.3, 1
  ).out()
```

## Common Uses & Pitfalls

- Posterized modulators produce stair-stepped distortion, not smooth warps.

## Related Functions

- [`thresh`](thresh.md) — two-level cutoff
- [`pixelate`](../geometry/pixelate.md) — spatial quantization
- [`modulateScale`](../modulate/modulateScale.md) — common consumer
