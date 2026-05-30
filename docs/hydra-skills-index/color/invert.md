# `invert(amount)`

> Invierte los valores de color (negativo fotográfico).

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `amount` | `1` | Inversion strength |

## Role in the Pipeline

`invert` is a **color** transform. Quick way to flip polarity of shapes or masks. Used in demo masks for kaleid wedge visualization.

## Composition Examples

```js
shape(1, 0, 0).invert().rotate(Math.PI / 4)  // máscara de demostración

// Challenge-style: distorsión de color
noise(4, 0.1).colorama(0.01).invert().out()
```

## Common Uses & Pitfalls

- Inverting before [`luma`](luma.md) changes which regions pass threshold masks.

## Related Functions

- [`diff`](../blend/diff.md) — absolute difference between textures
- [`thresh`](thresh.md) — binary cutoff
- [`colorama`](colorama.md) — alternative dramatic color shift
