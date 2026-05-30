# `shift(r, g, b, a)`

> Desplaza los canales de color de forma independiente.

## Parameters

| Param | Default | Effect |
|-------|---------|--------|
| `r`, `g`, `b`, `a` | channel offsets | Per-channel shift amounts |

## Role in the Pipeline

`shift` is a **color** transform listed in the [official function reference](https://hydra.ojack.xyz/functions/) under Color.

> **TODO:** Detailed behavior, defaults, and composition examples not found in primary sources (Hydra Book / fetched reference pages). Verify in the interactive reference before relying on parameter semantics.

## Composition Examples

```js
// TODO: add verified examples from https://hydra.ojack.xyz/functions/
```

## Common Uses & Pitfalls

- Listed alongside [`color`](color.md) and channel accessors; likely used for chromatic aberration-style effects — confirm in editor.

## Related Functions

- [`color`](color.md) — channel remapping
- [`hue`](hue.md) — HSV hue rotation
- [`channels`](channels.md) — `r`, `g`, `b`, `a`, `sum`
