# `contrast(amount)`

> Aumenta o reduce el contraste alrededor del punto medio.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `amount` | `1.6` | Contrast multiplier |

## Role in the Pipeline

`contrast` is a **color** transform. Applied late in chains to punch up detail before output or after multi-buffer compositing.

## Composition Examples

```js
src(o2).contrast(2).mult(src(o1)).out(o3)
```

## Common Uses & Pitfalls

- High contrast values can clip highlights/shadows when combined with [`mult`](../blend/mult.md).

## Related Functions

- [`brightness`](brightness.md) — offset luminance
- [`thresh`](thresh.md) — hard cutoff vs smooth contrast
- [`luma`](luma.md) — selective contrast via masking
